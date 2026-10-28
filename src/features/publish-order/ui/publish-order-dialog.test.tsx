import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { getTemplate } from '@/entities/furniture'
import { PublishOrderDialog } from './publish-order-dialog'

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'ru' } }),
}))
vi.mock('@tanstack/react-router', () => ({
	Link: ({ children }: { children: React.ReactNode }) => <a href="/profile">{children}</a>,
	useNavigate: () => vi.fn(),
}))
vi.mock('@/entities/viewer', () => ({
	useViewer: () => ({ viewer: { phone: null, city: null } }),
}))
vi.mock('@/entities/city', () => ({ CitySelect: () => <div>city</div> }))
vi.mock('@/shared/api/generated/endpoints/attachments/attachments', () => ({
	useListAttachments: () => ({
		data: { items: [{ id: '1', purpose: 'reference' }], total: 1 },
	}),
}))

function setup() {
	const template = getTemplate('wardrobeHinged')
	if (!template) throw new Error('template missing')
	render(
		<QueryClientProvider client={new QueryClient()}>
			<PublishOrderDialog designId="d1" document={template.build()} warnings={2}>
				<button type="button">open</button>
			</PublishOrderDialog>
		</QueryClientProvider>,
	)
}

describe('PublishOrderDialog', () => {
	it('shows what workshops will get before asking for details', async () => {
		const user = userEvent.setup()
		setup()
		await user.click(screen.getByRole('button', { name: 'open' }))

		expect(screen.getByText('publish.reviewTitle')).toBeInTheDocument()
		expect(screen.getByText('attachments.purposes.reference.title: 1')).toBeInTheDocument()
		expect(screen.getByText('publish.noRoomPhotos')).toBeInTheDocument()
		expect(screen.getByText('publish.warnings')).toBeInTheDocument()
		expect(screen.getByRole('alert')).toHaveTextContent('errors.profile_incomplete')

		await user.click(screen.getByRole('button', { name: /publish.next/ }))
		expect(screen.getByText('publish.title')).toBeInTheDocument()
		expect(screen.getByText('publish.budgetHint')).toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: /common.back/ }))
		expect(screen.getByText('publish.reviewTitle')).toBeInTheDocument()
	})
})
