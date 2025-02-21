<!-- Chat interface -->
<script lang="ts">
	import { enhance } from '$app/forms'
	import type { PageData } from './$types'
	import { marked } from 'marked'
	import { browser } from '$app/environment'
	import createDOMPurify from 'dompurify'

	export let data: PageData

	let messageInput: HTMLTextAreaElement
	let chatContainer: HTMLDivElement
	let messageCount = 0
	let isSubmitting = false
	let DOMPurify: typeof createDOMPurify

	// Initialize DOMPurify only in browser
	if (browser) {
		DOMPurify = createDOMPurify(window)
	}

	$: ({ conversation } = data)

	// Only auto-scroll when message count changes (new messages added)
	$: if (conversation.messages.length !== messageCount) {
		messageCount = conversation.messages.length
		scrollToBottom()
	}

	function scrollToBottom() {
		setTimeout(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight
			}
		}, 0)
	}

	// Handle form submission
	function handleSubmit() {
		if (messageInput) {
			messageInput.value = ''
		}
	}

	// Handle Ctrl+Enter to submit
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			const form = (event.target as HTMLElement).closest('form')
			if (form) form.requestSubmit()
		}
	}

	// Safely render markdown content
	function renderMarkdown(content: string): string {
		const rawHtml = marked.parse(content, {
			breaks: true,
			async: false,
			gfm: true,
			pedantic: false
		}) as string
		return browser ? DOMPurify.sanitize(rawHtml) : rawHtml
	}
</script>

<div
	class="container mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col p-4 text-gray-900 dark:text-gray-100"
>
	<header class="mb-4">
		<h1 class="text-xl font-bold">{conversation.title}</h1>
	</header>

	<!-- Messages container with auto-scroll -->
	<div
		bind:this={chatContainer}
		class="flex-1 space-y-4 overflow-y-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
	>
		{#each conversation.messages as message}
			<div class="flex {message.role === 'assistant' ? 'justify-start' : 'justify-end'}">
				<div
					class="prose prose-sm dark:prose-invert max-w-[100%] rounded-lg p-3 [&>ol]:list-decimal [&>ul]:list-disc [&>ol]:ml-4 [&>ul]:ml-4 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 {message.role ===
					'assistant'
						? 'bg-white dark:bg-gray-700'
						: 'bg-blue-500 text-white'}"
				>
					<!-- Content is sanitized by DOMPurify before rendering -->
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html renderMarkdown(message.content)}
				</div>
			</div>
		{/each}
	</div>

	<!-- Message input form -->
	<form
		method="POST"
		action="?/sendMessage"
		use:enhance={() => {
			isSubmitting = true
			return ({ update }) => {
				update({ reset: false })
				handleSubmit()
				isSubmitting = false
			}
		}}
		class="mt-4 flex gap-2"
	>
		<div class="flex-1">
			<textarea
				bind:this={messageInput}
				name="message"
				rows="3"
				class="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
				placeholder="Type your message... (Ctrl+Enter to send)"
				required
				on:keydown={handleKeydown}
				disabled={isSubmitting}
			></textarea>
		</div>
		<button
			type="submit"
			class="self-end rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
			disabled={isSubmitting}
		>
			{isSubmitting ? 'Sending...' : 'Send'}
		</button>
	</form>
</div>
