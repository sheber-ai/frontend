import 'i18next'
import type { defaultNS, resources } from './index'

// Translation keys are typed from ru.json
declare module 'i18next' {
	// biome-ignore lint/style/useConsistentTypeDefinitions: module augmentation requires interface
	interface CustomTypeOptions {
		defaultNS: typeof defaultNS
		resources: (typeof resources)['ru']
	}
}
