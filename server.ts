import 'dotenv/config';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type Request, type Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, ThinkingLevel, Type, type FunctionDeclaration, type FunctionResponse, type LiveServerMessage } from '@google/genai';
import { optionalAuth, requireAuth, type AuthRequest } from './src/middleware/auth.ts';
import {
  createOrAppendChatTurn,
  createUserProject,
  deleteUserAsset,
  deleteUserProject,
  getThreadMessages,
  listUserAssets,
  listUserProjects,
  listUserScoutReports,
  listUserThreads,
  saveScoutReport,
  saveUserAsset,
  syncOrFetchUser,
} from './src/db/queries.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const cliPortIdx = process.argv.indexOf('--port');
const cliPort =
  cliPortIdx !== -1 && process.argv[cliPortIdx + 1]
    ? Number(process.argv[cliPortIdx + 1])
    : null;
const PORT = cliPort || (isProduction ? Number(process.env.PORT || 3000) : 3000);

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is missing. Please verify your attached API key in Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function parseDataUrl(input: string): { mimeType: string; data: string } | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  const match = trimmed.match(/^data:([^;,]+);base64,([\s\S]+)$/);
  if (match) {
    return {
      mimeType: match[1].trim(),
      data: match[2].replace(/\s+/g, ''),
    };
  }
  return null;
}

function formatGeminiError(error: unknown): { status: number; message: string } {
  const raw = error instanceof Error ? error.message : String(error || 'Unknown Gemini API error');
  const upper = raw.toUpperCase();

  if (upper.includes('PERMISSION_DENIED') || upper.includes('API_KEY_INVALID') || upper.includes('403')) {
    return {
      status: 403,
      message: `${raw} — Check or select a valid API key in the Settings > Secrets panel.`,
    };
  }
  if (upper.includes('RESOURCE_EXHAUSTED') || upper.includes('429')) {
    return {
      status: 429,
      message: `${raw} — Quota reached. Upgrading to a billing-enabled API key in Settings > Secrets increases quota for paid models.`,
    };
  }
  return {
    status: 500,
    message: raw,
  };
}

const PERSONA_PROMPTS: Record<string, string> = {
  showrunner:
    'You are an acclaimed cinema showrunner and screenplay architect inside Cina Studio. Craft vivid dramatic beats, subtext-rich dialogue, scene breakdowns, and branching narrative arcs with concise, high-taste precision.',
  cinematographer:
    'You are an award-winning Director of Photography and visual worldbuilder inside Cina Studio. Specify focal lengths, lighting ratios, camera movement, film stock textures, blocking, and color palettes.',
  producer:
    'You are an executive film producer, festival strategist, and financing architect inside Cina Studio. Structure budgets, shooting schedules, festival positioning, audience hooks, and recoupment waterfalls clearly.',
  editor:
    'You are a master film editor and rhythm consultant inside Cina Studio. Tighten pacing, sharpen scene transitions, diagnose structural drag, and propose bold montage or sound-bridge cuts.',
};

const ALLOWED_CHAT_MODELS = new Set([
  'gemini-4-carbon',
  'gemini-4-argon',
  'gemini-4-hydrogen',
  'gemini-3.1-flash-lite',
]);

