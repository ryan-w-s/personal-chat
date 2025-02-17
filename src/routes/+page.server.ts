import { getConversations } from '$lib/server/db/actions'
import type { PageServerLoad } from './$types'

export const load = (async () => {
	const conversations = await getConversations()
	return { conversations }
}) satisfies PageServerLoad
