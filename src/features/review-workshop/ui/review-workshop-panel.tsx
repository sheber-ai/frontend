import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ReviewItem } from '@/entities/review'
import { API_PATHS, invalidatePaths } from '@/shared/api'
import {
	getGetOrderReviewQueryKey,
	useGetOrderReview,
	useSaveReview,
} from '@/shared/api/generated/endpoints/reviews/reviews'
import { Pencil, Star } from '@/shared/design'
import { useApiErrorToast } from '@/shared/lib/use-api-error'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { Skeleton } from '@/shared/ui/skeleton'
import { toast } from '@/shared/ui/sonner'
import { Textarea } from '@/shared/ui/textarea'

const STARS = [1, 2, 3, 4, 5] as const
const TEXT_MAX = 2000

/** The client rates the workshop that completed the order; one review per order, can be corrected. */
export function ReviewWorkshopPanel({
	orderId,
	workshopName,
}: {
	orderId: string
	workshopName: string
}) {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const showError = useApiErrorToast()
	const { data: review, isPending } = useGetOrderReview(orderId)
	const save = useSaveReview()
	const [editing, setEditing] = useState(false)
	const [rating, setRating] = useState(0)
	const [text, setText] = useState('')
	const [touched, setTouched] = useState(false)

	if (isPending) return <Skeleton className="h-24" />

	if (review && !editing) {
		return (
			<div className="flex flex-col gap-3">
				<ReviewItem review={review} />
				<Button
					variant="outline"
					size="sm"
					className="self-start"
					onClick={() => {
						setRating(review.rating)
						setText(review.text)
						setEditing(true)
					}}
				>
					<Pencil />
					{t('reviews.edit')}
				</Button>
			</div>
		)
	}

	const submit = async (event: React.FormEvent) => {
		event.preventDefault()
		setTouched(true)
		if (rating === 0) return
		try {
			await save.mutateAsync({ orderId, data: { rating, text } })
			await queryClient.invalidateQueries({ queryKey: getGetOrderReviewQueryKey(orderId) })
			await invalidatePaths(queryClient, API_PATHS.workshops)
			setEditing(false)
			toast.success(t('reviews.saved'))
		} catch (error) {
			showError(error)
		}
	}

	return (
		<form onSubmit={submit} className="flex flex-col gap-4" noValidate>
			<p className="text-body-sm text-muted-foreground">
				{t('reviews.prompt', { name: workshopName })}
			</p>
			<fieldset className="flex flex-col gap-2">
				<legend className="mb-2 text-body-sm font-medium">{t('reviews.rating')}</legend>
				<div className="flex gap-1">
					{STARS.map((star) => (
						<label
							key={star}
							className="cursor-pointer rounded-md p-1 has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
						>
							<input
								type="radio"
								name={`rating-${orderId}`}
								value={star}
								checked={rating === star}
								onChange={() => setRating(star)}
								className="sr-only"
								aria-label={t('reviews.starLabel', { value: star })}
							/>
							<Star
								aria-hidden
								className={cn(
									'size-8 transition-colors',
									star <= rating ? 'fill-warning text-warning' : 'text-muted-foreground/50',
								)}
							/>
						</label>
					))}
				</div>
				{touched && rating === 0 && (
					<p role="alert" className="text-body-sm text-destructive">
						{t('reviews.ratingRequired')}
					</p>
				)}
			</fieldset>
			<Field label={t('reviews.text')} htmlFor={`review-${orderId}`} hint={t('reviews.textHint')}>
				<Textarea
					id={`review-${orderId}`}
					rows={4}
					maxLength={TEXT_MAX}
					value={text}
					onChange={(event) => setText(event.target.value)}
				/>
			</Field>
			<div className="flex flex-col gap-2 sm:flex-row">
				<Button type="submit" disabled={save.isPending} className="w-full sm:w-auto">
					{t('reviews.submit')}
				</Button>
				{review && (
					<Button type="button" variant="ghost" onClick={() => setEditing(false)}>
						{t('common.cancel')}
					</Button>
				)}
			</div>
		</form>
	)
}
