<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData

	$: ({ conversations } = data)

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		})
	}
</script>

<div class="container mx-auto max-w-4xl p-4">
	<div class="space-y-2">
		<a
			href="/new"
			class="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-4 font-medium hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-blue-500 dark:hover:bg-gray-700"
		>
			+ New Chat
		</a>

		{#if conversations.length === 0}
			<div class="flex items-center justify-center rounded-lg bg-gray-50 p-8 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
				No conversations yet
			</div>
		{:else}
			{#each conversations as conversation}
				<a
					href="/convo/{conversation.id}"
					class="block rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-blue-500 dark:hover:bg-gray-700"
				>
					<div class="flex items-center justify-between">
						<h2 class="font-medium">{conversation.title}</h2>
						<span class="text-sm text-gray-500 dark:text-gray-400">{formatDate(conversation.updatedAt)}</span>
					</div>
				</a>
			{/each}
		{/if}
	</div>
</div>
