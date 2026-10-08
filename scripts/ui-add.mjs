// Добавление компонентов shadcn: `npm run ui:add -- dialog input`.
// Обёртка нужна, потому что shadcn CLI (4.21) пишет `import { cn } from "cn"`
// вместо алиаса из components.json. Чиним импорт и приводим файлы к стилю Biome.
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const UI_DIR = 'src/shared/ui'
const components = process.argv.slice(2)
if (components.length === 0) {
	console.error('Укажите компоненты: npm run ui:add -- dialog input')
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
