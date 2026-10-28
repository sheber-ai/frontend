import { useTranslation } from 'react-i18next'
import type { ReviewSchema } from '@/shared/api/generated/model'
import { formatDate } from '@/shared/lib/format'
import { RatingStars } from './rating-stars'

export function ReviewItem({ review }: { review: ReviewSchema }) {
	const { t, i18n } = useTranslation()
	return (
		<article className="flex flex-col gap-2">
			<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
				<RatingStars value={review.rating} />
				<span className="text-body-sm font-medium">{review.author || t('reviews.anonymous')}</span>
				<span className="text-caption text-muted-foreground">
					{formatDate(review.createdAt, i18n.language)}
				</span>
			</div>
			{review.text && <p className="text-body-sm whitespace-pre-line">{review.text}</p>}
			{review.reply && (
				<div className="ml-1 flex flex-col gap-1 border-l-2 border-border pl-3">
					<span className="text-caption font-medium text-muted-foreground">
						{t('reviews.reply.label')}
					</span>
					<p className="text-body-sm whitespace-pre-line">{review.reply}</p>
				</div>
			)}
		</article>
	)
}
