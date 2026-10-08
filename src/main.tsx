import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/entrypoint'
import { initAuth } from '@/shared/auth'
import '@/app/i18n'
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

// Resolve the session before render; if Keycloak is down, continue as a guest.
initAuth()
	.catch((error: unknown) => console.error('Keycloak is unavailable', error))
	.finally(render)
