import { z } from 'zod'

const envSchema = z.object({
	VITE_API_URL: z.url().default('http://localhost:8000'),
	VITE_KEYCLOAK_URL: z.url().default('http://localhost:8080'),
	VITE_KEYCLOAK_REALM: z.string().min(1).default('sheber'),
	VITE_KEYCLOAK_CLIENT_ID: z.string().min(1).default('sheber-frontend'),
})

export const env = envSchema.parse(import.meta.env)
