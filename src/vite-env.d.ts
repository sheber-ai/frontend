/// <reference types="vite/client" />

// biome-ignore lint/style/useConsistentTypeDefinitions: дополняем тип Vite, нужен interface
interface ImportMetaEnv {
	readonly VITE_API_URL?: string
}
