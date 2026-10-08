import 'i18next'
import type { defaultNS, resources } from './index'

// Ключи переводов типизированы по ru.json: t('несуществующий.ключ') — ошибка компиляции
declare module 'i18next' {
	// biome-ignore lint/style/useConsistentTypeDefinitions: расширение модуля возможно только через interface
	interface CustomTypeOptions {
		defaultNS: typeof defaultNS
		resources: (typeof resources)['ru']
	}
}
