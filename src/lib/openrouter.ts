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
	apiKey: env.OPENROUTER_API_KEY,
})

export type ModelInfo = {
	id: string
	name: string
	maxTokens: number
}

// List of available models we want to support
export const AVAILABLE_MODELS: ModelInfo[] = [
	{
		id: 'mistralai/mistral-7b-instruct',
		name: 'Mistral 7B',
		maxTokens: 4096
	},
	{
		id: 'anthropic/claude-2',
		name: 'Claude 2',
		maxTokens: 100000
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

// Export the client for direct access if needed
export { client }
