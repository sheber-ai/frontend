/// <reference types="vite/client" />

// biome-ignore lint/style/useConsistentTypeDefinitions: augmenting Vite types requires interface
interface ImportMetaEnv {
	readonly VITE_API_URL?: string
	readonly VITE_KEYCLOAK_URL?: string
	readonly VITE_KEYCLOAK_REALM?: string
	readonly VITE_KEYCLOAK_CLIENT_ID?: string
}
