<script lang="ts">
	import '../app.css'
	let { children } = $props()
</script>

<div class="flex min-h-screen flex-col bg-white dark:bg-gray-900">
	<header class="bg-gray-800 p-4 text-white">
		<nav class="container mx-auto flex max-w-4xl items-center">
			<a href="/" class="text-xl font-bold">✨</a>
			<div class="ml-4 space-x-4">
				<a href="/" class="hover:text-gray-300">Conversations</a>
				<a href="/new" class="hover:text-gray-300">New Chat</a>
			</div>
		</nav>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>
</div>
