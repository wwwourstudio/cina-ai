import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  Clapperboard,
  Compass,
  Download,
  Film,
  FolderKanban,
  Globe,
  Image as ImageIcon,
  LogIn,
  LogOut,
  MapPin,
  MessageSquare,
  Mic,
  MicOff,
  Music,
  Plus,
  Radio,
  Send,
  Square,
  Trash2,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import {
  authFetch,
  signInWithGooglePopup,
  signOutFirebaseUser,
  subscribeAuthUser,
} from '../lib/firebase';
import {
  fileToDataUrl,
  float32ToPcm16Base64,
  normalizeImageToJpegDataUrl,
  pcm24Base64ToAudioBuffer,
} from './liveAudioUtils';

export type SuiteStation =
  | 'chat'
  | 'live'
  | 'image'
  | 'video'
  | 'music'
  | 'transcribe'
  | 'scout'
  | 'vault';

interface StudioProject {
  id: number;
  title: string;
  logline: string;
  genre: string;
  aspectRatio: string;
  status: string;
  createdAt: string;
}

interface StudioAsset {
  id: number;
  projectId: number | null;
  kind: 'image' | 'video' | 'music' | 'transcript';
  title: string;
  prompt: string;
  modelUsed: string;
  mediaDataUrl: string;
  textBody: string;
  interactionId: string;
  aspectRatio: string;
  createdAt: string;
}

interface ChatThreadSummary {
  id: number;
  projectId: number | null;
  title: string;
  persona: string;
  modelTier: string;
  updatedAt: string;
}

interface ChatTurn {
  role: 'user' | 'model';
  content: string;
  modelUsed?: string;
}

interface ScoutReportRecord {
  id: number;
  mode: 'search' | 'maps';
  query: string;
  summary: string;
  sourcesJson: string;
  createdAt: string;
}

interface GroundingWebSource {
  title: string;
  uri: string;
}

interface GroundingMapPlace {
  title: string;
  uri: string;
  reviewSnippets: string[];
}

declare global {
  interface Window {
    openCinaAiSuite?: (station?: SuiteStation) => void;
    closeCinaAiSuite?: () => void;
  }
}

const STATIONS: Array<{
  id: SuiteStation;
  label: string;
  shortLabel: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'chat',
    label: '01. Writers’ Room',
    shortLabel: 'Writers’ Room',
    subtitle: 'Multi-turn screenplay & directing table',
    icon: MessageSquare,
  },
  {
    id: 'live',
    label: '02. Live Rehearsal',
    shortLabel: 'Live Voice',
    subtitle: 'Real-time voice room & table read',
    icon: Radio,
  },
  {
    id: 'image',
    label: '03. Frame Lab',
    shortLabel: 'Frame Lab',
    subtitle: '1K–4K cinema stills & continuity edits',
    icon: ImageIcon,
  },
  {
    id: 'video',
    label: '04. Motion Lab',
    shortLabel: 'Motion Lab',
    subtitle: 'Animate stills & extend camera shots',
    icon: Film,
  },
  {
    id: 'music',
    label: '05. Score Lab',
    shortLabel: 'Score Lab',
    subtitle: 'Compose 30s cues & full-length scores',
    icon: Music,
  },
  {
    id: 'transcribe',
    label: '06. Voice Slate',
    shortLabel: 'Voice Slate',
    subtitle: 'Mic & audio transcription to script',
    icon: Mic,
  },
  {
    id: 'scout',
    label: '07. Location & Pulse',
    shortLabel: 'Scout Desk',
    subtitle: 'Maps location scout & web intelligence',
    icon: Compass,
  },
  {
    id: 'vault',
    label: '08. Studio Vault',
    shortLabel: 'Studio Vault',
    subtitle: 'Projects, saved takes & dossiers',
    icon: FolderKanban,
  },
];

const CHAT_MODELS = [
  { id: 'gemini-4-carbon', label: 'Carbon · Deep Architecture' },
  { id: 'gemini-4-argon', label: 'Argon · Dramatic & Technical' },
  { id: 'gemini-4-hydrogen', label: 'Hydrogen · Balanced Studio' },
  { id: 'gemini-3.1-flash-lite', label: 'Flash Lite · Rapid Beats' },
] as const;

const PERSONAS = [
  { id: 'showrunner', label: 'Showrunner' },
  { id: 'cinematographer', label: 'Cinematographer' },
  { id: 'producer', label: 'Executive Producer' },
  { id: 'editor', label: 'Lead Editor' },
] as const;

