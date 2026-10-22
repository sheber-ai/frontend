import i18n from 'i18next'
import Keycloak from 'keycloak-js'
import { env } from '@/shared/config'

const keycloak = new Keycloak({
	url: env.VITE_KEYCLOAK_URL,
	realm: env.VITE_KEYCLOAK_REALM,
	clientId: env.VITE_KEYCLOAK_CLIENT_ID,
})

/** Call once before render. Checks the session silently. */
export async function initAuth(): Promise<void> {
	await keycloak.init({
		onLoad: 'check-sso',
		pkceMethod: 'S256',
		silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
		checkLoginIframe: false,
	})
}

export function isAuthenticated(): boolean {
	return Boolean(keycloak.authenticated)
}

/** Redirects to Keycloak; the promise never resolves. */
export function login(redirectUri?: string): Promise<void> {
	return keycloak.login({ redirectUri, locale: i18n.language })
}

export function register(): Promise<void> {
	return keycloak.register({ locale: i18n.language })
}

export function logout(): Promise<void> {
	return keycloak.logout({ redirectUri: window.location.origin })
}

/** Returns a token valid for at least 30 more seconds. */
export async function getAccessToken(): Promise<string | undefined> {
	if (!keycloak.authenticated) return undefined
	try {
		await keycloak.updateToken(30)
	} catch {
		// Refresh token expired or session revoked
		await login(window.location.href)
	}
	return keycloak.token
}

/** Forces a new token, e.g. to pick up a role granted a moment ago. */
export async function refreshSession(): Promise<void> {
	if (keycloak.authenticated) await keycloak.updateToken(-1)
}

/** `beforeLoad` guard for protected routes. */
export async function requireAuth(): Promise<void> {
	if (!isAuthenticated()) await login(window.location.href)
}
