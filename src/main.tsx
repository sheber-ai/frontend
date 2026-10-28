import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/entrypoint'
import { i18nReady } from '@/app/i18n'
import { initAuth } from '@/shared/auth'
import '@/app/styles/index.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('#root not found')

function render() {
	createRoot(rootElement as HTMLElement).render(
		<StrictMode>
			<App />
		</StrictMode>,
	)
}

// Resolve the session and the stored language before render; if Keycloak is down, continue as a guest.
const session = initAuth().catch((error: unknown) =>
	console.error('Keycloak is unavailable', error),
)
const language = i18nReady.catch((error: unknown) =>
	console.error('Translations failed to load', error),
)
void Promise.all([session, language]).finally(render)
