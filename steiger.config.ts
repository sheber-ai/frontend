import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
	...fsd.configs.recommended,
	{
		// routes/ is TanStack file routing, not an FSD layer
		ignores: ['**/routes/**', '**/routeTree.gen.ts', '**/shared/api/generated/**'],
	},
	{
		// Shared by the landing now and the 3D constructor next
		files: ['./src/entities/furniture/**'],
		rules: { 'fsd/insignificant-slice': 'off' },
	},
])
