import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './error-boundary'

let broken = true

function Fragile() {
	if (broken) throw new Error('WebGL is not available')
	return <p>scene</p>
}

function Harness() {
	const [errors, setErrors] = useState(0)
	return (
		<>
			<ErrorBoundary
				onError={() => setErrors((count) => count + 1)}
				fallback={(retry) => (
					<button type="button" onClick={retry}>
						retry
					</button>
				)}
			>
				<Fragile />
			</ErrorBoundary>
			<output>{errors}</output>
		</>
	)
}

describe('ErrorBoundary', () => {
	it('shows the fallback instead of crashing and recovers on retry', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined)
		const user = userEvent.setup()
		render(<Harness />)
		expect(screen.getByRole('button', { name: 'retry' })).toBeInTheDocument()
		expect(screen.getByRole('status').textContent).toBe('1')

		broken = false
		await user.click(screen.getByRole('button', { name: 'retry' }))
		expect(screen.getByText('scene')).toBeInTheDocument()
	})
})