export function CinaDirectorSuite({
  onAuthUserChange,
}: {
  onAuthUserChange?: (user: User | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [station, setStation] = useState<SuiteStation>('chat');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [banner, setBanner] = useState<{ tone: 'info' | 'error'; text: string } | null>(null);

  // Vault / Active Slate state
  const [projects, setProjects] = useState<StudioProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [assets, setAssets] = useState<StudioAsset[]>([]);
  const [threads, setThreads] = useState<ChatThreadSummary[]>([]);
  const [savedScouts, setSavedScouts] = useState<ScoutReportRecord[]>([]);
  const [vaultFilter, setVaultFilter] = useState<'all' | 'image' | 'video' | 'music' | 'transcript'>('all');
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjGenre, setNewProjGenre] = useState('Neo-Noir · Arthouse');
  const [newProjLogline, setNewProjLogline] = useState('');
  const [vaultLoading, setVaultLoading] = useState(false);

  // 1. Writers' Room (Multi-turn Chat)
  const [chatModel, setChatModel] = useState<string>('gemini-4-carbon');
  const [chatPersona, setChatPersona] = useState<string>('showrunner');
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([
    {
      role: 'model',
      content:
        'Welcome to the Writers’ Room. Share a logline, scene beat, character dilemma, or reference frame—we can architect the screenplay and relay any beat straight to Frame Lab, Motion Lab, or Score Lab.',
      modelUsed: 'gemini-4-carbon',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatFrameUrl, setChatFrameUrl] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // 2. Live Voice Rehearsal (gemini-3.8-live)
  const [liveConnected, setLiveConnected] = useState(false);
  const [liveConnecting, setLiveConnecting] = useState(false);
  const [liveVoice, setLiveVoice] = useState<'Zephyr' | 'Kore' | 'Charon' | 'Fenrir' | 'Puck'>('Zephyr');
  const [liveRole, setLiveRole] = useState<'director' | 'scene_partner' | 'pitch_panel'>('director');
  const [liveLog, setLiveLog] = useState<Array<{ speaker: 'You' | 'Studio'; text: string }>>([]);
  const [liveNoteInput, setLiveNoteInput] = useState('');
  const liveWsRef = useRef<WebSocket | null>(null);
  const liveInputCtxRef = useRef<AudioContext | null>(null);
  const liveOutputCtxRef = useRef<AudioContext | null>(null);
  const liveStreamRef = useRef<MediaStream | null>(null);
  const liveProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const liveNextStartRef = useRef<number>(0);
  const liveSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // 3. Frame Lab (gemini-nano-banana-2.1)
  const [imgPrompt, setImgPrompt] = useState(
    '35mm anamorphic still inside a rain-slicked Marseille ferry terminal at 2am, sodium-vapor reflections, solitary sound recordist in a trench coat holding a boom mic, Kodak Vision3 500T film grain.'
  );
  const [imgSourceUrl, setImgSourceUrl] = useState('');
  const [imgAspect, setImgAspect] = useState('16:9');
  const [imgSize, setImgSize] = useState<'1K' | '2K' | '4K'>('2K');
  const [imgSearchGrounding, setImgSearchGrounding] = useState(false);
  const [imgResultUrl, setImgResultUrl] = useState('');
  const [imgNotes, setImgNotes] = useState('');
  const [imgSources, setImgSources] = useState<GroundingWebSource[]>([]);
  const [imgBusy, setImgBusy] = useState(false);

  // 4. Motion Lab (gemini-omni-1.2-flash Interactions API)
  const [vidPrompt, setVidPrompt] = useState(
    'Slow dolly push-in as rain streaks down the glass facade, warm ferry headlights sweep across her face, subtle handheld breathing.'
  );
  const [vidStartImgUrl, setVidStartImgUrl] = useState('');
  const [vidEndImgUrl, setVidEndImgUrl] = useState('');
  const [vidAspect, setVidAspect] = useState<'16:9' | '9:16'>('16:9');
  const [vidDuration, setVidDuration] = useState<'5s' | '8s' | '10s'>('8s');
  const [vidResolution, setVidResolution] = useState<'720p' | '1080p'>('720p');
  const [vidResultUrl, setVidResultUrl] = useState('');
  const [vidInteractionId, setVidInteractionId] = useState('');
  const [vidExtendPrompt, setVidExtendPrompt] = useState('');
  const [vidBusy, setVidBusy] = useState(false);

  // 5. Score Lab (Lyria Clip & Lyria Pro)
  const [musicPrompt, setMusicPrompt] = useState(
    'Nocturnal chamber strings with bowed vibraphone, tape-saturated analog bass pulse, and distant harbor foghorn resonance, melancholic cinema tension.'
  );
  const [musicMode, setMusicMode] = useState<'clip' | 'pro'>('clip');
  const [musicSceneUrl, setMusicSceneUrl] = useState('');
  const [musicResultUrl, setMusicResultUrl] = useState('');
  const [musicLyrics, setMusicLyrics] = useState('');
  const [musicBusy, setMusicBusy] = useState(false);

  // 6. Voice Slate Transcription (gemini-3.5-transcribe)
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioClipUrl, setAudioClipUrl] = useState('');
  const [transcribeFormat, setTranscribeFormat] = useState<'verbatim' | 'screenplay' | 'beats'>('screenplay');
  const [transcriptResult, setTranscriptResult] = useState('');
  const [transcribeBusy, setTranscribeBusy] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordTimerRef = useRef<number | null>(null);

  // 7. Scout Desk (Google Maps Grounding + Google Search Grounding)
  const [scoutMode, setScoutMode] = useState<'maps' | 'search'>('maps');
  const [scoutQuery, setScoutQuery] = useState(
    'Atmospheric brutalist concrete port buildings, historic art-house cinemas, and late-night cafés suitable for a neo-noir shoot in Marseille'
  );
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const [scoutSummary, setScoutSummary] = useState('');
  const [scoutWebSources, setScoutWebSources] = useState<GroundingWebSource[]>([]);
  const [scoutMapPlaces, setScoutMapPlaces] = useState<GroundingMapPlace[]>([]);
  const [scoutBusy, setScoutBusy] = useState(false);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) || null,
    [projects, activeProjectId]
  );

  const notify = useCallback((text: string, tone: 'info' | 'error' = 'info') => {
    setBanner({ text, tone });
  }, []);

  const loadVaultBootstrap = useCallback(async () => {
    setVaultLoading(true);
    try {
      const res = await authFetch('/api/vault/bootstrap', { method: 'POST', body: JSON.stringify({}) });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load studio vault.');
      }
      const nextProjects: StudioProject[] = data.projects || [];
      setProjects(nextProjects);
      setActiveProjectId((prev) =>
        prev && nextProjects.some((p) => p.id === prev) ? prev : nextProjects[0]?.id ?? null
      );
      setAssets(data.assets || []);
      setThreads(data.threads || []);
      setSavedScouts(data.scouts || []);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Unable to sync studio vault.', 'error');
    } finally {
      setVaultLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    const unsub = subscribeAuthUser((u) => {
      setAuthUser(u);
      onAuthUserChange?.(u);
      if (u) {
        loadVaultBootstrap();
      } else {
        setProjects([]);
        setActiveProjectId(null);
        setAssets([]);
        setThreads([]);
        setSavedScouts([]);
      }
    });
    return unsub;
  }, [loadVaultBootstrap, onAuthUserChange]);

  useEffect(() => {
    window.openCinaAiSuite = (targetStation?: SuiteStation) => {
      if (targetStation) {
        setStation(targetStation);
      }
      setOpen(true);
    };
    window.closeCinaAiSuite = () => {
      setOpen(false);
    };
    return () => {
      delete window.openCinaAiSuite;
      delete window.closeCinaAiSuite;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatBusy]);

  // Cleanup Live WebSocket and MediaRecorder on unmount
  const stopLiveSession = useCallback(() => {
    if (liveProcessorRef.current) {
      try {
        liveProcessorRef.current.disconnect();
      } catch {
        // ignore
      }
      liveProcessorRef.current = null;
    }
    if (liveStreamRef.current) {
      for (const track of liveStreamRef.current.getTracks()) {
        track.stop();
      }
      liveStreamRef.current = null;
    }
    for (const src of liveSourcesRef.current) {
      try {
        src.stop();
      } catch {
        // ignore
      }
    }
    liveSourcesRef.current.clear();
    liveNextStartRef.current = 0;

    if (liveInputCtxRef.current) {
      liveInputCtxRef.current.close().catch(() => {});
      liveInputCtxRef.current = null;
    }
    if (liveOutputCtxRef.current) {
      liveOutputCtxRef.current.close().catch(() => {});
      liveOutputCtxRef.current = null;
    }
    if (liveWsRef.current) {
      try {
        liveWsRef.current.close();
      } catch {
        // ignore
      }
      liveWsRef.current = null;
    }
    setLiveConnected(false);
    setLiveConnecting(false);
  }, []);

  useEffect(() => {
    return () => {
      stopLiveSession();
      if (recordTimerRef.current) {
        window.clearInterval(recordTimerRef.current);
      }
    };
  }, [stopLiveSession]);

  const handleGoogleSignIn = async () => {
    setAuthBusy(true);
    setBanner(null);
    try {
      await signInWithGooglePopup();
      notify('Signed in to Cina Studio Vault.');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Google Sign-In was cancelled or failed.', 'error');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    await signOutFirebaseUser();
    notify('Signed out of Studio Vault.');
  };

  const saveTakeToVault = async (params: {
    kind: 'image' | 'video' | 'music' | 'transcript';
    title: string;
    prompt: string;
    modelUsed: string;
    mediaDataUrl?: string;
    textBody?: string;
    interactionId?: string;
    aspectRatio?: string;
  }) => {
    if (!authUser) {
      notify('Sign in with Google first to save takes to your persistent Studio Vault.', 'error');
      return;
    }
    try {
      const res = await authFetch('/api/vault/assets', {
        method: 'POST',
        body: JSON.stringify({
          projectId: activeProjectId,
          ...params,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to save take.');
      setAssets((prev) => [data.asset, ...prev]);
      notify(`Saved "${params.title}" to Studio Vault.`);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to save take.', 'error');
    }
  };

  // ─── 1. Writers' Room Handlers ──────────────────────────────────────────────
  const handleSendChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const prompt = chatInput.trim();
    if (!prompt || chatBusy) return;

    const priorTurns = chatHistory;
    setChatHistory((prev) => [...prev, { role: 'user', content: prompt }]);
    setChatInput('');
    setChatBusy(true);
    setBanner(null);

    try {
      const projectContext = activeProject
        ? `Title: ${activeProject.title}\nGenre: ${activeProject.genre}\nAspect Ratio: ${activeProject.aspectRatio}\nLogline: ${activeProject.logline}`
        : '';

      const res = await authFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          model: chatModel,
          persona: chatPersona,
          history: priorTurns,
          message: prompt,
          imageDataUrl: chatFrameUrl,
          projectContext,
          threadId: activeThreadId,
          projectId: activeProjectId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Writers’ Room request failed.');

      setChatFrameUrl('');
      if (typeof data.threadId === 'number') {
        setActiveThreadId(data.threadId);
        if (authUser) {
          authFetch('/api/vault/threads')
            .then((r) => r.json())
            .then((d) => {
              if (Array.isArray(d.threads)) setThreads(d.threads);
            })
            .catch(() => {});
        }
      }

      setChatHistory((prev) => [
        ...prev,
        {
          role: 'model',
          content: data.reply || '(No response text returned.)',
          modelUsed: data.model || chatModel,
        },
      ]);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Writers’ Room error.', 'error');
    } finally {
      setChatBusy(false);
    }
  };

  const handleLoadThread = async (thread: ChatThreadSummary) => {
    try {
      const res = await authFetch(`/api/vault/threads/${thread.id}/messages`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load thread.');
      const loaded: ChatTurn[] = (data.messages || []).map(
        (m: { role: string; content: string; modelUsed?: string }) => ({
          role: m.role === 'model' ? 'model' : 'user',
          content: m.content,
          modelUsed: m.modelUsed,
        })
      );
      setActiveThreadId(thread.id);
      setChatPersona(thread.persona || 'showrunner');
      setChatModel(thread.modelTier || 'gemini-4-carbon');
      if (loaded.length > 0) {
        setChatHistory(loaded);
      }
      setStation('chat');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to load conversation.', 'error');
    }
  };

  // ─── 2. Live Rehearsal Handlers (gemini-3.8-live) ───────────────────────────
  const startLiveSession = async () => {
    if (liveConnected || liveConnecting) return;
    setLiveConnecting(true);
    setBanner(null);

    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      liveStreamRef.current = micStream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      liveInputCtxRef.current = inputCtx;
      liveOutputCtxRef.current = outputCtx;
      liveNextStartRef.current = 0;

      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${window.location.host}/ws/live?voice=${encodeURIComponent(
        liveVoice
      )}&role=${encodeURIComponent(liveRole)}`;
      const ws = new WebSocket(wsUrl);
      liveWsRef.current = ws;

      ws.onopen = () => {
        const source = inputCtx.createMediaStreamSource(micStream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        liveProcessorRef.current = processor;

        processor.onaudioprocess = (event) => {
          const activeWs = liveWsRef.current;
          if (!activeWs || activeWs.readyState !== WebSocket.OPEN) return;
          const samples = event.inputBuffer.getChannelData(0);
          const base64Audio = float32ToPcm16Base64(samples, inputCtx.sampleRate);
          activeWs.send(JSON.stringify({ audio: base64Audio }));
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
      };

      ws.onmessage = (event) => {
        let msg: {
          type?: string;
          audio?: string;
          text?: string;
          error?: string;
        } | null = null;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }
        if (!msg) return;

        if (msg.type === 'ready') {
          setLiveConnecting(false);
          setLiveConnected(true);
          setLiveLog((prev) => [
            ...prev,
            {
              speaker: 'Studio',
              text: `Connected to Live Rehearsal (${liveVoice} · ${liveRole.replace('_', ' ')}). Start speaking anytime.`,
            },
          ]);
          return;
        }

        if (msg.type === 'audio' && msg.audio && liveOutputCtxRef.current) {
          const outCtx = liveOutputCtxRef.current;
          if (outCtx.state === 'suspended') {
            outCtx.resume().catch(() => {});
          }
          const audioBuffer = pcm24Base64ToAudioBuffer(outCtx, msg.audio);
          if (audioBuffer) {
            const sourceNode = outCtx.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.connect(outCtx.destination);
            const startAt = Math.max(outCtx.currentTime, liveNextStartRef.current);
            sourceNode.start(startAt);
            liveNextStartRef.current = startAt + audioBuffer.duration;
            liveSourcesRef.current.add(sourceNode);
            sourceNode.onended = () => {
              liveSourcesRef.current.delete(sourceNode);
            };
          }
          return;
        }

        if (msg.type === 'interrupted' && liveOutputCtxRef.current) {
          for (const node of liveSourcesRef.current) {
            try {
              node.stop();
            } catch {
              // ignore
            }
          }
          liveSourcesRef.current.clear();
          liveNextStartRef.current = liveOutputCtxRef.current.currentTime;
          return;
        }

        if (msg.type === 'inputTranscript' && msg.text) {
          const txt = msg.text;
          setLiveLog((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.speaker === 'You') {
              return [...prev.slice(0, -1), { speaker: 'You', text: `${last.text}${txt}` }];
            }
            return [...prev, { speaker: 'You', text: txt }];
          });
          return;
        }

        if (msg.type === 'outputTranscript' && msg.text) {
          const txt = msg.text;
          setLiveLog((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.speaker === 'Studio') {
              return [...prev.slice(0, -1), { speaker: 'Studio', text: `${last.text}${txt}` }];
            }
            return [...prev, { speaker: 'Studio', text: txt }];
          });
          return;
        }

        if (msg.type === 'error' && msg.error) {
          notify(msg.error, 'error');
          stopLiveSession();
        }
      };

      ws.onerror = () => {
        notify('Live voice connection interrupted.', 'error');
        stopLiveSession();
      };

      ws.onclose = () => {
        stopLiveSession();
      };
    } catch (err: unknown) {
      notify(
        err instanceof Error
          ? err.message
          : 'Microphone access is required for Live Voice Rehearsal.',
        'error'
      );
      stopLiveSession();
    }
  };

  const handleSendLiveCue = (e: React.FormEvent) => {
    e.preventDefault();
    const cue = liveNoteInput.trim();
    if (!cue || !liveWsRef.current || liveWsRef.current.readyState !== WebSocket.OPEN) return;
    liveWsRef.current.send(JSON.stringify({ text: cue }));
    setLiveLog((prev) => [...prev, { speaker: 'You', text: `[Stage Cue] ${cue}` }]);
    setLiveNoteInput('');
  };

  const handleShareFrameToLive = async () => {
    const candidateFrame = imgResultUrl || imgSourceUrl || vidStartImgUrl;
    if (!candidateFrame) {
      notify('Generate or upload a still in Frame Lab first to share visual context.', 'error');
      return;
    }
    if (!liveWsRef.current || liveWsRef.current.readyState !== WebSocket.OPEN) {
      notify('Start the Live Voice session first.', 'error');
      return;
    }
    try {
      const jpegDataUrl = await normalizeImageToJpegDataUrl(candidateFrame, 960);
      liveWsRef.current.send(JSON.stringify({ video: jpegDataUrl }));
      setLiveLog((prev) => [
        ...prev,
        { speaker: 'You', text: '[Shared active Frame Lab still to Live Rehearsal monitor]' },
      ]);
      notify('Active frame sent to Live Voice collaborator.');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Unable to send frame.', 'error');
    }
  };

  // ─── 3. Frame Lab Handlers (gemini-nano-banana-2.1) ─────────────────────────
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgPrompt.trim() || imgBusy) return;
    setImgBusy(true);
    setBanner(null);

    try {
      const res = await authFetch('/api/ai/image', {
        method: 'POST',
        body: JSON.stringify({
          prompt: imgPrompt,
          sourceImageDataUrl: imgSourceUrl,
          aspectRatio: imgAspect,
          imageSize: imgSize,
          useSearchGrounding: imgSearchGrounding,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Frame generation failed.');
      setImgResultUrl(data.imageDataUrl);
      setImgNotes(data.notes || '');
      setImgSources(data.sources || []);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Frame Lab error.', 'error');
    } finally {
      setImgBusy(false);
    }
  };

  // ─── 4. Motion Lab Handlers (gemini-omni-1.2-flash) ─────────────────────────
  const handleGenerateVideo = async (opts?: { isExtension?: boolean }) => {
    if (vidBusy) return;
    const isExt = Boolean(opts?.isExtension && vidInteractionId);
    const activePrompt = isExt ? vidExtendPrompt.trim() : vidPrompt.trim();

    if (!activePrompt && !vidStartImgUrl) {
      notify('Upload a starting photo or describe camera motion first.', 'error');
      return;
    }

    setVidBusy(true);
    setBanner(null);

    try {
      const res = await authFetch('/api/ai/video', {
        method: 'POST',
        body: JSON.stringify({
          prompt: activePrompt,
          startImageDataUrl: isExt ? '' : vidStartImgUrl,
          endImageDataUrl: isExt ? '' : vidEndImgUrl,
          previousInteractionId: isExt ? vidInteractionId : '',
          aspectRatio: vidAspect,
          duration: vidDuration,
          resolution: vidResolution,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Video animation failed.');

      setVidResultUrl(data.videoDataUrl || data.videoUri || '');
      if (data.interactionId) {
        setVidInteractionId(data.interactionId);
      }
      if (isExt) {
        setVidExtendPrompt('');
      }
      notify('Cinema shot rendered via Omni Flash.');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Motion Lab error.', 'error');
    } finally {
      setVidBusy(false);
    }
  };

  // ─── 5. Score Lab Handlers (Lyria Clip & Pro) ───────────────────────────────
  const handleGenerateMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!musicPrompt.trim() && !musicSceneUrl) || musicBusy) return;
    setMusicBusy(true);
    setBanner(null);

    try {
      const res = await authFetch('/api/ai/music', {
        method: 'POST',
        body: JSON.stringify({
          prompt: musicPrompt,
          mode: musicMode,
          sceneImageDataUrl: musicSceneUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Music generation failed.');
      setMusicResultUrl(data.audioDataUrl);
      setMusicLyrics(data.lyrics || '');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Score Lab error.', 'error');
    } finally {
      setMusicBusy(false);
    }
  };

  // ─── 6. Voice Slate Transcription Handlers (gemini-3.5-transcribe) ──────────
  const startMicRecording = async () => {
    if (isRecordingAudio) return;
    setBanner(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.push(ev.data);
      };

      recorder.onstop = () => {
        for (const t of stream.getTracks()) t.stop();
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setAudioClipUrl(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      };

      setRecordSeconds(0);
      recorder.start();
      setIsRecordingAudio(true);
      recordTimerRef.current = window.setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err: unknown) {
      notify(
        err instanceof Error ? err.message : 'Microphone permission is needed to record a voice slate.',
        'error'
      );
    }
  };

  const stopMicRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordTimerRef.current) {
      window.clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    setIsRecordingAudio(false);
  };

  const handleTranscribeAudio = async () => {
    if (!audioClipUrl || transcribeBusy) return;
    setTranscribeBusy(true);
    setBanner(null);

    try {
      const res = await authFetch('/api/ai/transcribe', {
        method: 'POST',
        body: JSON.stringify({
          audioDataUrl: audioClipUrl,
          format: transcribeFormat,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transcription failed.');
      setTranscriptResult(data.transcript || '');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Voice Slate error.', 'error');
    } finally {
      setTranscribeBusy(false);
    }
  };

  // ─── 7. Location & Cultural Scout Handlers ──────────────────────────────────
  const handleUseBrowserLocation = () => {
    if (!navigator.geolocation) {
      notify('Geolocation is not supported in this browser.', 'error');
      return;
    }
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: Number(pos.coords.latitude.toFixed(5)),
          longitude: Number(pos.coords.longitude.toFixed(5)),
        });
        setGeoBusy(false);
        notify('Coordinates locked for nearby location scouting.');
      },
      (err) => {
        setGeoBusy(false);
        notify(err.message || 'Location permission declined; scouting by query text.', 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleRunScout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoutQuery.trim() || scoutBusy) return;
    setScoutBusy(true);
    setBanner(null);

    try {
      if (scoutMode === 'maps') {
        const res = await authFetch('/api/ai/ground/maps', {
          method: 'POST',
          body: JSON.stringify({
            query: scoutQuery,
            latitude: coords?.latitude ?? null,
            longitude: coords?.longitude ?? null,
            projectId: activeProjectId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Location scout failed.');
        setScoutSummary(data.summary || '');
        setScoutMapPlaces(data.places || []);
        setScoutWebSources([]);
      } else {
        const res = await authFetch('/api/ai/ground/search', {
          method: 'POST',
          body: JSON.stringify({
            query: scoutQuery,
            projectId: activeProjectId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Search research failed.');
        setScoutSummary(data.summary || '');
        setScoutWebSources(data.sources || []);
        setScoutMapPlaces([]);
      }

      if (authUser) {
        authFetch('/api/vault/scouts')
          .then((r) => r.json())
          .then((d) => {
            if (Array.isArray(d.scouts)) setSavedScouts(d.scouts);
          })
          .catch(() => {});
      }
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Scout Desk error.', 'error');
    } finally {
      setScoutBusy(false);
    }
  };

  // ─── 8. Studio Vault Project Creation ───────────────────────────────────────
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim() || !authUser) return;
    try {
      const res = await authFetch('/api/vault/projects', {
        method: 'POST',
        body: JSON.stringify({
          title: newProjTitle,
          genre: newProjGenre,
          logline: newProjLogline,
          aspectRatio: '16:9',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to create project.');
      setProjects((prev) => [data.project, ...prev]);
      setActiveProjectId(data.project.id);
      setNewProjTitle('');
      setNewProjLogline('');
      notify(`Created production slate "${data.project.title}".`);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Unable to create slate.', 'error');
    }
  };

  const handleDeleteAsset = async (assetId: number) => {
    try {
      const res = await authFetch(`/api/vault/assets/${assetId}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to delete asset.');
      }
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Delete failed.', 'error');
    }
  };

  const filteredAssets = useMemo(() => {
    return vaultFilter === 'all' ? assets : assets.filter((a) => a.kind === vaultFilter);
  }, [assets, vaultFilter]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9600] flex items-center justify-center bg-black/80 backdrop-blur-md p-[2.5%]"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Cina AI Production Suite"
    >
      <div className="flex h-[88vh] w-[95%] max-w-[92rem] flex-col overflow-hidden rounded-xl border border-[var(--c-line-2)] bg-[var(--c-panel)] text-[var(--c-ink)] shadow-2xl">
        {/* Top Bar: Clean 3-Zone Contract inside Suite Modal */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--c-line)] bg-[var(--c-bg)] px-[2.5%] py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <Clapperboard className="h-4 w-4 shrink-0 text-[var(--c-amber)]" />
            <span className="font-[family-name:var(--f-display)] italic text-lg tracking-tight whitespace-nowrap shrink-0">
              Cina Production Suite
            </span>
            {activeProject && (
              <span className="hidden md:inline text-xs text-[var(--c-ink-3)] truncate max-w-[22rem]">
                · Slate: {activeProject.title}
              </span>
            )}
          </div>

          {/* Active Slate Selector */}
          <div className="flex items-center gap-3 shrink-0">
            {authUser && projects.length > 0 && (
              <select
                aria-label="Active Production Slate"
                value={activeProjectId ?? ''}
                onChange={(e) => setActiveProjectId(Number(e.target.value) || null)}
                className="h-9 rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] px-3 text-xs text-[var(--c-ink)] focus:border-[var(--c-amber)] focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    Slate: {p.title}
                  </option>
                ))}
              </select>
            )}

            {authUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStation('vault')}
                  className="h-9 rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] px-3 text-xs font-medium text-[var(--c-ink)] hover:border-[var(--c-amber)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {authUser.displayName || authUser.email?.split('@')[0] || 'Director'} ·{' '}
                  <span className="tabular-nums">{assets.length}</span> takes
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--c-line-2)] text-[var(--c-ink-3)] hover:border-[var(--c-amber)] hover:text-[var(--c-ink)] transition-colors shrink-0 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={authBusy}
                onClick={handleGoogleSignIn}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-[var(--c-amber)] px-4 text-xs font-semibold text-[#0b0806] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{authBusy ? 'Signing In…' : 'Sign In with Google'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close Production Suite"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--c-line-2)] text-[var(--c-ink-3)] hover:border-[var(--c-amber)] hover:text-[var(--c-ink)] transition-colors shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Status / Error Banner */}
        {banner && (
          <div
            className={`flex items-center justify-between gap-4 border-b px-[2.5%] py-2 text-xs ${
              banner.tone === 'error'
                ? 'border-red-500/40 bg-red-950/50 text-red-200'
                : 'border-[var(--c-line)] bg-[var(--c-panel-2)] text-[var(--c-ink-2)]'
            }`}
          >
            <span>{banner.text}</span>
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="text-[var(--c-ink-3)] hover:text-[var(--c-ink)] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Responsive Split Layout */}
        <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
          {/* Station Rail */}
          <nav
            aria-label="Production Stations"
            className="flex lg:w-[22%] lg:max-w-[17rem] shrink-0 gap-1.5 overflow-x-auto lg:overflow-y-auto lg:flex-col border-b lg:border-b-0 lg:border-r border-[var(--c-line)] bg-[var(--c-bg)] p-3"
          >
            {STATIONS.map((item) => {
              const Icon = item.icon;
              const isActive = station === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStation(item.id)}
                  className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors shrink-0 lg:w-full cursor-pointer ${
                    isActive
                      ? 'bg-[var(--c-panel-2)] text-[var(--c-ink)] border border-[var(--c-amber)]'
                      : 'border border-transparent text-[var(--c-ink-3)] hover:bg-[var(--c-panel)] hover:text-[var(--c-ink)]'
                  }`}
                >
                  <Icon
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      isActive ? 'text-[var(--c-amber)]' : 'text-[var(--c-ink-3)]'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold whitespace-nowrap">{item.label}</div>
                    <div className="hidden lg:block text-[0.7rem] leading-snug text-[var(--c-ink-3)] mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Active Station Canvas */}
          <div className="flex-1 min-h-0 overflow-y-auto p-[3%]">
            {/* 01. WRITERS' ROOM */}
            {station === 'chat' && (
              <div className="flex h-full min-h-[62vh] flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--c-line)] pb-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">01. Multi-Turn Writers’ Room</h2>
                    <p className="text-xs text-[var(--c-ink-3)]">
                      Develop screenplays, shot lists, and production plans · Relay any beat directly to visual or audio labs
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      aria-label="Writers Room Role"
                      value={chatPersona}
                      onChange={(e) => setChatPersona(e.target.value)}
                      className="h-8 rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] px-2.5 text-xs text-[var(--c-ink)]"
                    >
                      {PERSONAS.map((p) => (
                        <option key={p.id} value={p.id}>
                          Role: {p.label}
                        </option>
                      ))}
                    </select>
                    <select
                      aria-label="Gemini Model Tier"
                      value={chatModel}
                      onChange={(e) => setChatModel(e.target.value)}
                      className="h-8 rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] px-2.5 text-xs text-[var(--c-ink)]"
                    >
                      {CHAT_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveThreadId(null);
                        setChatHistory([
                          {
                            role: 'model',
                            content: 'Fresh table opened. Pitch your next scene, character arc, or camera sequence.',
                            modelUsed: chatModel,
                          },
                        ]);
                      }}
                      className="h-8 rounded-md border border-[var(--c-line-2)] px-3 text-xs text-[var(--c-ink-2)] hover:border-[var(--c-amber)] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      New Thread
                    </button>
                  </div>
                </div>

                {/* Saved Thread Quick Strip */}
                {threads.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    <span className="text-[var(--c-ink-3)] whitespace-nowrap shrink-0">Saved Threads:</span>
                    {threads.slice(0, 6).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleLoadThread(t)}
                        className={`rounded-md border px-2.5 py-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                          activeThreadId === t.id
                            ? 'border-[var(--c-amber)] bg-[var(--c-panel-2)] text-[var(--c-ink)]'
                            : 'border-[var(--c-line)] text-[var(--c-ink-3)] hover:text-[var(--c-ink)]'
                        }`}
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                )}

                {/* Messages Scroll Area */}
                <div className="flex-1 min-h-[18rem] overflow-y-auto space-y-4 pr-1">
                  {chatHistory.map((turn, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg border p-4 ${
                        turn.role === 'user'
                          ? 'ml-auto max-w-[85%] border-[var(--c-line-2)] bg-[var(--c-bg)]'
                          : 'mr-auto max-w-[92%] border-[var(--c-line)] bg-[var(--c-panel-2)]'
                      }`}
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-[0.7rem] text-[var(--c-ink-3)]">
                        <span>
                          {turn.role === 'user' ? 'Director' : 'Cina Table'}
                          {turn.modelUsed ? ` · ${turn.modelUsed}` : ''}
                        </span>
                        {turn.role === 'model' && idx > 0 && (
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setImgPrompt(turn.content.slice(0, 900));
                                setStation('image');
                              }}
                              className="text-[var(--c-ink-2)] hover:text-[var(--c-amber)] underline-offset-4 hover:underline whitespace-nowrap cursor-pointer"
                            >
                              Send to Frame Lab
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMusicPrompt(turn.content.slice(0, 600));
                                setStation('music');
                              }}
                              className="text-[var(--c-ink-2)] hover:text-[var(--c-amber)] underline-offset-4 hover:underline whitespace-nowrap cursor-pointer"
                            >
                              Score Scene
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--c-ink)]">
                        {turn.content}
                      </div>
                    </div>
                  ))}
                  {chatBusy && (
                    <div className="rounded-lg border border-[var(--c-line)] bg-[var(--c-panel-2)] p-4 text-xs text-[var(--c-ink-3)]">
                      Drafting response with {chatModel}…
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Composer */}
                <form onSubmit={handleSendChat} className="space-y-2 border-t border-[var(--c-line)] pt-3">
                  {chatFrameUrl && (
                    <div className="flex items-center gap-3 text-xs text-[var(--c-ink-3)]">
                      <img
                        src={chatFrameUrl}
                        alt="Attached scene reference"
                        referrerPolicy="no-referrer"
                        className="h-10 w-16 rounded object-cover border border-[var(--c-line)]"
                      />
                      <span>Reference frame attached</span>
                      <button
                        type="button"
                        onClick={() => setChatFrameUrl('')}
                        className="text-[var(--c-amber)] hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <label className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--c-line-2)] bg-[var(--c-bg)] px-3 text-xs text-[var(--c-ink-2)] hover:border-[var(--c-amber)] cursor-pointer whitespace-nowrap shrink-0">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Attach Still</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (ev) => {
                          const file = ev.target.files?.[0];
                          if (file) setChatFrameUrl(await fileToDataUrl(file));
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Write a two-hander scene on the ferry deck, or break down a 5-shot opening sequence…"
                      className="h-10 flex-1 rounded-md border border-[var(--c-line-2)] bg-[var(--c-bg)] px-3.5 text-sm text-[var(--c-ink)] placeholder:text-[var(--c-ink-4)] focus:border-[var(--c-amber)] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={chatBusy || !chatInput.trim()}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--c-amber)] px-5 text-xs font-semibold text-[#0b0806] hover:opacity-90 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 02. LIVE VOICE REHEARSAL */}
            {station === 'live' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5 space-y-5 rounded-xl border border-[var(--c-line)] bg-[var(--c-bg)] p-5">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">02. Live Voice Rehearsal</h2>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--c-ink-3)]">
                      Low-latency bidirectional voice conversation powered by Gemini Live. Rehearse dialogue in character, brainstorm blocking aloud, or test your festival pitch.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--c-ink-2)] mb-1.5">
                        Collaborator Mode
                      </label>
                      <select
                        value={liveRole}
                        disabled={liveConnected || liveConnecting}
                        onChange={(e) =>
                          setLiveRole(e.target.value as 'director' | 'scene_partner' | 'pitch_panel')
                        }
                        className="h-9 w-full rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] px-3 text-xs text-[var(--c-ink)]"
                      >
                        <option value="director">Creative Co-Director · Blocking & Story</option>
                        <option value="scene_partner">Dramatic Scene Partner · Live Table Read</option>
                        <option value="pitch_panel">Festival & Financier Pitch Panel</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--c-ink-2)] mb-1.5">
                        Studio Voice Persona
                      </label>
                      <select
                        value={liveVoice}
                        disabled={liveConnected || liveConnecting}
                        onChange={(e) =>
                          setLiveVoice(
                            e.target.value as 'Zephyr' | 'Kore' | 'Charon' | 'Fenrir' | 'Puck'
                          )
                        }
                        className="h-9 w-full rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] px-3 text-xs text-[var(--c-ink)]"
                      >
                        <option value="Zephyr">Zephyr · Warm & Articulate</option>
                        <option value="Kore">Kore · Crisp & Composed</option>
                        <option value="Charon">Charon · Deep Baritone</option>
                        <option value="Fenrir">Fenrir · Gritty & Direct</option>
                        <option value="Puck">Puck · Quick & Expressive</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {!liveConnected ? (
                      <button
                        type="button"
                        disabled={liveConnecting}
                        onClick={startLiveSession}
                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-[var(--c-amber)] px-4 text-xs font-semibold text-[#0b0806] hover:opacity-90 disabled:opacity-50 whitespace-nowrap cursor-pointer"
                      >
                        <Mic className="h-4 w-4" />
                        <span>{liveConnecting ? 'Connecting Room…' : 'Start Live Voice Session'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopLiveSession}
                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-red-500/60 bg-red-950/50 px-4 text-xs font-semibold text-red-200 hover:bg-red-900/50 whitespace-nowrap cursor-pointer"
                      >
                        <MicOff className="h-4 w-4" />
                        <span>End Live Session</span>
                      </button>
                    )}

                    {liveConnected && (
                      <button
                        type="button"
                        onClick={handleShareFrameToLive}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] px-3.5 text-xs text-[var(--c-ink)] hover:border-[var(--c-amber)] whitespace-nowrap cursor-pointer"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>Share Active Still</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-7 flex flex-col rounded-xl border border-[var(--c-line)] bg-[var(--c-bg)] p-5 min-h-[24rem]">
                  <div className="flex items-center justify-between border-b border-[var(--c-line)] pb-3 mb-4">
                    <span className="text-xs font-semibold text-[var(--c-ink)]">
                      Live Room Transcript · {liveConnected ? 'On Air (16kHz In / 24kHz Out)' : 'Standby'}
                    </span>
                    {liveLog.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const joined = liveLog.map((l) => `${l.speaker}: ${l.text}`).join('\n\n');
                          setChatInput(`Polish this live rehearsal transcript into a screenplay scene:\n\n${joined}`);
                          setStation('chat');
                        }}
                        className="text-xs text-[var(--c-amber)] hover:underline whitespace-nowrap cursor-pointer"
                      >
                        Send Transcript to Writers’ Room
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[20rem] pr-1">
                    {liveLog.length === 0 ? (
                      <p className="text-xs text-[var(--c-ink-3)] py-10 text-center">
                        Start a session and speak into your microphone. You can interrupt naturally at any point.
                      </p>
                    ) : (
                      liveLog.map((entry, idx) => (
                        <div key={idx} className="text-sm leading-relaxed">
                          <span className="font-semibold text-xs text-[var(--c-amber)] mr-2">
                            {entry.speaker}:
                          </span>
                          <span className="text-[var(--c-ink)]">{entry.text}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {liveConnected && (
                    <form onSubmit={handleSendLiveCue} className="mt-4 flex gap-2 border-t border-[var(--c-line)] pt-3">
                      <input
                        type="text"
                        value={liveNoteInput}
                        onChange={(e) => setLiveNoteInput(e.target.value)}
                        placeholder="Send silent stage direction or character adjustment…"
                        className="h-9 flex-1 rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] px-3 text-xs text-[var(--c-ink)] focus:border-[var(--c-amber)] focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="h-9 rounded-md border border-[var(--c-line-2)] px-3.5 text-xs font-medium text-[var(--c-ink)] hover:border-[var(--c-amber)] whitespace-nowrap cursor-pointer"
                      >
                        Cue
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* 03. FRAME LAB (gemini-nano-banana-2.1) */}
            {station === 'image' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <form
                  onSubmit={handleGenerateImage}
                  className="lg:col-span-5 space-y-4 rounded-xl border border-[var(--c-line)] bg-[var(--c-bg)] p-5"
                >
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">03. Frame Lab · Stills & Edits</h2>
                    <p className="mt-1 text-xs text-[var(--c-ink-3)]">
                      Generate 1K–4K storyboards or upload an existing frame to relight, regrade, or alter wardrobe and props.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--c-ink-2)] mb-1.5">
                      Shot Prompt or Image Edit Direction
                    </label>
                    <textarea
                      rows={4}
                      value={imgPrompt}
                      onChange={(e) => setImgPrompt(e.target.value)}
                      className="w-full rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] p-3 text-xs leading-relaxed text-[var(--c-ink)] focus:border-[var(--c-amber)] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--c-ink-2)] mb-1">
                        Aspect Ratio
                      </label>
                      <select
                        value={imgAspect}
                        onChange={(e) => setImgAspect(e.target.value)}
                        className="h-9 w-full rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] px-2.5 text-xs text-[var(--c-ink)]"
                      >
                        <option value="16:9">16:9 · Widescreen</option>
                        <option value="9:16">9:16 · Vertical Reel</option>
                        <option value="4:3">4:3 · Academy</option>
                        <option value="3:4">3:4 · Poster Portrait</option>
                        <option value="1:1">1:1 · Square</option>
                        <option value="4:1">4:1 · Panoramic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--c-ink-2)] mb-1">
                        Resolution
                      </label>
                      <select
                        value={imgSize}
                        onChange={(e) => setImgSize(e.target.value as '1K' | '2K' | '4K')}
                        className="h-9 w-full rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] px-2.5 text-xs text-[var(--c-ink)]"
                      >
                        <option value="1K">1K · Fast Proof</option>
                        <option value="2K">2K · Production Master</option>
                        <option value="4K">4K · Exhibition Plate</option>
                      </select>
                    </div>
                  </div>

                  {/* Optional Source Frame for Image Editing */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--c-ink-2)]">
                        Source Image for Editing (Optional)
                      </span>
                      {imgSourceUrl && (
                        <button
                          type="button"
                          onClick={() => setImgSourceUrl('')}
                          className="text-xs text-[var(--c-amber)] hover:underline cursor-pointer"
                        >
                          Clear Source
                        </button>
                      )}
                    </div>
                    {imgSourceUrl ? (
                      <img
                        src={imgSourceUrl}
                        alt="Edit source plate"
                        referrerPolicy="no-referrer"
                        className="h-28 w-full rounded-md object-cover border border-[var(--c-line)]"
                      />
                    ) : (
                      <label className="flex h-16 w-full items-center justify-center gap-2 rounded-md border border-dashed border-[var(--c-line-2)] bg-[var(--c-panel-2)] text-xs text-[var(--c-ink-3)] hover:border-[var(--c-amber)] cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload photo to edit, relight, or remix</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (ev) => {
                            const f = ev.target.files?.[0];
                            if (f) setImgSourceUrl(await fileToDataUrl(f));
                          }}
                        />
                      </label>
                    )}
                  </div>

                  <label className="flex items-center gap-2.5 text-xs text-[var(--c-ink-2)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={imgSearchGrounding}
                      onChange={(e) => setImgSearchGrounding(e.target.checked)}
                      className="accent-[var(--c-amber)]"
                    />
                    <span>Ground visual details with Google Web & Image Search</span>
                  </label>

                  <button
                    type="submit"
                    disabled={imgBusy}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--c-amber)] px-4 text-xs font-semibold text-[#0b0806] hover:opacity-90 disabled:opacity-50 whitespace-nowrap cursor-pointer"
                  >
                    <Wand2 className="h-4 w-4" />
                    <span>
                      {imgBusy
                        ? `Rendering ${imgSize} Plate…`
                        : imgSourceUrl
                        ? 'Apply Image Edit'
                        : 'Render Cinema Still'}
                    </span>
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-4 rounded-xl border border-[var(--c-line)] bg-[var(--c-bg)] p-5 min-h-[24rem]">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--c-line)] pb-3">
                    <span className="text-xs font-semibold text-[var(--c-ink)]">
                      Lighttable Monitor · {imgSize} · {imgAspect}
                    </span>
                    {imgResultUrl && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setImgSourceUrl(imgResultUrl)}
                          className="rounded border border-[var(--c-line-2)] px-2.5 py-1 text-xs text-[var(--c-ink-2)] hover:border-[var(--c-amber)] whitespace-nowrap cursor-pointer"
                        >
                          Edit This Frame
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVidStartImgUrl(imgResultUrl);
                            setVidAspect(imgAspect === '9:16' ? '9:16' : '16:9');
                            setStation('video');
                          }}
                          className="rounded border border-[var(--c-line-2)] px-2.5 py-1 text-xs text-[var(--c-ink-2)] hover:border-[var(--c-amber)] whitespace-nowrap cursor-pointer"
                        >
                          Animate in Motion Lab →
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMusicSceneUrl(imgResultUrl);
                            setStation('music');
                          }}
                          className="rounded border border-[var(--c-line-2)] px-2.5 py-1 text-xs text-[var(--c-ink-2)] hover:border-[var(--c-amber)] whitespace-nowrap cursor-pointer"
                        >
                          Score Frame →
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            saveTakeToVault({
                              kind: 'image',
                              title: imgPrompt.slice(0, 64),
                              prompt: imgPrompt,
                              modelUsed: 'gemini-nano-banana-2.1',
                              mediaDataUrl: imgResultUrl,
                              aspectRatio: imgAspect,
                            })
                          }
                          className="rounded bg-[var(--c-amber)] px-2.5 py-1 text-xs font-semibold text-[#0b0806] whitespace-nowrap cursor-pointer"
                        >
                          Save to Vault
                        </button>
                      </div>
                    )}
                  </div>

                  {imgResultUrl ? (
                    <div className="space-y-3">
                      <img
                        src={imgResultUrl}
                        alt={imgPrompt}
                        referrerPolicy="no-referrer"
                        className="max-h-[54vh] w-full rounded-lg object-contain bg-black/60 border border-[var(--c-line)]"
                      />
                      {imgNotes && (
                        <p className="text-xs leading-relaxed text-[var(--c-ink-2)]">{imgNotes}</p>
                      )}
                      {imgSources.length > 0 && (
                        <div className="flex flex-wrap gap-3 text-xs text-[var(--c-ink-3)]">
                          <span>Visual References:</span>
                          {imgSources.map((s, i) => (
                            <a
                              key={i}
                              href={s.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--c-amber)] hover:underline"
                            >
                              {s.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-72 flex-col items-center justify-center text-center text-xs text-[var(--c-ink-3)]">
                      <ImageIcon className="h-8 w-8 mb-2 text-[var(--c-ink-4)]" />
                      <p>Render a new cinema frame or upload a photo to edit.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 04. MOTION LAB (gemini-omni-1.2-flash) */}
            {station === 'video' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5 space-y-4 rounded-xl border border-[var(--c-line)] bg-[var(--c-bg)] p-5">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">04. Motion Lab · Animate & Direct</h2>
                    <p className="mt-1 text-xs text-[var(--c-ink-3)]">
                      Upload any photograph or Frame Lab still to animate into landscape (16:9) or portrait (9:16) cinema video—then extend or restyle shots across turns.
                    </p>
                  </div>

                  {/* Start Frame Upload */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[var(--c-ink-2)]">Starting Photo</span>
                        {vidStartImgUrl && (
                          <button
                            type="button"
                            onClick={() => setVidStartImgUrl('')}
                            className="text-[var(--c-amber)] hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      {vidStartImgUrl ? (
                        <img
                          src={vidStartImgUrl}
                          alt="Starting keyframe"
                          referrerPolicy="no-referrer"
                          className="h-24 w-full rounded object-cover border border-[var(--c-line)]"
                        />
                      ) : (
                        <label className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded border border-dashed border-[var(--c-line-2)] bg-[var(--c-panel-2)] text-[0.7rem] text-[var(--c-ink-3)] hover:border-[var(--c-amber)] cursor-pointer p-2 text-center">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload Photo to Animate</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (ev) => {
                              const f = ev.target.files?.[0];
                              if (f) setVidStartImgUrl(await fileToDataUrl(f));
                            }}
                          />
                        </label>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[var(--c-ink-2)]">End Keyframe (Optional)</span>
                        {vidEndImgUrl && (
                          <button
                            type="button"
                            onClick={() => setVidEndImgUrl('')}
                            className="text-[var(--c-amber)] hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      {vidEndImgUrl ? (
                        <img
                          src={vidEndImgUrl}
                          alt="Ending keyframe"
                          referrerPolicy="no-referrer"
                          className="h-24 w-full rounded object-cover border border-[var(--c-line)]"
                        />
                      ) : (
                        <label className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded border border-dashed border-[var(--c-line-2)] bg-[var(--c-panel-2)] text-[0.7rem] text-[var(--c-ink-3)] hover:border-[var(--c-amber)] cursor-pointer p-2 text-center">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Optional Target Frame</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (ev) => {
                              const f = ev.target.files?.[0];
                              if (f) setVidEndImgUrl(await fileToDataUrl(f));
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--c-ink-2)] mb-1.5">
                      Camera Movement & Scene Action
                    </label>
                    <textarea
                      rows={3}
                      value={vidPrompt}
                      onChange={(e) => setVidPrompt(e.target.value)}
                      className="w-full rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] p-3 text-xs leading-relaxed text-[var(--c-ink)] focus:border-[var(--c-amber)] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[0.7rem] text-[var(--c-ink-3)] mb-1">Format</label>
                      <select
                        value={vidAspect}
                        onChange={(e) => setVidAspect(e.target.value as '16:9' | '9:16')}
                        className="h-9 w-full rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] px-2 text-xs text-[var(--c-ink)]"
                      >
                        <option value="16:9">16:9 Landscape</option>
                        <option value="9:16">9:16 Portrait</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[0.7rem] text-[var(--c-ink-3)] mb-1">Duration</label>
                      <select
                        value={vidDuration}
                        onChange={(e) => setVidDuration(e.target.value as '5s' | '8s' | '10s')}
                        className="h-9 w-full rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] px-2 text-xs text-[var(--c-ink)]"
                      >
                        <option value="5s">5 sec</option>
                        <option value="8s">8 sec</option>
                        <option value="10s">10 sec</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[0.7rem] text-[var(--c-ink-3)] mb-1">Master</label>
                      <select
                        value={vidResolution}
                        onChange={(e) => setVidResolution(e.target.value as '720p' | '1080p')}
                        className="h-9 w-full rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] px-2 text-xs text-[var(--c-ink)]"
                      >
                        <option value="720p">720p</option>
                        <option value="1080p">1080p</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={vidBusy}
                    onClick={() => handleGenerateVideo({ isExtension: false })}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--c-amber)] px-4 text-xs font-semibold text-[#0b0806] hover:opacity-90 disabled:opacity-50 whitespace-nowrap cursor-pointer"
                  >
                    <Film className="h-4 w-4" />
                    <span>
                      {vidBusy
                        ? 'Rendering Cinema Video (may take 30–90s)…'
                        : vidStartImgUrl
                        ? 'Animate Photo into Video'
                        : 'Generate Cinema Shot'}
                    </span>
                  </button>
                </div>

                <div className="lg:col-span-7 space-y-4 rounded-xl border border-[var(--c-line)] bg-[var(--c-bg)] p-5 min-h-[24rem]">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--c-line)] pb-3">
                    <span className="text-xs font-semibold text-[var(--c-ink)]">
                      Screening Monitor · {vidAspect} · {vidDuration} · {vidResolution}
                    </span>
                    {vidResultUrl && (
                      <div className="flex items-center gap-2">
                        <a
                          href={vidResultUrl}
                          download="cina-shot.mp4"
                          className="inline-flex items-center gap-1.5 rounded border border-[var(--c-line-2)] px-2.5 py-1 text-xs text-[var(--c-ink-2)] hover:border-[var(--c-amber)] whitespace-nowrap"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download MP4</span>
                        </a>
                        <button
                          type="button"
                          onClick={() =>
                            saveTakeToVault({
                              kind: 'video',
                              title: vidPrompt.slice(0, 64) || 'Animated Cinema Shot',
                              prompt: vidPrompt,
                              modelUsed: 'gemini-omni-1.2-flash',
                              mediaDataUrl: vidResultUrl,
                              interactionId: vidInteractionId,
                              aspectRatio: vidAspect,
                            })
                          }
                          className="rounded bg-[var(--c-amber)] px-2.5 py-1 text-xs font-semibold text-[#0b0806] whitespace-nowrap cursor-pointer"
                        >
                          Save to Vault
                        </button>
                      </div>
                    )}
                  </div>

                  {vidResultUrl ? (
                    <div className="space-y-4">
                      <video
                        src={vidResultUrl}
                        controls
                        autoPlay
                        loop
                        playsInline
                        className="max-h-[50vh] w-full rounded-lg bg-black border border-[var(--c-line)]"
                      />
                      {vidInteractionId && (
                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          <input
                            type="text"
                            value={vidExtendPrompt}
                            onChange={(e) => setVidExtendPrompt(e.target.value)}
                            placeholder="Extend or edit this shot (e.g., Continue the scene as the camera pans out to the harbor)…"
                            className="h-9 flex-1 rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] px-3 text-xs text-[var(--c-ink)] focus:border-[var(--c-amber)] focus:outline-none"
                          />
                          <button
                            type="button"
                            disabled={vidBusy || !vidExtendPrompt.trim()}
                            onClick={() => handleGenerateVideo({ isExtension: true })}
                            className="h-9 rounded-md border border-[var(--c-amber)] px-3.5 text-xs font-medium text-[var(--c-ink)] hover:bg-[var(--c-amber)] hover:text-[#0b0806] disabled:opacity-50 whitespace-nowrap cursor-pointer transition-colors"
                          >
                            Extend / Edit Shot
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-72 flex-col items-center justify-center text-center text-xs text-[var(--c-ink-3)]">
                      <Film className="h-8 w-8 mb-2 text-[var(--c-ink-4)]" />
                      <p>Upload a photo or relay a Frame Lab still to animate into cinema motion.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 05. SCORE LAB (Lyria Clip & Lyria Pro) */}
            {station === 'music' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <form
                  onSubmit={handleGenerateMusic}
                  className="lg:col-span-5 space-y-4 rounded-xl border border-[var(--c-line)] bg-[var(--c-bg)] p-5"
                >
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">05. Score Lab · Lyria Film Scoring</h2>
                    <p className="mt-1 text-xs text-[var(--c-ink-3)]">
                      Compose 30-second cues (Lyria Clip) or full-length tracks (Lyria Pro), optionally scored directly to a visual scene still.
                    </p>
                  </div>

                  <div className="flex gap-2 rounded-lg bg-[var(--c-panel-2)] p-1 border border-[var(--c-line)]">
                    <button
                      type="button"
                      onClick={() => setMusicMode('clip')}
                      className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                        musicMode === 'clip'
                          ? 'bg-[var(--c-amber)] text-[#0b0806] font-semibold'
                          : 'text-[var(--c-ink-3)] hover:text-[var(--c-ink)]'
                      }`}
                    >
                      Lyria Clip · 30s Cue
                    </button>
                    <button
                      type="button"
                      onClick={() => setMusicMode('pro')}
                      className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                        musicMode === 'pro'
                          ? 'bg-[var(--c-amber)] text-[#0b0806] font-semibold'
                          : 'text-[var(--c-ink-3)] hover:text-[var(--c-ink)]'
                      }`}
                    >
                      Lyria Pro · Full Track
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--c-ink-2)] mb-1.5">
                      Instrumentation, Tempo & Emotional Arc
                    </label>
                    <textarea
                      rows={4}
                      value={musicPrompt}
                      onChange={(e) => setMusicPrompt(e.target.value)}
                      className="w-full rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] p-3 text-xs leading-relaxed text-[var(--c-ink)] focus:border-[var(--c-amber)] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[var(--c-ink-2)]">
                        Picture-Lock Scene Still (Optional)
                      </span>
                      {musicSceneUrl && (
                        <button
                          type="button"
                          onClick={() => setMusicSceneUrl('')}
                          className="text-[var(--c-amber)] hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {musicSceneUrl ? (
                      <img
                        src={musicSceneUrl}
                        alt="Scene reference for score"
                        referrerPolicy="no-referrer"
                        className="h-28 w-full rounded object-cover border border-[var(--c-line)]"
                      />
                    ) : (
                      <label className="flex h-16 w-full items-center justify-center gap-2 rounded-md border border-dashed border-[var(--c-line-2)] bg-[var(--c-panel-2)] text-xs text-[var(--c-ink-3)] hover:border-[var(--c-amber)] cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Attach scene still to score to picture</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (ev) => {
                            const f = ev.target.files?.[0];
                            if (f) setMusicSceneUrl(await fileToDataUrl(f));
                          }}
                        />
                      </label>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={musicBusy}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--c-amber)] px-4 text-xs font-semibold text-[#0b0806] hover:opacity-90 disabled:opacity-50 whitespace-nowrap cursor-pointer"
                  >
                    <Music className="h-4 w-4" />
                    <span>{musicBusy ? 'Composing Score…' : 'Compose Original Score'}</span>
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-4 rounded-xl border border-[var(--c-line)] bg-[var(--c-bg)] p-5 min-h-[24rem]">
                  <div className="flex items-center justify-between border-b border-[var(--c-line)] pb-3">
                    <span className="text-xs font-semibold text-[var(--c-ink)]">
                      Scoring Stage Playback ·{' '}
                      {musicMode === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview'}
                    </span>
                    {musicResultUrl && (
                      <div className="flex items-center gap-2">
                        <a
                          href={musicResultUrl}
                          download="cina-score.mp3"
                          className="inline-flex items-center gap-1.5 rounded border border-[var(--c-line-2)] px-2.5 py-1 text-xs text-[var(--c-ink-2)] hover:border-[var(--c-amber)] whitespace-nowrap"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download Audio</span>
                        </a>
                        <button
                          type="button"
                          onClick={() =>
                            saveTakeToVault({
                              kind: 'music',
                              title: musicPrompt.slice(0, 64) || 'Original Cue',
                              prompt: musicPrompt,
                              modelUsed:
                                musicMode === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview',
                              mediaDataUrl: musicResultUrl,
                              textBody: musicLyrics,
                            })
                          }
                          className="rounded bg-[var(--c-amber)] px-2.5 py-1 text-xs font-semibold text-[#0b0806] whitespace-nowrap cursor-pointer"
                        >
                          Save to Vault
                        </button>
                      </div>
                    )}
                  </div>

                  {musicResultUrl ? (
                    <div className="space-y-4 pt-2">
                      <audio controls src={musicResultUrl} className="w-full" />
                      {musicLyrics && (
                        <div className="rounded-lg border border-[var(--c-line)] bg-[var(--c-panel-2)] p-4">
                          <div className="text-xs font-semibold text-[var(--c-ink-2)] mb-2">
                            Score Notes / Lyrics
                          </div>
                          <pre className="whitespace-pre-wrap font-[family-name:var(--f-sans)] text-xs leading-relaxed text-[var(--c-ink)]">
                            {musicLyrics}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-72 flex-col items-center justify-center text-center text-xs text-[var(--c-ink-3)]">
                      <Music className="h-8 w-8 mb-2 text-[var(--c-ink-4)]" />
                      <p>Describe your cue or attach a frame to compose original cinema music.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 06. VOICE SLATE TRANSCRIPTION (gemini-3.5-transcribe) */}
            {station === 'transcribe' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5 space-y-4 rounded-xl border border-[var(--c-line)] bg-[var(--c-bg)] p-5">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">06. Voice Slate & Table-Read Transcriber</h2>
                    <p className="mt-1 text-xs text-[var(--c-ink-3)]">
                      Record spoken scene notes or upload on-set audio to transcribe accurately with Gemini 3.5 Transcribe.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {!isRecordingAudio ? (
                      <button
                        type="button"
                        onClick={startMicRecording}
                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-[var(--c-amber)] px-4 text-xs font-semibold text-[#0b0806] hover:opacity-90 whitespace-nowrap cursor-pointer"
                      >
                        <Mic className="h-4 w-4" />
                        <span>Record Microphone</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopMicRecording}
                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-red-500/60 bg-red-950/60 px-4 text-xs font-semibold text-red-200 whitespace-nowrap cursor-pointer"
                      >
                        <Square className="h-3.5 w-3.5" />
                        <span className="tabular-nums">Stop Recording ({recordSeconds}s)</span>
                      </button>
                    )}

                    <label className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] px-3.5 text-xs text-[var(--c-ink)] hover:border-[var(--c-amber)] whitespace-nowrap cursor-pointer">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Audio</span>
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={async (ev) => {
                          const f = ev.target.files?.[0];
                          if (f) setAudioClipUrl(await fileToDataUrl(f));
                        }}
                      />
                    </label>
                  </div>

                  {audioClipUrl && (
                    <div className="space-y-2 pt-1">
                      <div className="text-xs text-[var(--c-ink-3)]">Recorded / Uploaded Slate Ready:</div>
                      <audio controls src={audioClipUrl} className="w-full" />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-[var(--c-ink-2)] mb-1.5">
                      Output Formatting
                    </label>
                    <select
                      value={transcribeFormat}
                      onChange={(e) =>
                        setTranscribeFormat(e.target.value as 'verbatim' | 'screenplay' | 'beats')
                      }
                      className="h-9 w-full rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] px-3 text-xs text-[var(--c-ink)]"
                    >
                      <option value="screenplay">Fountain Screenplay Dialogue</option>
                      <option value="verbatim">Verbatim Clean Transcript</option>
                      <option value="beats">Verbatim + Director Beat Summary</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={!audioClipUrl || transcribeBusy}
                    onClick={handleTranscribeAudio}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[var(--c-amber)] px-4 text-xs font-semibold text-[var(--c-ink)] hover:bg-[var(--c-amber)] hover:text-[#0b0806] disabled:opacity-40 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>{transcribeBusy ? 'Transcribing Audio…' : 'Transcribe Audio Slate'}</span>
                  </button>
                </div>

                <div className="lg:col-span-7 space-y-4 rounded-xl border border-[var(--c-line)] bg-[var(--c-bg)] p-5 min-h-[24rem]">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--c-line)] pb-3">
                    <span className="text-xs font-semibold text-[var(--c-ink)]">
                      Transcript Output · gemini-3.5-transcribe
                    </span>
                    {transcriptResult && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setChatInput(`Develop this transcribed scene further:\n\n${transcriptResult}`);
                            setStation('chat');
                          }}
                          className="rounded border border-[var(--c-line-2)] px-2.5 py-1 text-xs text-[var(--c-ink-2)] hover:border-[var(--c-amber)] whitespace-nowrap cursor-pointer"
                        >
                          Workshop in Writers’ Room →
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            saveTakeToVault({
                              kind: 'transcript',
                              title: transcriptResult.slice(0, 56) || 'Voice Slate Transcript',
                              prompt: `Format: ${transcribeFormat}`,
                              modelUsed: 'gemini-3.5-transcribe',
                              textBody: transcriptResult,
                            })
                          }
                          className="rounded bg-[var(--c-amber)] px-2.5 py-1 text-xs font-semibold text-[#0b0806] whitespace-nowrap cursor-pointer"
                        >
                          Save to Vault
                        </button>
                      </div>
                    )}
                  </div>

                  {transcriptResult ? (
                    <pre className="whitespace-pre-wrap font-[family-name:var(--f-mono)] text-xs leading-relaxed text-[var(--c-ink)]">
                      {transcriptResult}
                    </pre>
                  ) : (
                    <div className="flex h-72 flex-col items-center justify-center text-center text-xs text-[var(--c-ink-3)]">
                      <Mic className="h-8 w-8 mb-2 text-[var(--c-ink-4)]" />
                      <p>Record your voice or upload an audio memo to generate a clean transcript.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 07. LOCATION & CULTURAL SCOUT (Google Maps & Google Search Grounding) */}
            {station === 'scout' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <form
                  onSubmit={handleRunScout}
                  className="lg:col-span-5 space-y-4 rounded-xl border border-[var(--c-line)] bg-[var(--c-bg)] p-5"
                >
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">07. Location & Cultural Scout</h2>
                    <p className="mt-1 text-xs text-[var(--c-ink-3)]">
                      Scout real-world filming locations and screening venues via Google Maps Grounding, or research live festival and industry intelligence via Google Search Grounding.
                    </p>
                  </div>

                  <div className="flex gap-2 rounded-lg bg-[var(--c-panel-2)] p-1 border border-[var(--c-line)]">
                    <button
                      type="button"
                      onClick={() => setScoutMode('maps')}
                      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                        scoutMode === 'maps'
                          ? 'bg-[var(--c-amber)] text-[#0b0806] font-semibold'
                          : 'text-[var(--c-ink-3)] hover:text-[var(--c-ink)]'
                      }`}
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Maps Location Scout</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScoutMode('search')}
                      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                        scoutMode === 'search'
                          ? 'bg-[var(--c-amber)] text-[#0b0806] font-semibold'
                          : 'text-[var(--c-ink-3)] hover:text-[var(--c-ink)]'
                      }`}
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>Search Intelligence</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--c-ink-2)] mb-1.5">
                      {scoutMode === 'maps'
                        ? 'Location Look, Architecture, or Screening Venue Brief'
                        : 'Festival, Box-Office, Historical, or Cultural Query'}
                    </label>
                    <textarea
                      rows={4}
                      value={scoutQuery}
                      onChange={(e) => setScoutQuery(e.target.value)}
                      className="w-full rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] p-3 text-xs leading-relaxed text-[var(--c-ink)] focus:border-[var(--c-amber)] focus:outline-none"
                    />
                  </div>

                  {scoutMode === 'maps' && (
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <button
                        type="button"
                        disabled={geoBusy}
                        onClick={handleUseBrowserLocation}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] px-3 py-1.5 text-xs text-[var(--c-ink)] hover:border-[var(--c-amber)] whitespace-nowrap cursor-pointer"
                      >
                        <MapPin className="h-3.5 w-3.5 text-[var(--c-amber)]" />
                        <span>{geoBusy ? 'Locating…' : 'Use My Coordinates'}</span>
                      </button>
                      {coords && (
                        <span className="font-[family-name:var(--f-mono)] text-[0.7rem] text-[var(--c-ink-3)] tabular-nums">
                          {coords.latitude}, {coords.longitude}
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={scoutBusy}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--c-amber)] px-4 text-xs font-semibold text-[#0b0806] hover:opacity-90 disabled:opacity-50 whitespace-nowrap cursor-pointer"
                  >
                    <Compass className="h-4 w-4" />
                    <span>
                      {scoutBusy
                        ? 'Scouting Live Data…'
                        : scoutMode === 'maps'
                        ? 'Scout Real Locations on Google Maps'
                        : 'Run Live Google Search Brief'}
                    </span>
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-4 rounded-xl border border-[var(--c-line)] bg-[var(--c-bg)] p-5 min-h-[24rem]">
                  <div className="flex items-center justify-between border-b border-[var(--c-line)] pb-3">
                    <span className="text-xs font-semibold text-[var(--c-ink)]">
                      Scout Dossier · {scoutMode === 'maps' ? 'Google Maps Grounding' : 'Google Search Grounding'}
                    </span>
                    {scoutSummary && (
                      <button
                        type="button"
                        onClick={() => {
                          setImgPrompt(
                            `Cinematic location concept still based on this scout report: ${scoutSummary.slice(0, 700)}`
                          );
                          setStation('image');
                        }}
                        className="text-xs text-[var(--c-amber)] hover:underline whitespace-nowrap cursor-pointer"
                      >
                        Visualize Location in Frame Lab →
                      </button>
                    )}
                  </div>

                  {scoutSummary ? (
                    <div className="space-y-5">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--c-ink)]">
                        {scoutSummary}
                      </div>

                      {/* Google Maps Grounding Links + Review Snippets (Mandatory Extraction) */}
                      {scoutMapPlaces.length > 0 && (
                        <div className="space-y-3 border-t border-[var(--c-line)] pt-4">
                          <div className="text-xs font-semibold text-[var(--c-ink-2)]">
                            Verified Google Maps Locations ({scoutMapPlaces.length})
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {scoutMapPlaces.map((place, idx) => (
                              <div
                                key={idx}
                                className="rounded-lg border border-[var(--c-line)] bg-[var(--c-panel-2)] p-3 space-y-1.5"
                              >
                                <a
                                  href={place.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--c-amber)] hover:underline"
                                >
                                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                                  <span>{place.title}</span>
                                </a>
                                {place.reviewSnippets.length > 0 && (
                                  <div className="space-y-1 pt-1">
                                    {place.reviewSnippets.slice(0, 2).map((snip, sIdx) => (
                                      <p
                                        key={sIdx}
                                        className="text-[0.7rem] leading-snug text-[var(--c-ink-3)]"
                                      >
                                        “{snip}”
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Google Search Grounding Source Links */}
                      {scoutWebSources.length > 0 && (
                        <div className="space-y-2 border-t border-[var(--c-line)] pt-4">
                          <div className="text-xs font-semibold text-[var(--c-ink-2)]">
                            Grounded Web Sources ({scoutWebSources.length})
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                            {scoutWebSources.map((src, idx) => (
                              <a
                                key={idx}
                                href={src.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--c-amber)] hover:underline"
                              >
                                {src.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-72 flex-col items-center justify-center text-center text-xs text-[var(--c-ink-3)]">
                      <Compass className="h-8 w-8 mb-2 text-[var(--c-ink-4)]" />
                      <p>Run a Maps location scout or live Search brief to populate verified links and notes.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 08. STUDIO VAULT (Cloud SQL + Firebase Auth) */}
            {station === 'vault' && (
              <div className="space-y-6">
                {!authUser ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--c-line)] bg-[var(--c-bg)] p-10 text-center space-y-4">
                    <FolderKanban className="h-10 w-10 text-[var(--c-amber)]" />
                    <h2 className="text-xl font-semibold tracking-tight">
                      Sign In to Unlock Your Studio Slate Vault
                    </h2>
                    <p className="max-w-lg text-xs leading-relaxed text-[var(--c-ink-3)]">
                      Persist production slates, 4K frames, animated shots, Lyria film cues, voice transcripts, multi-turn Writers’ Room threads, and scouted location dossiers across sessions.
                    </p>
                    <button
                      type="button"
                      disabled={authBusy}
                      onClick={handleGoogleSignIn}
                      className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--c-amber)] px-5 text-xs font-semibold text-[#0b0806] hover:opacity-90 whitespace-nowrap cursor-pointer"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>{authBusy ? 'Signing In…' : 'Sign In with Google'}</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Slates Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <form
                        onSubmit={handleCreateProject}
                        className="lg:col-span-5 space-y-3 rounded-xl border border-[var(--c-line)] bg-[var(--c-bg)] p-5"
                      >
                        <div className="text-sm font-semibold">New Production Slate</div>
                        <input
                          type="text"
                          required
                          value={newProjTitle}
                          onChange={(e) => setNewProjTitle(e.target.value)}
                          placeholder="Film or Series Title (e.g., Glass Harbor)"
                          className="h-9 w-full rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] px-3 text-xs text-[var(--c-ink)] focus:border-[var(--c-amber)] focus:outline-none"
                        />
                        <input
                          type="text"
                          value={newProjGenre}
                          onChange={(e) => setNewProjGenre(e.target.value)}
                          placeholder="Genre · Format"
                          className="h-9 w-full rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] px-3 text-xs text-[var(--c-ink)] focus:border-[var(--c-amber)] focus:outline-none"
                        />
                        <textarea
                          rows={2}
                          value={newProjLogline}
                          onChange={(e) => setNewProjLogline(e.target.value)}
                          placeholder="Logline (automatically informs Writers’ Room context)…"
                          className="w-full rounded-md border border-[var(--c-line-2)] bg-[var(--c-panel-2)] p-3 text-xs text-[var(--c-ink)] focus:border-[var(--c-amber)] focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[var(--c-amber)] px-4 text-xs font-semibold text-[#0b0806] whitespace-nowrap cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Create Slate</span>
                        </button>
                      </form>

                      <div className="lg:col-span-7 space-y-3 rounded-xl border border-[var(--c-line)] bg-[var(--c-bg)] p-5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">
                            Active Slates (<span className="tabular-nums">{projects.length}</span>)
                          </span>
                          {vaultLoading && (
                            <span className="text-xs text-[var(--c-ink-3)]">Refreshing…</span>
                          )}
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {projects.map((proj) => {
                            const selected = proj.id === activeProjectId;
                            return (
                              <div
                                key={proj.id}
                                onClick={() => setActiveProjectId(proj.id)}
                                className={`flex items-start justify-between gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                                  selected
                                    ? 'border-[var(--c-amber)] bg-[var(--c-panel-2)]'
                                    : 'border-[var(--c-line)] hover:border-[var(--c-line-2)]'
                                }`}
                              >
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-[var(--c-ink)]">
                                    {proj.title}
                                  </div>
                                  <div className="text-[0.7rem] text-[var(--c-ink-3)] mt-0.5">
                                    {proj.genre} · {proj.aspectRatio}
                                  </div>
                                  {proj.logline && (
                                    <p className="text-xs text-[var(--c-ink-2)] mt-1 line-clamp-2">
                                      {proj.logline}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Saved Takes & Assets */}
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--c-line)] pb-3">
                        <div className="text-sm font-semibold">
                          Saved Vault Takes (<span className="tabular-nums">{filteredAssets.length}</span>)
                        </div>
                        <div className="flex items-center gap-1 rounded-lg bg-[var(--c-bg)] p-1 border border-[var(--c-line)]">
                          {(['all', 'image', 'video', 'music', 'transcript'] as const).map((f) => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => setVaultFilter(f)}
                              className={`rounded px-2.5 py-1 text-xs capitalize whitespace-nowrap cursor-pointer ${
                                vaultFilter === f
                                  ? 'bg-[var(--c-panel-2)] text-[var(--c-ink)] font-semibold'
                                  : 'text-[var(--c-ink-3)] hover:text-[var(--c-ink)]'
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>

                      {filteredAssets.length === 0 ? (
                        <p className="py-8 text-center text-xs text-[var(--c-ink-3)]">
                          No saved takes in this category yet. Generate frames, shots, cues, or transcripts and click Save to Vault.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredAssets.map((asset) => (
                            <div
                              key={asset.id}
                              className="flex flex-col justify-between rounded-xl border border-[var(--c-line)] bg-[var(--c-bg)] p-4 space-y-3"
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="text-xs font-semibold text-[var(--c-ink)] truncate">
                                      {asset.title}
                                    </div>
                                    <div className="text-[0.7rem] text-[var(--c-ink-3)]">
                                      {asset.kind} · {asset.modelUsed}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAsset(asset.id)}
                                    title="Delete Take"
                                    className="text-[var(--c-ink-3)] hover:text-red-400 shrink-0 cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                {asset.kind === 'image' && asset.mediaDataUrl && (
                                  <img
                                    src={asset.mediaDataUrl}
                                    alt={asset.title}
                                    referrerPolicy="no-referrer"
                                    className="h-40 w-full rounded object-cover border border-[var(--c-line)]"
                                  />
                                )}
                                {asset.kind === 'video' && asset.mediaDataUrl && (
                                  <video
                                    src={asset.mediaDataUrl}
                                    controls
                                    playsInline
                                    className="h-40 w-full rounded object-cover bg-black border border-[var(--c-line)]"
                                  />
                                )}
                                {asset.kind === 'music' && asset.mediaDataUrl && (
                                  <audio controls src={asset.mediaDataUrl} className="w-full" />
                                )}
                                {asset.kind === 'transcript' && asset.textBody && (
                                  <pre className="max-h-32 overflow-y-auto whitespace-pre-wrap rounded bg-[var(--c-panel-2)] p-2.5 text-[0.7rem] text-[var(--c-ink-2)]">
                                    {asset.textBody}
                                  </pre>
                                )}
                              </div>

                              {asset.kind === 'image' && asset.mediaDataUrl && (
                                <div className="flex items-center gap-3 pt-1 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setVidStartImgUrl(asset.mediaDataUrl);
                                      setStation('video');
                                    }}
                                    className="text-[var(--c-amber)] hover:underline whitespace-nowrap cursor-pointer"
                                  >
                                    Animate →
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMusicSceneUrl(asset.mediaDataUrl);
                                      setStation('music');
                                    }}
                                    className="text-[var(--c-amber)] hover:underline whitespace-nowrap cursor-pointer"
                                  >
                                    Score →
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Saved Scout Reports */}
                    {savedScouts.length > 0 && (
                      <div className="space-y-3 border-t border-[var(--c-line)] pt-4">
                        <div className="text-sm font-semibold">
                          Recent Scout Dossiers (<span className="tabular-nums">{savedScouts.length}</span>)
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {savedScouts.slice(0, 4).map((rep) => (
                            <div
                              key={rep.id}
                              className="rounded-lg border border-[var(--c-line)] bg-[var(--c-bg)] p-3.5 space-y-1.5"
                            >
                              <div className="text-xs font-semibold text-[var(--c-ink)]">
                                {rep.query}
                              </div>
                              <div className="text-[0.7rem] text-[var(--c-ink-3)]">
                                {rep.mode === 'maps' ? 'Google Maps Scout' : 'Google Search Brief'}
                              </div>
                              <p className="text-xs text-[var(--c-ink-2)] line-clamp-3">
                                {rep.summary}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
