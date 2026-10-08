import { z } from 'zod'

const envSchema = z.object({
	VITE_API_URL: z.url().default('http://localhost:8000'),
})

/** Переменные окружения, проверенные при старте. `import.meta.env` напрямую не читаем. */
export const env = envSchema.parse(import.meta.env)
