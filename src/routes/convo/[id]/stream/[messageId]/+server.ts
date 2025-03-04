import { getConversation } from '$lib/server/db/actions'
import { streamChat } from '$lib/openrouter'
import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params, setHeaders }) => {
	const conversation = await getConversation(parseInt(params.id))
	if (!conversation) throw error(404, 'Conversation not found')

	// Set headers for SSE
	setHeaders({
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		Connection: 'keep-alive'
	})

	// Get the streaming response
	const response = await streamChat(conversation.messages)

	if (!response.success) {
		throw error(500, 'Failed to get streaming response')
	}

	// Create a ReadableStream to handle the response
	const stream = new ReadableStream({
		async start(controller) {
			try {
				for await (const chunk of response.stream) {
					// Format the chunk as an SSE message
					const data = JSON.stringify(chunk)
					controller.enqueue(`data: ${data}\n\n`)
				}
				controller.enqueue('data: [DONE]\n\n')
				controller.close()
			} catch (error) {
				console.error('Error in stream:', error)
				controller.error(error)
			}
		}
	})

	return new Response(stream)
}
