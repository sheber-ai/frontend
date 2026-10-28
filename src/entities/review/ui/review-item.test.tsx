import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ReviewSchema } from '@/shared/api/generated/model'
import { ReviewItem } from './review-item'

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, options?: { value?: number }) =>
			options?.value ? `${key}:${options.value}` : key,
		i18n: { language: 'ru' },
	}),
}))

const review: ReviewSchema = {
	id: 'r1',
	orderId: 'o1',
	rating: 4,
	text: 'Аккуратно',
	author: 'Айгерим К.',
	reply: null,
	repliedAt: null,
	createdAt: '2026-10-01T10:00:00Z',
	updatedAt: '2026-10-01T10:00:00Z',
}

describe('ReviewItem', () => {
	it('shows the workshop reply under the review', () => {
		render(
			<ReviewItem review={{ ...review, reply: 'Спасибо!', repliedAt: '2026-10-02T10:00:00Z' }} />,
		)
		expect(screen.getByText('reviews.reply.label')).toBeInTheDocument()
		expect(screen.getByText('Спасибо!')).toBeInTheDocument()
	})

	it('has no reply block until the workshop answers', () => {
		render(<ReviewItem review={review} />)
		expect(screen.queryByText('reviews.reply.label')).not.toBeInTheDocument()
	})
})
