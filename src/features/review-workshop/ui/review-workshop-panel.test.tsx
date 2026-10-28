import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ReviewWorkshopPanel } from './review-workshop-panel'

const mutateAsync = vi.fn()
const review = vi.hoisted(() => ({ current: null as unknown }))

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, options?: { value?: number }) =>
			options?.value ? `${key}:${options.value}` : key,
		i18n: { language: 'ru' },
	}),
}))
vi.mock('@/shared/api/generated/endpoints/reviews/reviews', () => ({
	getGetOrderReviewQueryKey: (id: string) => ['review', id],
	useGetOrderReview: () => ({ data: review.current, isPending: false }),
	useSaveReview: () => ({ mutateAsync, isPending: false }),
}))

function setup() {
	render(
		<QueryClientProvider client={new QueryClient()}>
			<ReviewWorkshopPanel orderId="o1" workshopName="Дуб" />
		</QueryClientProvider>,
	)
}

describe('ReviewWorkshopPanel', () => {
	beforeEach(() => {
		mutateAsync.mockReset().mockResolvedValue({})
		review.current = null
	})

	it('requires a rating before sending', async () => {
		const user = userEvent.setup()
		setup()
		await user.click(screen.getByRole('button', { name: 'reviews.submit' }))
		expect(screen.getByRole('alert')).toHaveTextContent('reviews.ratingRequired')
		expect(mutateAsync).not.toHaveBeenCalled()

		await user.click(screen.getByRole('radio', { name: 'reviews.starLabel:4' }))
		await user.type(screen.getByRole('textbox'), 'Аккуратно')
		await user.click(screen.getByRole('button', { name: 'reviews.submit' }))
		expect(mutateAsync).toHaveBeenCalledWith({
			orderId: 'o1',
			data: { rating: 4, text: 'Аккуратно' },
		})
	})

	it('shows the saved review and lets the client correct it', async () => {
		review.current = {
			id: 'r1',
			orderId: 'o1',
			rating: 5,
			text: 'Отлично',
			author: 'Айгерим К.',
			createdAt: '2026-10-01T10:00:00Z',
			updatedAt: '2026-10-01T10:00:00Z',
		}
		const user = userEvent.setup()
		setup()
		expect(screen.getByText('Отлично')).toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: /reviews.edit/ }))
		expect(screen.getByRole('radio', { name: 'reviews.starLabel:5' })).toBeChecked()
		expect(screen.getByRole('textbox')).toHaveValue('Отлично')
	})
})
