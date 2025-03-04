import { getConversation, addMessage } from '$lib/server/db/actions'
import { streamChat } from '$lib/openrouter'
import { error, fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'

export const load = (async ({ params }) => {
	const conversation = await getConversation(parseInt(params.id))
	if (!conversation) throw error(404, 'Conversation not found')

	return { conversation }
}) satisfies PageServerLoad

export const actions = {
	sendMessage: async ({ request, params }) => {
		const data = await request.formData()
		const message = data.get('message')
		const conversationId = parseInt(params.id)

		if (!message || typeof message !== 'string') {
			return fail(400, { message: 'Message is required' })
		}

		// Add user message
		await addMessage(conversationId, {
			role: 'user',
			content: message
		})

		// Get conversation history for context
		const conversation = await getConversation(conversationId)
		if (!conversation) throw error(404, 'Conversation not found')

		// Get AI response using streaming
		const response = await streamChat(conversation.messages)

		if (response.success) {
			// Create a new message for the assistant's response
			const assistantMessage = await addMessage(conversationId, {
				role: 'assistant',
				content: ''
			})

			// Get the updated conversation
			const updatedConversation = await getConversation(conversationId)
			if (!updatedConversation) throw error(404, 'Conversation not found')

			// Return the message ID for client-side streaming and the updated conversation
			return {
				success: true,
				messageId: assistantMessage.id,
				stream: true,
				conversation: updatedConversation
			}
		}

		return { success: false }
	}
} satisfies Actions
