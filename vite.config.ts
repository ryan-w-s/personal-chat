import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import prismjs from 'vite-plugin-prismjs'

export default defineConfig({
	plugins: [
		sveltekit(),
		tailwindcss(),
		prismjs({
			languages: 'all',
			plugins: [
				'autolinker',
				'toolbar',
				'copy-to-clipboard',
				'match-braces',
				'show-language',
				'autoloader',
				'line-numbers',
				'line-highlight'
			],
			theme: 'okaidia',
			css: true
		})
	],
	optimizeDeps: {
		include: [
			'prismjs',
			'prismjs/components/index',
			'prismjs/plugins/toolbar/prism-toolbar',
			'prismjs/plugins/show-language/prism-show-language',
			'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard',
			'prismjs/plugins/autolinker/prism-autolinker',
			'prismjs/plugins/match-braces/prism-match-braces',
			'prismjs/plugins/autoloader/prism-autoloader',
			'prismjs/plugins/line-numbers/prism-line-numbers',
			'prismjs/plugins/line-highlight/prism-line-highlight'
		]
	}
})
