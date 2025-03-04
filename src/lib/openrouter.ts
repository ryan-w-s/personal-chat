import OpenAI from 'openai'
import { env } from '$env/dynamic/private'

if (!env.OPENROUTER_API_KEY) {
	throw new Error(
		'OPENROUTER_API_KEY environment variable is not set. Please check your .env file.'
	)
}

export type ChatMessage = {
	role: 'system' | 'user' | 'assistant'
	content: string
}

// OpenRouter follows OpenAI's API spec but with a different base URL
const client = new OpenAI({
	baseURL: 'https://openrouter.ai/api/v1',
	apiKey: env.OPENROUTER_API_KEY
})

export type ModelInfo = {
	id: string
	name: string
	maxInput: number
	maxOutput: number
	visual: boolean
}

// List of available models we want to support
export const AVAILABLE_MODELS: ModelInfo[] = [
	{
		id: 'google/gemini-2.0-flash-exp:free',
		name: 'Gemini Flash 2.0',
		maxInput: 1048576, // ~1M tokens context window
		maxOutput: 8192, // 8K tokens max output
		visual: true // Model supports vision
	}
]

// Main chat function
export async function chat(messages: ChatMessage[], model: string = AVAILABLE_MODELS[0].id) {
	try {
		const response = await client.chat.completions.create({
			model,
			messages: messages.map((msg) => ({
				role: msg.role,
				content: msg.content
			})),
			temperature: 0.7,
			stream: false
		})

		return {
			success: true as const,
			message: response.choices[0]?.message?.content || ''
		}
	} catch (error) {
		console.error('Error in chat:', error)
		return {
			success: false as const,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		}
	}
}

// Streaming chat function
export async function streamChat(messages: ChatMessage[], model: string = AVAILABLE_MODELS[0].id) {
	try {
		const stream = await client.chat.completions.create({
			model,
			messages: messages.map((msg) => ({
				role: msg.role,
				content: msg.content
			})),
			temperature: 0.7,
			stream: true
		})

		return {
			success: true as const,
			stream
		}
	} catch (error) {
		console.error('Error in streamChat:', error)
		return {
			success: false as const,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		}
	}
}

// Export the client for direct access if needed
export { client }
