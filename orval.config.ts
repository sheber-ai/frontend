import { defineConfig } from 'orval'

// Running backend or a file: OPENAPI_URL=../backend/openapi.json npm run generate:api
const input = process.env.OPENAPI_URL ?? 'http://localhost:8000/api/v1/openapi.json'

export default defineConfig({
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
	// Zod schemas for form validation
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
