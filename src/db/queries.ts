import { and, desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  chatMessages,
  chatThreads,
  scoutReports,
  studioAssets,
  studioProjects,
  users,
} from './schema.ts';

export async function syncOrFetchUser(params: {
  uid: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
}) {
  const safeEmail = params.email || `${params.uid}@cina.studio`;
  const defaultName =
    params.displayName?.trim() || safeEmail.split('@')[0] || 'Director';
  const handleBase = defaultName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 18) || 'director';

  try {
    const rows = await db
      .insert(users)
      .values({
        uid: params.uid,
        email: safeEmail,
        displayName: defaultName,
        photoUrl: params.photoUrl || '',
        studioHandle: `@${handleBase}`,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: safeEmail,
          displayName: defaultName,
          photoUrl: params.photoUrl || '',
        },
      })
      .returning();

    return rows[0];
  } catch (error) {
    console.error('Failed to upsert user record:', error);
    throw new Error('Unable to synchronize user profile at this time.', {
      cause: error,
    });
  }
}

export async function listUserProjects(uid: string) {
  try {
    const existing = await db
      .select()
      .from(studioProjects)
      .where(eq(studioProjects.userUid, uid))
      .orderBy(desc(studioProjects.updatedAt));

    if (existing.length > 0) {
      return existing;
    }

    // Seed a starter production slate for newly signed-in directors
    const seeded = await db
      .insert(studioProjects)
      .values({
        userUid: uid,
        title: 'Nocturne in Marseille',
        logline:
          'At an overnight Mediterranean port terminal, an archival sound recordist uncovers a frequency linking two estranged timelines.',
        genre: 'Neo-Noir · Arthouse',
        aspectRatio: '16:9',
        status: 'in_production',
      })
      .returning();

    return seeded;
  } catch (error) {
    console.error('Failed to list studio projects:', error);
    throw new Error('Unable to load studio projects.', { cause: error });
  }
}

export async function createUserProject(params: {
  uid: string;
  title: string;
  logline: string;
  genre: string;
  aspectRatio: string;
}) {
  try {
    const rows = await db
      .insert(studioProjects)
      .values({
        userUid: params.uid,
        title: params.title.trim().slice(0, 160),
        logline: params.logline.trim().slice(0, 1000),
        genre: params.genre.trim().slice(0, 80) || 'Cinema',
        aspectRatio: params.aspectRatio === '9:16' ? '9:16' : '16:9',
        status: 'in_production',
      })
      .returning();
    return rows[0];
  } catch (error) {
    console.error('Failed to create studio project:', error);
    throw new Error('Unable to create studio project.', { cause: error });
  }
}

export async function deleteUserProject(uid: string, projectId: number) {
  try {
    await db
      .delete(studioProjects)
      .where(and(eq(studioProjects.id, projectId), eq(studioProjects.userUid, uid)));
  } catch (error) {
    console.error('Failed to delete studio project:', error);
    throw new Error('Unable to delete studio project.', { cause: error });
  }
}

export async function listUserAssets(uid: string, projectId?: number | null) {
  try {
    if (projectId) {
      return await db
        .select()
        .from(studioAssets)
        .where(and(eq(studioAssets.userUid, uid), eq(studioAssets.projectId, projectId)))
        .orderBy(desc(studioAssets.createdAt))
        .limit(40);
    }
    return await db
      .select()
      .from(studioAssets)
      .where(eq(studioAssets.userUid, uid))
      .orderBy(desc(studioAssets.createdAt))
      .limit(40);
  } catch (error) {
    console.error('Failed to list studio assets:', error);
    throw new Error('Unable to load studio vault assets.', { cause: error });
  }
}

export async function saveUserAsset(params: {
  uid: string;
  projectId?: number | null;
  kind: 'image' | 'video' | 'music' | 'transcript';
  title: string;
  prompt: string;
  modelUsed: string;
  mediaDataUrl?: string;
  textBody?: string;
  interactionId?: string;
  aspectRatio?: string;
}) {
  try {
    const rows = await db
      .insert(studioAssets)
      .values({
        userUid: params.uid,
        projectId: params.projectId ?? null,
        kind: params.kind,
        title: params.title.trim().slice(0, 200) || 'Untitled Take',
        prompt: params.prompt.slice(0, 4000),
        modelUsed: params.modelUsed,
        mediaDataUrl: params.mediaDataUrl || '',
        textBody: params.textBody || '',
        interactionId: params.interactionId || '',
        aspectRatio: params.aspectRatio || '16:9',
      })
      .returning();
    return rows[0];
  } catch (error) {
    console.error('Failed to save studio asset:', error);
    throw new Error('Unable to save asset to studio vault.', { cause: error });
  }
}

