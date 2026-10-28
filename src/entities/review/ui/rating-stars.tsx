import { useTranslation } from 'react-i18next'
import { Star } from '@/shared/design'
import { cn } from '@/shared/lib/utils'

const STARS = [1, 2, 3, 4, 5] as const

/** Read-only stars; `value` may be fractional (an average). */
export function RatingStars({ value, className }: { value: number; className?: string }) {
	const { t } = useTranslation()
	return (
		<span
			role="img"
			aria-label={t('reviews.ratingLabel', {
				value: value.toLocaleString(undefined, { maximumFractionDigits: 1 }),
			})}
			className={cn('inline-flex items-center gap-0.5', className)}
		>
			{STARS.map((star) => (
				<Star
					key={star}
					aria-hidden
					className={cn(
						'size-4',
						star <= Math.round(value) ? 'fill-warning text-warning' : 'text-muted-foreground/40',
					)}
				/>
			))}
		</span>
	)
}
