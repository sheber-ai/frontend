// Usage: npm run ui:add -- dialog input
// shadcn CLI 4.21 writes `import { cn } from "cn"` instead of the configured alias, so fix it up.
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const UI_DIR = 'src/shared/ui'
const components = process.argv.slice(2)
if (components.length === 0) {
	console.error('Usage: npm run ui:add -- dialog input')
	process.exit(1)
}

execFileSync('npx', ['-y', 'shadcn@latest', 'add', ...components, '--yes'], { stdio: 'inherit' })

for (const file of readdirSync(UI_DIR)) {
	if (!file.endsWith('.tsx')) continue
	const path = join(UI_DIR, file)
	const source = readFileSync(path, 'utf8')
	const fixed = source.replace(/from ["']cn["']/g, "from '@/shared/lib/utils'")
	if (fixed !== source) writeFileSync(path, fixed)
}

execFileSync('npx', ['biome', 'check', '--write', UI_DIR], { stdio: 'inherit' })
