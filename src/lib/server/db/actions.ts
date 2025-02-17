import { db } from '.'
import { conversations, messages } from './schema'
import { eq } from 'drizzle-orm'
import type { ChatMessage } from '$lib/openrouter'

export type Conversation = typeof conversations.$inferSelect
export type Message = typeof messages.$inferSelect

// Create a new conversation thread
export async function createConversation(title: string) {
    const [conversation] = await db
        .insert(conversations)
        .values({ title })
        .returning()
    
    return conversation
}

// Get all conversations, ordered by most recent first
export async function getConversations() {
    return db
        .select()
        .from(conversations)
        .orderBy(conversations.updatedAt)
        .all()
}

// Get a single conversation by ID with its messages
export async function getConversation(id: number) {
    const conversation = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, id))
        .get()

    if (!conversation) return null

    const conversationMessages = await getMessages(id)
    
    return {
        ...conversation,
        messages: conversationMessages
    }
}

// Add a new message to a conversation
export async function addMessage(conversationId: number, message: ChatMessage) {
    const [newMessage] = await db
        .insert(messages)
        .values({
            conversationId,
            role: message.role,
            content: message.content
        })
        .returning()

    // Update the conversation's updatedAt timestamp
    await db
        .update(conversations)
        .set({ updatedAt: new Date().toISOString() })
        .where(eq(conversations.id, conversationId))

    return newMessage
}

// Get all messages for a conversation, ordered by creation time
export async function getMessages(conversationId: number) {
    return db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt)
        .all()
}

// Delete a conversation and all its messages (messages are deleted automatically via foreign key cascade)
export async function deleteConversation(id: number) {
    await db
        .delete(conversations)
        .where(eq(conversations.id, id))
} 