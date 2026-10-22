import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { API_PATHS, invalidatePaths } from '@/shared/api'
import { useUpdateOffer } from '@/shared/api/generated/endpoints/offers/offers'
import { useCreateOffer } from '@/shared/api/generated/endpoints/orders/orders'
import type { OfferSchema } from '@/shared/api/generated/model'
import {
	createOfferBodyDaysMax,
	createOfferBodyPriceMin,
} from '@/shared/api/generated/zod/orders/orders.zod'
import { Send } from '@/shared/design'
import { formError, parseAmount } from '@/shared/lib/form'
import { formatNumber } from '@/shared/lib/format'
import { useApiErrorToast } from '@/shared/lib/use-api-error'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { toast } from '@/shared/ui/sonner'
import { Textarea } from '@/shared/ui/textarea'

const schema = z.object({
	price: z
		.string()
		.regex(/^[\d\s]+$/, 'form.digits')
		.refine((value) => (parseAmount(value) ?? 0) >= createOfferBodyPriceMin, 'form.minPrice'),
	days: z
		.string()
		.regex(/^\d+$/, 'form.digits')
		.refine(
			(value) => Number(value) >= 1 && Number(value) <= createOfferBodyDaysMax,
			'form.invalid',
		),
	comment: z.string().max(2000, 'form.tooLong'),
})

type Values = z.infer<typeof schema>

type Props = {
	orderId: string
	/** Pending offer to edit */
	offer?: OfferSchema
	onDone?: () => void
}

export function OfferForm({ orderId, offer, onDone }: Props) {
	const { t, i18n } = useTranslation()
	const queryClient = useQueryClient()
	const showError = useApiErrorToast()
	const create = useCreateOffer()
	const update = useUpdateOffer()
	const form = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: {
			price: offer ? formatNumber(offer.price, i18n.language) : '',
			days: offer ? String(offer.days) : '',
			comment: offer?.comment ?? '',
		},
	})
	const { errors } = form.formState

	const submit = form.handleSubmit(async (values) => {
		const data = {
			price: parseAmount(values.price) ?? 0,
			days: Number(values.days),
			comment: values.comment.trim(),
		}
		try {
			if (offer) await update.mutateAsync({ offerId: offer.id, data })
			else await create.mutateAsync({ orderId, data })
			await invalidatePaths(queryClient, API_PATHS.orders, API_PATHS.offers)
			toast.success(offer ? t('offer.updated') : t('offer.sent'))
			onDone?.()
		} catch (error) {
			showError(error)
		}
	})

	return (
		<form onSubmit={submit} className="flex flex-col gap-4" noValidate>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
				<Field label={t('offer.price')} htmlFor="offer-price" error={formError(t, errors.price)}>
					<div className="relative">
						<Input
							id="offer-price"
							inputMode="numeric"
							placeholder="380 000"
							className="h-10 pr-8"
							aria-invalid={Boolean(errors.price)}
							{...form.register('price')}
						/>
						<span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">
							₸
						</span>
					</div>
				</Field>
				<Field label={t('offer.days')} htmlFor="offer-days" error={formError(t, errors.days)}>
					<Input
						id="offer-days"
						inputMode="numeric"
						placeholder="21"
						className="h-10"
						aria-invalid={Boolean(errors.days)}
						{...form.register('days')}
					/>
				</Field>
			</div>
			<Field
				label={t('offer.comment')}
				htmlFor="offer-comment"
				hint={t('offer.commentHint')}
				error={formError(t, errors.comment)}
			>
				<Textarea id="offer-comment" rows={4} {...form.register('comment')} />
			</Field>
			<Button
				type="submit"
				disabled={create.isPending || update.isPending}
				className="w-full sm:w-auto"
			>
				<Send />
				{offer ? t('offer.save') : t('offer.send')}
			</Button>
		</form>
	)
}
