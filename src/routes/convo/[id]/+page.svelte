<!-- Chat interface -->
<script lang="ts">
	import { enhance } from '$app/forms'
	import type { PageData } from './$types'
	import { marked } from 'marked'
	import { browser } from '$app/environment'
	import createDOMPurify from 'dompurify'
	import Prism from 'prismjs'
	// Import Prism plugins explicitly
	import 'prismjs/plugins/toolbar/prism-toolbar'
	import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard'
	import 'prismjs/plugins/show-language/prism-show-language'
	import 'prismjs/plugins/match-braces/prism-match-braces'
	import 'prismjs/plugins/autolinker/prism-autolinker'
	import 'prismjs/plugins/autoloader/prism-autoloader'
	import 'prismjs/themes/prism-okaidia.css'
	// No need to manually import language components when using autoloader
	// Prism CSS and other plugins are loaded by vite-plugin-prismjs

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

	// Configure Prism autoloader if in browser
	if (browser && Prism.plugins.autoloader) {
		// Configure the autoloader to use the copied components
		Prism.plugins.autoloader.languages_path = '/prismjs/components/'
	}

	// Configure marked
	marked.setOptions({
		breaks: true,
		gfm: true,
		pedantic: false
	})

	// Function to highlight code with Prism
	function highlightCode(code: string, lang: string): string {
		// With autoloader, we don't need to check if the language is loaded
		// The autoloader will handle loading the language definition if needed
		if (lang) {
			try {
				return Prism.highlight(code, Prism.languages[lang] || {}, lang)
			} catch (e) {
				console.warn(`Failed to highlight ${lang} code:`, e)
				return code
			}
		}
		return code
	}

	// Safely render markdown content with syntax highlighting
	function renderMarkdown(content: string): string {
		// Reset marked options to default
		marked.setOptions({
			breaks: true,
			gfm: true,
			pedantic: false
		})

		// Use marked-highlight extension if needed in the future

		const rawHtml = marked.parse(content, { async: false }) as string
		// Apply Prism highlighting to code blocks after parsing
		const html = browser ? DOMPurify.sanitize(rawHtml) : rawHtml

		if (browser) {
			// Use a slightly longer timeout to ensure DOM is ready
			setTimeout(() => {
				// Find all code blocks and apply syntax highlighting
				const codeBlocks = document.querySelectorAll('pre code[class*="language-"]')
				codeBlocks.forEach((block) => {
					// The autoloader will automatically load the required language
					// based on the class name (language-xxx)
					Prism.highlightElement(block)
				})

				// Enable match braces
				if (Prism.plugins.matchBraces) {
					Prism.plugins.matchBraces.init(Prism)
				}

				// Highlight all code blocks
				Prism.highlightAll()
			}, 100)
		}
		return html
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
</script>

<div
	class="container mx-auto flex h-[calc(100vh-4rem)] max-w-6xl flex-col p-4 text-gray-900 dark:text-gray-100"
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
					class="prose prose-sm dark:prose-invert max-w-[100%] rounded-lg p-3 [&_code]:!bg-gray-800 dark:[&_code]:!bg-gray-900 [&_pre]:!bg-gray-800 dark:[&_pre]:!bg-gray-900 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>ol]:ml-4 [&>ol]:list-decimal [&>ul]:ml-4 [&>ul]:list-disc {message.role ===
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
