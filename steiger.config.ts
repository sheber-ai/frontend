import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
	...fsd.configs.recommended,
	{
		// routes/ is TanStack file routing, not an FSD layer
		ignores: ['**/routes/**', '**/routeTree.gen.ts', '**/shared/api/generated/**'],
	},
	{
		// User actions stay features and the editor stays a widget even with a single page using them:
		// merging them into pages would undo the layering as soon as a second page needs them
		files: [
			'./src/features/**',
			'./src/widgets/**',
			'./src/entities/furniture/**',
			'./src/entities/city/**',
		],
		rules: { 'fsd/insignificant-slice': 'off' },
	},
])
