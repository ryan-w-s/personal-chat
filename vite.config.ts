import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import prismjs from 'vite-plugin-prismjs'
import { resolve } from 'path'
import fs from 'fs'

// Function to copy Prism.js components to public directory
function copyPrismComponents() {
	return {
		name: 'copy-prism-components',
		buildStart() {
			const componentsDir = resolve('node_modules/prismjs/components')
			const targetDir = resolve('static/prismjs/components')

			// Create target directory if it doesn't exist
			if (!fs.existsSync(targetDir)) {
				fs.mkdirSync(targetDir, { recursive: true })
			}

			// Copy all component files
			const files = fs.readdirSync(componentsDir)
			files.forEach((file) => {
				if (file.startsWith('prism-') && file.endsWith('.min.js')) {
					fs.copyFileSync(resolve(componentsDir, file), resolve(targetDir, file))
				}
			})
		}
	}
}

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
		}),
		copyPrismComponents()
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
