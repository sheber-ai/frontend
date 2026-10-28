import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const init = vi.hoisted(() => vi.fn())

vi.mock('keycloak-js', () => ({
	default: class {
		init = init
	},
}))

import { initAuth } from './keycloak'

describe('initAuth', () => {
	beforeEach(() => {
		init.mockReset()
	})
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('gives up at once when Keycloak does not answer', async () => {
		init.mockReturnValue(new Promise(() => {}))
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
		await expect(initAuth()).rejects.toThrow('Failed to fetch')
	})

	it('waits for the session check when Keycloak answers', async () => {
		init.mockResolvedValue(true)
		const fetchMock = vi.fn().mockResolvedValue(new Response(null))
		vi.stubGlobal('fetch', fetchMock)
		await expect(initAuth()).resolves.toBeUndefined()
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/realms/'),
			expect.objectContaining({ mode: 'no-cors' }),
		)
		expect(init).toHaveBeenCalledWith(expect.objectContaining({ onLoad: 'check-sso' }))
	})
})
