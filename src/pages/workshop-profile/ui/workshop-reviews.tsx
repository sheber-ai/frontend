import { keepPreviousData } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RatingStars, ReviewItem } from '@/entities/review'
import { useListWorkshopReviews } from '@/shared/api/generated/endpoints/reviews/reviews'
import type { WorkshopProfileSchema } from '@/shared/api/generated/model'
import { Star } from '@/shared/design'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { Skeleton } from '@/shared/ui/skeleton'

const PAGE_SIZE = 5

export function WorkshopReviews({ workshop }: { workshop: WorkshopProfileSchema }) {
	const { t, i18n } = useTranslation()
	const [limit, setLimit] = useState(PAGE_SIZE)
	const { data, isPending, isFetching } = useListWorkshopReviews(
		workshop.id,
		{ offset: 0, limit },
		{ query: { enabled: workshop.reviewsCount > 0, placeholderData: keepPreviousData } },
	)

	return (
		<section className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
				<h2 className="text-h4">{t('reviews.sectionTitle')}</h2>
				{workshop.ratingAverage !== null && workshop.reviewsCount > 0 && (
					<p className="flex items-center gap-2 text-body-sm">
						<RatingStars value={workshop.ratingAverage} />
						<span className="font-medium tabular-nums">
							{workshop.ratingAverage.toLocaleString(i18n.language, { maximumFractionDigits: 1 })}
						</span>
						<span className="text-muted-foreground">
							{t('reviews.count', { count: workshop.reviewsCount })}
						</span>
					</p>
				)}
			</div>
			{workshop.reviewsCount === 0 ? (
				<EmptyState
					icon={<Star />}
					title={t('reviews.emptyTitle')}
					text={t('reviews.emptyText')}
					className="py-10"
				/>
			) : isPending ? (
				<Skeleton className="h-24" />
			) : (
				<>
					<ul className="flex flex-col divide-y rounded-xl border bg-card">
						{data?.items.map((review) => (
							<li key={review.id} className="p-4">
								<ReviewItem review={review} />
							</li>
						))}
					</ul>
					{data && data.total > data.items.length && limit < 100 && (
						<Button
							variant="outline"
							className="w-full sm:w-auto sm:self-start"
							disabled={isFetching}
							onClick={() => setLimit((value) => Math.min(value + PAGE_SIZE * 2, 100))}
						>
							{t('reviews.showMore')}
						</Button>
					)}
				</>
			)}
			<p className="text-caption text-muted-foreground">{t('reviews.note')}</p>
		</section>
	)
}