const ALLOWED_VOICES = new Set(['Zephyr', 'Kore', 'Charon', 'Fenrir', 'Puck']);

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // ─── Health Check ──────────────────────────────────────────────────────────
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  // ─── Cloud SQL + Firebase Auth Studio Vault Endpoints ──────────────────────
  app.post('/api/vault/bootstrap', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const tokenUser = req.user!;
      const profile = await syncOrFetchUser({
        uid: tokenUser.uid,
        email: tokenUser.email || '',
        displayName: tokenUser.name || (typeof req.body?.displayName === 'string' ? req.body.displayName : ''),
        photoUrl: tokenUser.picture || (typeof req.body?.photoUrl === 'string' ? req.body.photoUrl : ''),
      });
      const [projects, assets, threads, scouts] = await Promise.all([
        listUserProjects(tokenUser.uid),
        listUserAssets(tokenUser.uid),
        listUserThreads(tokenUser.uid),
        listUserScoutReports(tokenUser.uid),
      ]);
      res.json({ profile, projects, assets, threads, scouts });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unable to load studio vault.';
      res.status(500).json({ error: msg });
    }
  });

  app.get('/api/vault/projects', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const projects = await listUserProjects(req.user!.uid);
      res.json({ projects });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unable to load projects.';
      res.status(500).json({ error: msg });
    }
  });

  app.post('/api/vault/projects', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { title, logline = '', genre = 'Cinema', aspectRatio = '16:9' } = req.body || {};
      if (!title || typeof title !== 'string' || !title.trim()) {
        res.status(400).json({ error: 'Project title is required.' });
        return;
      }
      await syncOrFetchUser({
        uid: req.user!.uid,
        email: req.user!.email || '',
        displayName: req.user!.name || '',
        photoUrl: req.user!.picture || '',
      });
      const project = await createUserProject({
        uid: req.user!.uid,
        title,
        logline: String(logline),
        genre: String(genre),
        aspectRatio: String(aspectRatio),
      });
      res.json({ project });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unable to create project.';
      res.status(500).json({ error: msg });
    }
  });

  app.delete('/api/vault/projects/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const projectId = Number(req.params.id);
      if (!Number.isFinite(projectId)) {
        res.status(400).json({ error: 'Invalid project ID.' });
        return;
      }
      await deleteUserProject(req.user!.uid, projectId);
      res.json({ ok: true });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unable to delete project.';
      res.status(500).json({ error: msg });
    }
  });

  app.get('/api/vault/assets', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const projectId = req.query.projectId ? Number(req.query.projectId) : null;
      const assets = await listUserAssets(req.user!.uid, Number.isFinite(projectId) ? projectId : null);
      res.json({ assets });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unable to load vault assets.';
      res.status(500).json({ error: msg });
    }
  });

  app.post('/api/vault/assets', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const {
        projectId = null,
        kind,
        title,
        prompt = '',
        modelUsed = 'gemini-4-hydrogen',
        mediaDataUrl = '',
        textBody = '',
        interactionId = '',
        aspectRatio = '16:9',
      } = req.body || {};

      if (!['image', 'video', 'music', 'transcript'].includes(kind)) {
        res.status(400).json({ error: 'Invalid asset kind.' });
        return;
      }

      await syncOrFetchUser({
        uid: req.user!.uid,
        email: req.user!.email || '',
        displayName: req.user!.name || '',
        photoUrl: req.user!.picture || '',
      });

      const asset = await saveUserAsset({
        uid: req.user!.uid,
        projectId: typeof projectId === 'number' ? projectId : null,
        kind,
        title: String(title || 'Studio Take'),
        prompt: String(prompt),
        modelUsed: String(modelUsed),
        mediaDataUrl: String(mediaDataUrl),
        textBody: String(textBody),
        interactionId: String(interactionId),
        aspectRatio: String(aspectRatio),
      });
      res.json({ asset });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unable to save asset.';
      res.status(500).json({ error: msg });
    }
  });

  app.delete('/api/vault/assets/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const assetId = Number(req.params.id);
      if (!Number.isFinite(assetId)) {
        res.status(400).json({ error: 'Invalid asset ID.' });
        return;
      }
      await deleteUserAsset(req.user!.uid, assetId);
      res.json({ ok: true });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unable to delete asset.';
      res.status(500).json({ error: msg });
    }
  });

  app.get('/api/vault/threads', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const threads = await listUserThreads(req.user!.uid);
      res.json({ threads });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unable to load conversation threads.';
      res.status(500).json({ error: msg });
    }
  });

  app.get('/api/vault/threads/:id/messages', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const threadId = Number(req.params.id);
      if (!Number.isFinite(threadId)) {
        res.status(400).json({ error: 'Invalid thread ID.' });
        return;
      }
      const messages = await getThreadMessages(req.user!.uid, threadId);
      res.json({ messages });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unable to load thread messages.';
      res.status(500).json({ error: msg });
    }
  });

  app.get('/api/vault/scouts', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const scouts = await listUserScoutReports(req.user!.uid);
      res.json({ scouts });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unable to load scout dossiers.';
      res.status(500).json({ error: msg });
    }
  });

  // ─── 1. Multi-Turn Gemini Writers' Room & Director's Table ─────────────────
  app.post('/api/ai/chat', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const {
        model: requestedModel = 'gemini-4-carbon',
        persona = 'showrunner',
        history = [],
        message = '',
        imageDataUrl = '',
        projectContext = '',
        threadId = null,
        projectId = null,
        persist = true,
      } = req.body || {};

      const cleanMessage = String(message || '').trim();
      if (!cleanMessage) {
        res.status(400).json({ error: 'Please enter a prompt or scene direction.' });
        return;
      }

      const model = ALLOWED_CHAT_MODELS.has(requestedModel) ? requestedModel : 'gemini-4-hydrogen';
      const baseInstruction = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.showrunner;
      const systemInstruction = projectContext
        ? `${baseInstruction}\n\nActive Production Slate Context:\n${String(projectContext).slice(0, 1500)}`
        : baseInstruction;

      const contents: Array<{
        role: 'user' | 'model';
        parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
      }> = [];

      if (Array.isArray(history)) {
        for (const turn of history.slice(-24)) {
          if (!turn || typeof turn.content !== 'string' || !turn.content.trim()) continue;
          const role = turn.role === 'model' ? 'model' : 'user';
          contents.push({
            role,
            parts: [{ text: turn.content }],
          });
        }
      }

      const userParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
      const parsedImg = parseDataUrl(imageDataUrl);
      if (parsedImg) {
        userParts.push({ inlineData: parsedImg });
      }
      userParts.push({ text: cleanMessage });
      contents.push({ role: 'user', parts: userParts });

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
        },
      });

      const replyText = response.text || '';
      let savedThreadId: number | null = typeof threadId === 'number' ? threadId : null;

      if (req.user && persist && replyText) {
        try {
          await syncOrFetchUser({
            uid: req.user.uid,
            email: req.user.email || '',
            displayName: req.user.name || '',
            photoUrl: req.user.picture || '',
          });
          savedThreadId = await createOrAppendChatTurn({
            uid: req.user.uid,
            threadId: savedThreadId,
            projectId: typeof projectId === 'number' ? projectId : null,
            persona: String(persona),
            modelTier: model,
            userText: cleanMessage,
            modelText: replyText,
          });
        } catch (dbErr) {
          console.error('Non-fatal chat persistence warning:', dbErr);
        }
      }

      res.json({
        reply: replyText,
        model,
        threadId: savedThreadId,
      });
    } catch (error: unknown) {
      const formatted = formatGeminiError(error);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // ─── 2. Create & Edit High-Res Cinema Stills (gemini-nano-banana-2.1) ──────
  app.post('/api/ai/image', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const {
        prompt = '',
        sourceImageDataUrl = '',
        aspectRatio = '16:9',
        imageSize = '1K',
        useSearchGrounding = false,
      } = req.body || {};

      const cleanPrompt = String(prompt || '').trim();
      if (!cleanPrompt) {
        res.status(400).json({ error: 'Describe the frame or edit instruction first.' });
        return;
      }

      const validRatios = new Set(['1:1', '3:4', '4:3', '9:16', '16:9', '1:4', '4:1', '1:8', '8:1']);
      const validSizes = new Set(['1K', '2K', '4K']);
      const safeRatio = validRatios.has(aspectRatio) ? aspectRatio : '16:9';
      const safeSize = validSizes.has(imageSize) ? imageSize : '1K';

      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
      const parsedSource = parseDataUrl(sourceImageDataUrl);
      if (parsedSource) {
        parts.push({ inlineData: parsedSource });
      }
      parts.push({ text: cleanPrompt });

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-nano-banana-2.1',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: safeRatio,
            imageSize: safeSize,
          },
          ...(useSearchGrounding
            ? {
                tools: [
                  {
                    googleSearch: {
                      searchTypes: {
                        webSearch: {},
                        imageSearch: {},
                      },
                    },
                  },
                ],
              }
            : {}),
        },
      });

      let imageDataUrl = '';
      let notes = '';

      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data && !imageDataUrl) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageDataUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          notes += (notes ? '\n' : '') + part.text;
        }
      }

      if (!imageDataUrl) {
        res.status(502).json({
          error: notes || 'No image frame was returned by gemini-nano-banana-2.1. Try refining the visual prompt.',
        });
        return;
      }

      const groundingSources: Array<{ title: string; uri: string }> = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      for (const chunk of chunks) {
        if (chunk.web?.uri) {
          groundingSources.push({
            title: chunk.web.title || chunk.web.uri,
            uri: chunk.web.uri,
          });
        }
      }

      res.json({
        imageDataUrl,
        notes,
        model: 'gemini-nano-banana-2.1',
        aspectRatio: safeRatio,
        imageSize: safeSize,
        sources: groundingSources,
      });
    } catch (error: unknown) {
      const formatted = formatGeminiError(error);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // ─── 3. Animate Images & Direct Shots (gemini-omni-1.2-flash Interactions) ─
  app.post('/api/ai/video', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const {
        prompt = '',
        startImageDataUrl = '',
        endImageDataUrl = '',
        previousInteractionId = '',
        aspectRatio = '16:9',
        duration = '8s',
        resolution = '720p',
      } = req.body || {};

      const cleanPrompt = String(prompt || '').trim();
      const parsedStart = parseDataUrl(startImageDataUrl);
      const parsedEnd = parseDataUrl(endImageDataUrl);

      if (!cleanPrompt && !parsedStart) {
        res.status(400).json({ error: 'Provide an image frame and/or camera motion direction.' });
        return;
      }

      const safeAspect: '16:9' | '9:16' = aspectRatio === '9:16' ? '9:16' : '16:9';
      const validResolutions = new Set(['360p', '720p', '1080p', '4k']);
      const safeResolution = validResolutions.has(resolution) ? resolution : '720p';

      const requestedSec = Number.parseInt(String(duration).replace(/[^0-9]/g, ''), 10);
      const clampedSec = Number.isFinite(requestedSec)
        ? Math.min(parsedStart && parsedEnd ? 10 : 15, Math.max(3, requestedSec))
        : 8;
      const safeDuration = `${clampedSec}s`;

      const inputItems: Array<
        | { type: 'image'; mime_type: string; data: string }
        | { type: 'text'; text: string }
      > = [];

      if (parsedStart) {
        inputItems.push({
          type: 'image',
          mime_type: parsedStart.mimeType,
          data: parsedStart.data,
        });
      }
      if (parsedEnd) {
        inputItems.push({
          type: 'image',
          mime_type: parsedEnd.mimeType,
          data: parsedEnd.data,
        });
      }
      inputItems.push({
        type: 'text',
        text:
          cleanPrompt ||
          'Subtle anamorphic cinema camera push-in with natural atmospheric motion and filmic lighting.',
      });

      const ai = getGenAI();
      const interaction = await ai.interactions.create(
        {
          model: 'gemini-omni-1.2-flash',
          ...(previousInteractionId ? { previous_interaction_id: String(previousInteractionId) } : {}),
          input: inputItems.length === 1 && inputItems[0].type === 'text' ? inputItems[0].text : inputItems,
          background: false,
          store: true,
          stream: false,
          response_format: {
            type: 'video',
            aspect_ratio: safeAspect,
            duration: safeDuration,
            resolution: safeResolution,
          },
        },
        { timeout: 300000 }
      );

      let videoDataUrl = '';
      let videoUri = '';
      const outVideo = interaction.output_video;
      if (outVideo?.data) {
        const mime = outVideo.mime_type || 'video/mp4';
        videoDataUrl = `data:${mime};base64,${outVideo.data}`;
      } else if (outVideo?.uri) {
        videoUri = outVideo.uri;
      } else if (Array.isArray(interaction.steps)) {
        for (const step of interaction.steps) {
          if (step.type === 'model_output' && Array.isArray(step.content)) {
            for (const item of step.content) {
              if (item.type === 'video') {
                if (item.data) {
                  videoDataUrl = `data:${item.mime_type || 'video/mp4'};base64,${item.data}`;
                } else if (item.uri) {
                  videoUri = item.uri;
                }
              }
            }
          }
        }
      }

      if (!videoDataUrl && !videoUri) {
        res.status(502).json({
          error: 'Video generation completed without a playable video payload. Try a clearer motion prompt.',
        });
        return;
      }

      res.json({
        videoDataUrl,
        videoUri,
        interactionId: interaction.id || '',
        model: 'gemini-omni-1.2-flash',
        aspectRatio: safeAspect,
        duration: safeDuration,
        resolution: safeResolution,
      });
    } catch (error: unknown) {
      const formatted = formatGeminiError(error);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // ─── 4. Compose Original Film Score & Cues (Lyria Clip & Lyria Pro) ────────
  app.post('/api/ai/music', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const {
        prompt = '',
        mode = 'clip', // 'clip' -> lyria-3-clip-preview | 'pro' -> lyria-3-pro-preview
        sceneImageDataUrl = '',
      } = req.body || {};

      const cleanPrompt = String(prompt || '').trim();
      const parsedScene = parseDataUrl(sceneImageDataUrl);
      if (!cleanPrompt && !parsedScene) {
        res.status(400).json({ error: 'Describe the musical mood, instrumentation, or attach a scene frame.' });
        return;
      }

      const model = mode === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';
      const defaultCuePrompt =
        mode === 'pro'
          ? 'Compose a full-length evocative cinema score inspired by this frame.'
          : 'Compose a 30-second atmospheric film score cue inspired by this frame.';

      const ai = getGenAI();
      const responseStream = await ai.models.generateContentStream({
        model,
        contents: parsedScene
          ? {
              parts: [
                { text: cleanPrompt || defaultCuePrompt },
                { inlineData: parsedScene },
              ],
            }
          : cleanPrompt,
      });

      const audioChunks: Buffer[] = [];
      let lyrics = '';
      let mimeType = 'audio/mpeg';

      for await (const chunk of responseStream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (audioChunks.length === 0 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioChunks.push(Buffer.from(part.inlineData.data, 'base64'));
          }
          if (part.text) {
            lyrics += part.text;
          }
        }
      }

      if (audioChunks.length === 0) {
        res.status(502).json({
          error: lyrics || 'No audio stream was returned by Lyria. Try adjusting the score description.',
        });
        return;
      }

      const audioBase64 = Buffer.concat(audioChunks).toString('base64');
      res.json({
        audioDataUrl: `data:${mimeType};base64,${audioBase64}`,
        lyrics: lyrics.trim(),
        mimeType,
        model,
      });
    } catch (error: unknown) {
      const formatted = formatGeminiError(error);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // ─── 5. Audio Transcription & Table-Read Slate (gemini-3.5-transcribe) ─────
  app.post('/api/ai/transcribe', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { audioDataUrl = '', format = 'verbatim' } = req.body || {};
      const parsedAudio = parseDataUrl(audioDataUrl);
      if (!parsedAudio) {
        res.status(400).json({ error: 'Record or upload an audio clip to transcribe.' });
        return;
      }

      let instruction = 'Transcribe this audio accurately word-for-word with clean punctuation.';
      if (format === 'screenplay') {
        instruction =
          'Transcribe this spoken recording and format it cleanly as Fountain-style screenplay dialogue and parentheticals, preserving every spoken line faithfully.';
      } else if (format === 'beats') {
        instruction =
          'Transcribe this director voice note verbatim first, then append a concise bulleted list of actionable production beats extracted from the recording.';
      }

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: parsedAudio.mimeType,
                data: parsedAudio.data,
              },
            },
            { text: instruction },
          ],
        },
      });

      res.json({
        transcript: response.text || '',
        model: 'gemini-3.5-transcribe',
      });
    } catch (error: unknown) {
      const formatted = formatGeminiError(error);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // ─── 6. Google Search Grounding (Industry, Festival & Cultural Pulse) ──────
  app.post('/api/ai/ground/search', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { query = '', projectId = null, persist = true } = req.body || {};
      const cleanQuery = String(query || '').trim();
      if (!cleanQuery) {
        res.status(400).json({ error: 'Enter a film, festival, box-office, or cultural research query.' });
        return;
      }

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: cleanQuery,
        config: {
          systemInstruction:
            'You are Cina’s Film Intelligence & Cultural Research Desk. Synthesize accurate, up-to-date facts, dates, festival details, comparables, and production insights in crisp editorial prose.',
          tools: [{ googleSearch: {} }],
        },
      });

      const seen = new Set<string>();
      const sources: Array<{ title: string; uri: string }> = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      for (const chunk of chunks) {
        const uri = chunk.web?.uri;
        if (uri && !seen.has(uri)) {
          seen.add(uri);
          sources.push({
            title: chunk.web?.title || uri,
            uri,
          });
        }
      }

      const summary = response.text || '';

      if (req.user && persist && summary) {
        try {
          await syncOrFetchUser({
            uid: req.user.uid,
            email: req.user.email || '',
            displayName: req.user.name || '',
            photoUrl: req.user.picture || '',
          });
          await saveScoutReport({
            uid: req.user.uid,
            projectId: typeof projectId === 'number' ? projectId : null,
            mode: 'search',
            query: cleanQuery,
            summary,
            sourcesJson: JSON.stringify(sources),
          });
        } catch (dbErr) {
          console.error('Non-fatal search scout save warning:', dbErr);
        }
      }

      res.json({
        summary,
        sources,
        model: 'gemini-4-hydrogen',
      });
    } catch (error: unknown) {
      const formatted = formatGeminiError(error);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // ─── 7. Google Maps Grounding (Location & Screening Venue Scout) ───────────
  app.post('/api/ai/ground/maps', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const {
        query = '',
        latitude = null,
        longitude = null,
        projectId = null,
        persist = true,
      } = req.body || {};

      const cleanQuery = String(query || '').trim();
      if (!cleanQuery) {
        res.status(400).json({ error: 'Describe the filming location, architectural look, or cinema venue to scout.' });
        return;
      }

      const hasCoords =
        typeof latitude === 'number' &&
        Number.isFinite(latitude) &&
        typeof longitude === 'number' &&
        Number.isFinite(longitude);

      const ai = getGenAI();
      // IMPORTANT: Never set responseMimeType or responseSchema with googleMaps
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: cleanQuery,
        config: {
          systemInstruction:
            'You are Cina’s Supervising Location Scout & Exhibition Programmer. Recommend real-world filming locations, architectural textures, lighting orientation, staging logistics, or cinema screening venues matching the brief.',
          tools: [{ googleMaps: {} }],
          ...(hasCoords
            ? {
                toolConfig: {
                  retrievalConfig: {
                    latLng: {
                      latitude: Number(latitude),
                      longitude: Number(longitude),
                    },
                  },
                },
              }
            : {}),
        },
      });

      const places: Array<{
        title: string;
        uri: string;
        reviewSnippets: string[];
      }> = [];
      const seenUris = new Set<string>();

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      for (const chunk of chunks) {
        const mapsData = (chunk as {
          maps?: {
            uri?: string;
            title?: string;
            placeAnswerSources?: {
              reviewSnippets?: Array<{ content?: string; text?: string; reviewText?: string } | string>;
            };
          };
        }).maps;

        if (mapsData?.uri && !seenUris.has(mapsData.uri)) {
          seenUris.add(mapsData.uri);
          const rawSnippets = mapsData.placeAnswerSources?.reviewSnippets ?? [];
          const snippets: string[] = [];
          for (const item of rawSnippets) {
            if (typeof item === 'string' && item.trim()) {
              snippets.push(item.trim());
            } else if (item && typeof item === 'object') {
              const txt = item.content || item.text || item.reviewText;
              if (typeof txt === 'string' && txt.trim()) {
                snippets.push(txt.trim());
              }
            }
          }
          places.push({
            title: mapsData.title || 'View on Google Maps',
            uri: mapsData.uri,
            reviewSnippets: snippets,
          });
        }
      }

      const summary = response.text || '';

      if (req.user && persist && summary) {
        try {
          await syncOrFetchUser({
            uid: req.user.uid,
            email: req.user.email || '',
            displayName: req.user.name || '',
            photoUrl: req.user.picture || '',
          });
          await saveScoutReport({
            uid: req.user.uid,
            projectId: typeof projectId === 'number' ? projectId : null,
            mode: 'maps',
            query: cleanQuery,
            summary,
            sourcesJson: JSON.stringify(places),
            latitude: hasCoords ? Number(latitude) : null,
            longitude: hasCoords ? Number(longitude) : null,
          });
        } catch (dbErr) {
          console.error('Non-fatal maps scout save warning:', dbErr);
        }
      }

      res.json({
        summary,
        places,
        model: 'gemini-4-hydrogen',
      });
    } catch (error: unknown) {
      const formatted = formatGeminiError(error);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // ─── 7B. Natural Neural Text-to-Speech (gemini-3.8-flash-lite-tts) ─────────
  app.post('/api/ai/tts', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const {
        text = '',
        voiceName: requestedVoice = 'Kore',
        style = 'Warm, articulate, natural cinema curator with calm human cadence and subtle warmth',
      } = req.body || {};

      const cleanText = String(text || '')
        .replace(/[*_#`~>]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim()
        .slice(0, 1800);

      if (!cleanText) {
        res.status(400).json({ error: 'Provide text to synthesize into speech.' });
        return;
      }

      const voiceName = ALLOWED_VOICES.has(requestedVoice) ? requestedVoice : 'Kore';
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style: String(style).slice(0, 240),
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        res.status(502).json({ error: 'No audio waveform returned by gemini-3.8-flash-lite-tts.' });
        return;
      }

      // Unary gemini-3.8-flash-lite-tts returns a complete 24kHz 16-bit mono WAV file
      res.json({
        audioDataUrl: `data:audio/wav;base64,${base64Audio}`,
        voiceName,
        model: 'gemini-3.8-flash-lite-tts',
      });
    } catch (error: unknown) {
      const formatted = formatGeminiError(error);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // ─── 7C. Cina Watch & Studio Concierge (gemini-4-hydrogen + optional TTS) ──
  app.post('/api/ai/concierge', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
      const {
        message = '',
        history = [],
        catalogContext = '',
        currentRoute = '',
        speakReply = false,
        voiceName: requestedVoice = 'Kore',
      } = req.body || {};

      const cleanMessage = String(message || '').trim();
      if (!cleanMessage) {
        res.status(400).json({ error: 'Ask Cina anything about tonight’s films, series, or studio tools.' });
        return;
      }

      const systemInstruction = [
        'You are Cina, the resident cinema programmer and creative concierge for Cina Watch & Studio.',
        'Speak with effortless human warmth, sharp curatorial taste, and concise clarity (2–4 sentences unless asked for depth).',
        'Never use robotic filler, emojis, or markdown tables. Mention exact film titles, directors, or genres naturally when recommending.',
        currentRoute ? `Viewer is currently on route: ${String(currentRoute).slice(0, 120)}` : '',
        catalogContext ? `Available Cina Screening Catalog & Context:\n${String(catalogContext).slice(0, 2800)}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      if (Array.isArray(history)) {
        for (const turn of history.slice(-14)) {
          if (!turn || typeof turn.content !== 'string' || !turn.content.trim()) continue;
          contents.push({
            role: turn.role === 'model' ? 'model' : 'user',
            parts: [{ text: turn.content }],
          });
        }
      }
      contents.push({ role: 'user', parts: [{ text: cleanMessage }] });

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const reply = (response.text || '').trim();
      let audioDataUrl = '';

      if (speakReply && reply) {
        try {
          const safeVoice = ALLOWED_VOICES.has(requestedVoice) ? requestedVoice : 'Kore';
          const cleanSpoken = reply
            .replace(/[*_#`~>]/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .trim()
            .slice(0, 900);
          const ttsRes = await ai.models.generateContent({
            model: 'gemini-3.8-flash-lite-tts',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: cleanSpoken,
                    speechMetadata: {
                      style: 'Warm, articulate, perceptive cinema curator speaking naturally in a quiet screening room',
                    },
                  },
                ],
              },
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: safeVoice },
                },
              },
            },
          });
          const b64 = ttsRes.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (b64) {
            audioDataUrl = `data:audio/wav;base64,${b64}`;
          }
        } catch (ttsErr) {
          console.warn('Non-fatal concierge TTS synthesis warning:', ttsErr);
        }
      }

      res.json({
        reply,
        audioDataUrl,
        model: 'gemini-4-hydrogen',
      });
    } catch (error: unknown) {
      const formatted = formatGeminiError(error);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // ─── 8. Gemini Live API Real-Time Voice Bridge (/ws/live) ──────────────────
  const CINA_OMNI_TOOLS: FunctionDeclaration[] = [
    {
      name: 'navigate_app',
      description:
        'Navigate anywhere across Cina Watch, Cina Studio, Producers Market, or Editorial/About pages.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          surface: {
            type: Type.STRING,
            description: 'Target Cina surface: "watch", "studio", "producers", or "about".',
          },
          path: {
            type: Type.STRING,
            description:
              'Route path inside the target surface. Watch examples: "/", "/genre/film", "/genre/series", "/branches", "/rooms", "/festival", "/watchlist", "/library", "/history", "/taste", "/wallet", "/payouts", "/leaderboard", "/tokens", "/auctions", "/cast", "/studios", "/build", "/site/voss", "/account", "/about/blog", "/about/press". Studio station examples: "dashboard", "bible", "script", "vault", "board", "generate", "branch", "editor", "cuts", "score", "titles", "deliver", "mint", "watch", "memory", "autopilot", "pipeline", "chat", "promo", "analytics", "site". Producers examples: "market", "auctions", "watchlist", "portfolio", "activity".',
          },
        },
        required: ['surface', 'path'],
      },
    },
    {
      name: 'search_catalog',
      description:
        'Search the live Cina Watch catalog for films or series matching a title, director, genre, mood, runtime, or branched status.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: { type: Type.STRING, description: 'Keywords, title, director, genre, or mood.' },
          kind: { type: Type.STRING, description: 'Optional filter: "all", "film", or "series".' },
        },
        required: ['query'],
      },
    },
    {
      name: 'open_or_play_film',
      description:
        'Open a specific film or series page or immediately start playing/screening it.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: { type: Type.STRING, description: 'Film or series title, id, or mood/keyword to pick.' },
          autoplay: { type: Type.BOOLEAN, description: 'Set true if the user wants to watch/play right now.' },
        },
        required: ['query'],
      },
    },
    {
      name: 'manage_watchlist',
      description: 'Add, remove, or toggle a film/series in the user My List / Watchlist.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: { type: Type.STRING, description: 'Title or id of film, or "current" for the currently viewed film.' },
          action: { type: Type.STRING, description: '"add", "remove", or "toggle".' },
        },
        required: ['action'],
      },
    },
    {
      name: 'set_display_mood',
      description: 'Switch the app visual display mood/theme immediately.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          mood: {
            type: Type.STRING,
            description: 'One of: "premiere", "programmer", "darkroom", "midnight", "daylight".',
          },
        },
        required: ['mood'],
      },
    },
    {
      name: 'open_ui_modal',
      description:
        'Open user account settings, Workspace Atlas search, Sign In, Credits drawer, Team drawer, or any Cina AI Production Suite station.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          modal: {
            type: Type.STRING,
            description:
              'One of: "settings", "workspace_atlas", "credits", "team", "signin", "ai_chat", "ai_image", "ai_video", "ai_music", "ai_transcribe", "ai_scout", "ai_vault".',
          },
          tab: {
            type: Type.STRING,
            description:
              'When modal is "settings", optional tab: "profile", "appearance", "wallet", "billing", "security", "alerts", "privacy", "studio".',
          },
        },
        required: ['modal'],
      },
    },
    {
      name: 'studio_create_asset',
      description:
        'Run an AI creative production action on behalf of the user: generate a 4K film still, animate a motion video shot, compose a Lyria film score cue, or scout real filming locations via Google Maps.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          tool: {
            type: Type.STRING,
            description: 'One of: "generate_image", "generate_video", "compose_score", "scout_location".',
          },
          prompt: {
            type: Type.STRING,
            description: 'Detailed visual, camera, musical, or location scouting description.',
          },
        },
        required: ['tool', 'prompt'],
      },
    },
    {
      name: 'create_new_film',
      description: 'Start a brand new film or series production inside Cina Studio.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Working film or series title.' },
          logline: { type: Type.STRING, description: 'Short premise or logline.' },
        },
      },
    },
    {
      name: 'end_voice_session',
      description: 'End the live voice orb session when the user says goodbye, stop listening, or close voice.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          reason: { type: Type.STRING, description: 'Brief sign-off reason.' },
        },
      },
    },
  ];

  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const reqUrl = request.url || '';
    const pathname = reqUrl.split('?')[0];
    if (pathname === '/ws/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (clientWs: WebSocket, request: http.IncomingMessage) => {
    const urlObj = new URL(request.url || '/ws/live', 'http://localhost');
    const requestedVoice = urlObj.searchParams.get('voice') || 'Kore';
    const voiceName = ALLOWED_VOICES.has(requestedVoice) ? requestedVoice : 'Kore';
    const role = urlObj.searchParams.get('role') || 'omni';
    const isOmni = role === 'omni' || role === 'concierge';

    const roleSystemMap: Record<string, string> = {
      omni:
        'You are Cina, the warm, human-sounding creative partner and full-platform voice operator for Cina Watch, Cina Studio, and Producers Market. Speak naturally with subtle cinema warmth in 1 to 3 concise sentences. You can do ANYTHING in the app using your tools: search the catalog, open or play any film or series, add to watchlist, jump to Watch Parties, Festivals, Site Builder, Sales & Payouts, Wallet, Studio stations (Script, Storyboard, Timeline Editor, Score, Vault), change Display Mood, open User Settings tabs, start a new film, generate 4K stills/video/music, or scout real filming locations. Always call tools proactively whenever the user wants action or recommendations—never guess film titles without checking search_catalog first.',
      concierge:
        'You are Cina, the warm, human-sounding creative partner and full-platform voice operator for Cina Watch, Cina Studio, and Producers Market. Use your tools to search films, play content, switch moods, open panels, navigate any station, or trigger Studio AI tools immediately.',
      director:
        'You are a sharp, perceptive creative film co-director in Cina’s Live Rehearsal Room. Speak concisely and naturally like a collaborator on set—brainstorming blocking, camera choices, emotional stakes, and story pivots.',
      scene_partner:
        'You are an expressive dramatic actor running a live table read and improvisation with the director/scene partner. Deliver lines with subtle emotional truth, react in character when prompted, and take adjustments gracefully.',
      pitch_panel:
        'You are a Cannes & Sundance festival programmer and executive financier listening to the filmmaker’s live pitch. Ask incisive, constructive questions that sharpen their logline, visual language, and audience hook.',
    };

    const systemInstruction = roleSystemMap[role] || roleSystemMap.omni;

    const sendSafe = (payload: Record<string, unknown>) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    let closed = false;
    let liveSessionRef: { close: () => void } | null = null;

    const sessionPromise = (async () => {
      const ai = getGenAI();
      const session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction,
          ...(isOmni ? { tools: [{ functionDeclarations: CINA_OMNI_TOOLS }] } : {}),
        },
        callbacks: {
          onopen: () => {
            sendSafe({ type: 'ready', voiceName, model: 'gemini-3.8-live', role });
          },
          onmessage: (message: LiveServerMessage) => {
            const content = message.serverContent;
            if (content?.inputTranscription?.text) {
              sendSafe({ type: 'inputTranscript', text: content.inputTranscription.text });
            }
            if (content?.outputTranscription?.text) {
              sendSafe({ type: 'outputTranscript', text: content.outputTranscription.text });
            }
            for (const part of content?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                sendSafe({ type: 'audio', audio: part.inlineData.data });
              }
            }
            if (message.toolCall?.functionCalls && message.toolCall.functionCalls.length > 0) {
              sendSafe({
                type: 'toolCall',
                functionCalls: message.toolCall.functionCalls,
              });
            }
            if (message.toolCallCancellation?.ids && message.toolCallCancellation.ids.length > 0) {
              sendSafe({
                type: 'toolCallCancellation',
                ids: message.toolCallCancellation.ids,
              });
            }
            if (content?.interrupted) {
              sendSafe({ type: 'interrupted' });
            }
            if (content?.turnComplete) {
              sendSafe({ type: 'turnComplete' });
            }
          },
          onerror: (err: unknown) => {
            const formatted = formatGeminiError(err);
            sendSafe({ type: 'error', error: formatted.message });
          },
          onclose: () => {
            sendSafe({ type: 'closed' });
          },
        },
      });
      liveSessionRef = session;
      if (closed) {
        try {
          session.close();
        } catch {
          // ignore
        }
      }
      return session;
    })();

    sessionPromise.catch((err: unknown) => {
      const formatted = formatGeminiError(err);
      sendSafe({ type: 'error', error: formatted.message });
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close();
      }
    });

    clientWs.on('message', (rawData) => {
      let msg: {
        audio?: string;
        video?: string;
        text?: string;
        toolResponses?: FunctionResponse[];
      } | null = null;
      try {
        msg = JSON.parse(rawData.toString());
      } catch {
        return;
      }
      if (!msg) return;

      sessionPromise
        .then((session) => {
          if (closed) return;
          if (typeof msg?.audio === 'string' && msg.audio) {
            session.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          }
          if (typeof msg?.video === 'string' && msg.video) {
            const parsedFrame = parseDataUrl(msg.video);
            session.sendRealtimeInput({
              video: {
                data: parsedFrame ? parsedFrame.data : msg.video,
                mimeType: parsedFrame ? parsedFrame.mimeType : 'image/jpeg',
              },
            });
          }
          if (typeof msg?.text === 'string' && msg.text.trim()) {
            session.sendRealtimeInput({
              text: msg.text.trim(),
            });
          }
          if (Array.isArray(msg?.toolResponses) && msg.toolResponses.length > 0) {
            session.sendToolResponse({
              functionResponses: msg.toolResponses,
            });
          }
        })
        .catch(() => {
          // Handled above on initial connect catch
        });
    });

    clientWs.on('close', () => {
      closed = true;
      if (liveSessionRef) {
        try {
          liveSessionRef.close();
        } catch {
          // ignore
        }
      }
    });
  });

  // ─── Frontend Serving (Vite MPA in Dev, Static dist/ in Production) ────────
  if (!isProduction) {
    const watchBundlePath = path.resolve(__dirname, 'public/bundles/watch.bundle.js');
    if (!fs.existsSync(watchBundlePath)) {
      const { execFileSync } = await import('node:child_process');
      execFileSync(process.execPath, [path.resolve(__dirname, 'scripts/compile-cina.mjs')], {
        cwd: __dirname,
        stdio: 'inherit',
      });
    }
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'mpa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.get(['/Cina', '/cina'], (_req, res) => {
      res.sendFile(path.join(distPath, 'Cina.html'));
    });
    app.get(['/Producers', '/producers'], (_req, res) => {
      res.sendFile(path.join(distPath, 'Producers.html'));
    });
    app.get(['/About', '/about'], (_req, res) => {
      res.sendFile(path.join(distPath, 'About.html'));
    });
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'API endpoint not found.' });
        return;
      }
      const fallback = path.join(distPath, 'index.html');
      if (fs.existsSync(fallback)) {
        res.sendFile(fallback);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Cina server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
