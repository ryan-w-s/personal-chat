import { updateMessage } from '$lib/server/db/actions'
import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const PUT: RequestHandler = async ({ params, request }) => {
	const { content } = await request.json()

	if (!content || typeof content !== 'string') {
		throw error(400, 'Invalid content')
	}

	await updateMessage(parseInt(params.messageId), content)

	return new Response(null, { status: 204 })
}
