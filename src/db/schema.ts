import { relations } from 'drizzle-orm';
import { doublePrecision, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name').notNull().default('Filmmaker'),
  photoUrl: text('photo_url').notNull().default(''),
  studioHandle: text('studio_handle').notNull().default('@director'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const studioProjects = pgTable('studio_projects', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  logline: text('logline').notNull().default(''),
  genre: text('genre').notNull().default('Neo-Noir'),
  aspectRatio: text('aspect_ratio').notNull().default('16:9'),
  status: text('status').notNull().default('in_development'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const studioAssets = pgTable('studio_assets', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  projectId: integer('project_id').references(() => studioProjects.id, { onDelete: 'set null' }),
  kind: text('kind').notNull(), // 'image' | 'video' | 'music' | 'transcript'
  title: text('title').notNull(),
  prompt: text('prompt').notNull().default(''),
  modelUsed: text('model_used').notNull(),
  mediaDataUrl: text('media_data_url').notNull().default(''),
  textBody: text('text_body').notNull().default(''),
  interactionId: text('interaction_id').notNull().default(''),
  aspectRatio: text('aspect_ratio').notNull().default('16:9'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chatThreads = pgTable('chat_threads', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  projectId: integer('project_id').references(() => studioProjects.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  persona: text('persona').notNull().default('showrunner'),
  modelTier: text('model_tier').notNull().default('gemini-4-carbon'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  threadId: integer('thread_id')
    .references(() => chatThreads.id, { onDelete: 'cascade' })
    .notNull(),
  userUid: text('user_uid')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  role: text('role').notNull(), // 'user' | 'model'
  content: text('content').notNull(),
  modelUsed: text('model_used').notNull().default('gemini-4-hydrogen'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const scoutReports = pgTable('scout_reports', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  projectId: integer('project_id').references(() => studioProjects.id, { onDelete: 'set null' }),
  mode: text('mode').notNull(), // 'search' | 'maps'
  query: text('query').notNull(),
  summary: text('summary').notNull(),
  sourcesJson: text('sources_json').notNull().default('[]'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(studioProjects),
  assets: many(studioAssets),
  threads: many(chatThreads),
  scoutReports: many(scoutReports),
}));

export const studioProjectsRelations = relations(studioProjects, ({ one, many }) => ({
  owner: one(users, {
    fields: [studioProjects.userUid],
    references: [users.uid],
  }),
  assets: many(studioAssets),
  threads: many(chatThreads),
  scoutReports: many(scoutReports),
}));

export const studioAssetsRelations = relations(studioAssets, ({ one }) => ({
  owner: one(users, {
    fields: [studioAssets.userUid],
    references: [users.uid],
  }),
  project: one(studioProjects, {
    fields: [studioAssets.projectId],
    references: [studioProjects.id],
  }),
}));

export const chatThreadsRelations = relations(chatThreads, ({ one, many }) => ({
  owner: one(users, {
    fields: [chatThreads.userUid],
    references: [users.uid],
  }),
  project: one(studioProjects, {
    fields: [chatThreads.projectId],
    references: [studioProjects.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  thread: one(chatThreads, {
    fields: [chatMessages.threadId],
    references: [chatThreads.id],
  }),
  owner: one(users, {
    fields: [chatMessages.userUid],
    references: [users.uid],
  }),
}));

export const scoutReportsRelations = relations(scoutReports, ({ one }) => ({
  owner: one(users, {
    fields: [scoutReports.userUid],
    references: [users.uid],
  }),
  project: one(studioProjects, {
    fields: [scoutReports.projectId],
    references: [studioProjects.id],
  }),
}));
