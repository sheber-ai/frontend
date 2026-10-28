import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReviewSchema } from '@/shared/api/generated/model'
import { ReplyReviewForm } from './reply-review-form'

const mutateAsync = vi.fn()

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'ru' } }),
}))
vi.mock('@/shared/api/generated/endpoints/reviews/reviews', () => ({
	getGetOrderReviewQueryKey: (id: string) => ['review', id],
	useReplyToReview: () => ({ mutateAsync, isPending: false }),
}))

const review: ReviewSchema = {
	id: 'r1',
	orderId: 'o1',
	rating: 5,
	text: 'Отлично',
	author: 'Айгерим К.',
	reply: null,
	repliedAt: null,
	createdAt: '2026-10-01T10:00:00Z',
	updatedAt: '2026-10-01T10:00:00Z',
}

function setup(value: ReviewSchema) {
	render(
		<QueryClientProvider client={new QueryClient()}>
			<ReplyReviewForm review={value} />
		</QueryClientProvider>,
	)
}

describe('ReplyReviewForm', () => {
	beforeEach(() => {
		mutateAsync.mockReset().mockResolvedValue({})
	})

	it('does not send a blank reply', async () => {
		const user = userEvent.setup()
		setup(review)
		await user.click(screen.getByRole('button', { name: 'reviews.reply.action' }))
		await user.type(screen.getByRole('textbox'), '   ')
		await user.click(screen.getByRole('button', { name: 'reviews.reply.submit' }))
		expect(screen.getByText('reviews.reply.required')).toBeInTheDocument()
		expect(mutateAsync).not.toHaveBeenCalled()
	})

	it('edits the existing reply with trimmed text', async () => {
		const user = userEvent.setup()
		setup({ ...review, reply: 'Спасибо', repliedAt: '2026-10-02T10:00:00Z' })
		await user.click(screen.getByRole('button', { name: 'reviews.reply.edit' }))
		const field = screen.getByRole('textbox')
		expect(field).toHaveValue('Спасибо')
		await user.clear(field)
		await user.type(field, '  Спасибо за заказ!  ')
		await user.click(screen.getByRole('button', { name: 'reviews.reply.submit' }))
		expect(mutateAsync).toHaveBeenCalledWith({ orderId: 'o1', data: { text: 'Спасибо за заказ!' } })
	})
})
