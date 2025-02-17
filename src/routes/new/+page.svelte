<!-- New conversation page with a simple form -->
<script lang="ts">
	import { enhance } from '$app/forms'
</script>

<div class="container mx-auto max-w-2xl p-4">
	<h1 class="mb-6 text-2xl font-bold">Start a New Conversation</h1>

	<form method="POST" use:enhance class="space-y-4">
		<div>
			<label for="message" class="mb-2 block text-sm font-medium">Your message</label>
			<textarea
				name="message"
				id="message"
				rows="4"
				class="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
				placeholder="What would you like to chat about?"
				required
			></textarea>
		</div>

		<button
			type="submit"
			class="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
		>
			Start Chat
		</button>
	</form>
</div>
