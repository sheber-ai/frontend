import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
	...fsd.configs.recommended,
	{
		// routes/ — файловый роутинг TanStack, это не слой FSD; сгенерированный код не проверяем
		ignores: ['**/routes/**', '**/routeTree.gen.ts', '**/shared/api/generated/**'],
	},
])
