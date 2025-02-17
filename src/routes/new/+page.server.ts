import { createConversation, addMessage } from '$lib/server/db/actions'
import { chat } from '$lib/openrouter'
import { fail, redirect } from '@sveltejs/kit'
import type { RequestEvent } from '@sveltejs/kit'

export const actions = {
	default: async ({ request }: RequestEvent) => {
		const data = await request.formData()
		const message = data.get('message')

		if (!message || typeof message !== 'string') {
			return fail(400, { message: 'Message is required' })
		}

		// Create a new conversation with first few words as title
		const title = message.split(' ').slice(0, 5).join(' ') + '...'
		const conversation = await createConversation(title)

		// Add the user's message
		await addMessage(conversation.id, {
			role: 'user',
			content: message
		})

		// Get AI response
		const response = await chat([{ role: 'user', content: message }])

		if (response.success) {
			// Add AI's response
			await addMessage(conversation.id, {
				role: 'assistant',
				content: response.message
			})
		}

		// Redirect to the conversation page
		throw redirect(303, `/convo/${conversation.id}`)
	}
}