export async function deleteUserAsset(uid: string, assetId: number) {
  try {
    await db
      .delete(studioAssets)
      .where(and(eq(studioAssets.id, assetId), eq(studioAssets.userUid, uid)));
  } catch (error) {
    console.error('Failed to delete studio asset:', error);
    throw new Error('Unable to delete asset from vault.', { cause: error });
  }
}

export async function listUserThreads(uid: string) {
  try {
    return await db
      .select()
      .from(chatThreads)
      .where(eq(chatThreads.userUid, uid))
      .orderBy(desc(chatThreads.updatedAt))
      .limit(25);
  } catch (error) {
    console.error('Failed to list chat threads:', error);
    throw new Error('Unable to load conversation threads.', { cause: error });
  }
}

export async function getThreadMessages(uid: string, threadId: number) {
  try {
    return await db
      .select()
      .from(chatMessages)
      .where(and(eq(chatMessages.threadId, threadId), eq(chatMessages.userUid, uid)))
      .orderBy(chatMessages.createdAt);
  } catch (error) {
    console.error('Failed to load thread messages:', error);
    throw new Error('Unable to load conversation messages.', { cause: error });
  }
}

export async function createOrAppendChatTurn(params: {
  uid: string;
  threadId?: number | null;
  projectId?: number | null;
  persona: string;
  modelTier: string;
  userText: string;
  modelText: string;
}) {
  try {
    let activeThreadId = params.threadId ?? null;
    if (!activeThreadId) {
      const created = await db
        .insert(chatThreads)
        .values({
          userUid: params.uid,
          projectId: params.projectId ?? null,
          title: params.userText.trim().slice(0, 72) || 'Director Session',
          persona: params.persona,
          modelTier: params.modelTier,
        })
        .returning();
      activeThreadId = created[0].id;
    } else {
      await db
        .update(chatThreads)
        .set({ updatedAt: new Date(), modelTier: params.modelTier, persona: params.persona })
        .where(and(eq(chatThreads.id, activeThreadId), eq(chatThreads.userUid, params.uid)));
    }

    await db.insert(chatMessages).values([
      {
        threadId: activeThreadId,
        userUid: params.uid,
        role: 'user',
        content: params.userText,
        modelUsed: params.modelTier,
      },
      {
        threadId: activeThreadId,
        userUid: params.uid,
        role: 'model',
        content: params.modelText,
        modelUsed: params.modelTier,
      },
    ]);

    return activeThreadId;
  } catch (error) {
    console.error('Failed to persist chat turn:', error);
    throw new Error('Unable to persist conversation turn.', { cause: error });
  }
}

export async function listUserScoutReports(uid: string) {
  try {
    return await db
      .select()
      .from(scoutReports)
      .where(eq(scoutReports.userUid, uid))
      .orderBy(desc(scoutReports.createdAt))
      .limit(20);
  } catch (error) {
    console.error('Failed to list scout reports:', error);
    throw new Error('Unable to load saved scout dossiers.', { cause: error });
  }
}

export async function saveScoutReport(params: {
  uid: string;
  projectId?: number | null;
  mode: 'search' | 'maps';
  query: string;
  summary: string;
  sourcesJson: string;
  latitude?: number | null;
  longitude?: number | null;
}) {
  try {
    const rows = await db
      .insert(scoutReports)
      .values({
        userUid: params.uid,
        projectId: params.projectId ?? null,
        mode: params.mode,
        query: params.query.slice(0, 600),
        summary: params.summary,
        sourcesJson: params.sourcesJson,
        latitude: params.latitude ?? null,
        longitude: params.longitude ?? null,
      })
      .returning();
    return rows[0];
  } catch (error) {
    console.error('Failed to save scout report:', error);
    throw new Error('Unable to save scout dossier.', { cause: error });
  }
}
