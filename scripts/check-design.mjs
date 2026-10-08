// Fails on colors that bypass the design tokens (src/shared/design/tokens.css).
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = 'src'
const SKIP = ['src/shared/design', 'src/shared/api/generated', 'src/routeTree.gen.ts']
const PALETTE =
	'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
const RULES = [
	{ re: /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g, hint: 'hex color' },
	{ re: /\b(?:rgb|rgba|hsl|hsla|oklch)\(/g, hint: 'raw color function' },
	{
		re: new RegExp(
			`\\b(?:bg|text|border|ring|fill|stroke|from|via|to|outline|decoration|divide|shadow|accent|caret)-(?:${PALETTE})-\\d{2,3}\\b|\\b(?:bg|text|border|fill|stroke)-(?:black|white)\\b`,
			'g',
		),
		hint: 'Tailwind palette class, use a semantic token',
	},
]

function* walk(dir) {
	for (const name of readdirSync(dir)) {
		const path = join(dir, name)
		if (SKIP.some((skip) => path.startsWith(skip))) continue
		if (statSync(path).isDirectory()) yield* walk(path)
		else if (/\.(tsx?|css)$/.test(name)) yield path
	}
}

let errors = 0
for (const file of walk(ROOT)) {
	readFileSync(file, 'utf8')
		.split('\n')
		.forEach((line, index) => {
			for (const { re, hint } of RULES) {
				for (const match of line.matchAll(re)) {
					errors++
					console.error(`${relative('.', file)}:${index + 1}  ${match[0]}  (${hint})`)
				}
			}
		})
}

if (errors) {
	console.error(`\n${errors} design token violation(s). See src/shared/design/tokens.css`)
	process.exit(1)
}
