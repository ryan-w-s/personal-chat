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
	import 'prismjs/themes/prism-okaidia.css'
	import 'prismjs/components/prism-python'
	import 'prismjs/components/prism-haskell'
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

	// Configure marked
	marked.setOptions({
		breaks: true,
		gfm: true,
		pedantic: false
	})

	// Function to highlight code with Prism
	function highlightCode(code: string, lang: string): string {
		// Only attempt to highlight if we have a language
		if (lang && Prism.languages[lang]) {
			return Prism.highlight(code, Prism.languages[lang], lang)
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
				// Find all code blocks and apply syntax highlighting manually if needed
				const codeBlocks = document.querySelectorAll('pre code[class*="language-"]')
				codeBlocks.forEach((block) => {
					// Prism will automatically detect the language from the class
					Prism.highlightElement(block)
				})
				
				// Configure Prism toolbar with copy button
				if (Prism.plugins.toolbar) {
					// Register copy-to-clipboard button (this should be handled by the plugin)
					Prism.plugins.toolbar.registerButton('copy-to-clipboard', function(env: { code?: string, element?: HTMLElement }) {
						const linkCopy = document.createElement('button')
						linkCopy.textContent = 'Copy'
						
						linkCopy.addEventListener('click', function() {
							if (env.code) {
								navigator.clipboard.writeText(env.code).then(() => {
									linkCopy.textContent = 'Copied!'
									setTimeout(() => {
										linkCopy.textContent = 'Copy'
									}, 2000)
								})
							}
						})
						
						return linkCopy
					})
					
					// Register select code button
					Prism.plugins.toolbar.registerButton('select-code', {
						text: 'Select code',
						onClick: (env: { element?: HTMLElement }) => {
							if (env.element) {
								const range = document.createRange()
								range.selectNode(env.element)
								window.getSelection()?.removeAllRanges()
								window.getSelection()?.addRange(range)
							}
						}
					})
				}

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
					class="prose prose-sm dark:prose-invert max-w-[100%] rounded-lg p-3 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>ol]:ml-4 [&>ol]:list-decimal [&>ul]:ml-4 [&>ul]:list-disc [&_pre]:!bg-gray-800 [&_code]:!bg-gray-800 dark:[&_pre]:!bg-gray-900 dark:[&_code]:!bg-gray-900 {message.role ===
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
