import { defineConfig } from 'orval'

// Источник схемы: запущенный бэкенд или файл (`make openapi` в ../backend):
// OPENAPI_URL=../backend/openapi.json npm run generate:api
const input = process.env.OPENAPI_URL ?? 'http://localhost:8000/api/v1/openapi.json'

export default defineConfig({
	// Хуки TanStack Query + типы ответов/запросов
	api: {
		input: { target: input },
		output: {
			mode: 'tags-split',
			target: 'src/shared/api/generated/endpoints',
			schemas: 'src/shared/api/generated/model',
			client: 'react-query',
			httpClient: 'axios',
			clean: true,
			override: {
				mutator: { path: 'src/shared/api/http-client.ts', name: 'httpClient' },
			},
		},
	},
	// Zod-схемы тех же DTO — для валидации форм теми же правилами, что на бэкенде
	zod: {
		input: { target: input },
		output: {
			mode: 'tags-split',
			target: 'src/shared/api/generated/zod',
			client: 'zod',
			fileExtension: '.zod.ts',
			clean: true,
		},
	},
})
