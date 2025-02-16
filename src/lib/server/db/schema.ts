import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const conversations = sqliteTable('conversations', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
})

export const messages = sqliteTable('messages', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	conversationId: integer('conversation_id')
		.references(() => conversations.id, { onDelete: 'cascade' })
		.notNull(),
	role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
	content: text('content').notNull(),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
})
