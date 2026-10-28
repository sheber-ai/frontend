import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { API_PATHS, invalidatePaths } from '@/shared/api'
import {
	getGetOrderReviewQueryKey,
	useReplyToReview,
} from '@/shared/api/generated/endpoints/reviews/reviews'
import type { ReviewSchema } from '@/shared/api/generated/model'
import { MessageCircle, Pencil } from '@/shared/design'
import { useApiErrorToast } from '@/shared/lib/use-api-error'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { toast } from '@/shared/ui/sonner'
import { Textarea } from '@/shared/ui/textarea'

const TEXT_MAX = 1000

/** The reviewed workshop answers the client publicly; the answer can be corrected. */
export function ReplyReviewForm({ review }: { review: ReviewSchema }) {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const showError = useApiErrorToast()
	const reply = useReplyToReview()
	const [editing, setEditing] = useState(false)
	const [text, setText] = useState('')
	const [touched, setTouched] = useState(false)

	if (!editing) {
		return (
			<Button
				variant="outline"
				size="sm"
				className="self-start"
				onClick={() => {
					setText(review.reply ?? '')
					setTouched(false)
					setEditing(true)
				}}
			>
				{review.reply ? <Pencil /> : <MessageCircle />}
				{t(review.reply ? 'reviews.reply.edit' : 'reviews.reply.action')}
			</Button>
		)
	}

	const value = text.trim()
	const fieldId = `review-reply-${review.orderId}`

	const submit = async (event: React.FormEvent) => {
		event.preventDefault()
		setTouched(true)
		if (!value) return
		try {
			await reply.mutateAsync({ orderId: review.orderId, data: { text: value } })
			await queryClient.invalidateQueries({ queryKey: getGetOrderReviewQueryKey(review.orderId) })
			await invalidatePaths(queryClient, API_PATHS.workshops)
			setEditing(false)
			toast.success(t('reviews.reply.saved'))
		} catch (error) {
			showError(error)
		}
	}

	return (
		<form onSubmit={submit} className="flex flex-col gap-3" noValidate>
			<Field
				label={t('reviews.reply.label')}
				htmlFor={fieldId}
				hint={t('reviews.reply.hint')}
				error={touched && !value ? t('reviews.reply.required') : undefined}
			>
				<Textarea
					id={fieldId}
					rows={3}
					maxLength={TEXT_MAX}
					value={text}
					onChange={(event) => setText(event.target.value)}
				/>
			</Field>
			<div className="flex flex-col gap-2 sm:flex-row">
				<Button type="submit" disabled={reply.isPending} className="w-full sm:w-auto">
					{t('reviews.reply.submit')}
				</Button>
				<Button type="button" variant="ghost" onClick={() => setEditing(false)}>
					{t('common.cancel')}
				</Button>
			</div>
		</form>
	)
}
