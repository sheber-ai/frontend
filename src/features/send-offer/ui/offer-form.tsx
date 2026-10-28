import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
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
import { Label } from '@/shared/ui/label'
import { toast } from '@/shared/ui/sonner'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'
import { UnsavedChangesGuard } from '@/shared/ui/unsaved-changes-guard'

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
	warrantyMonths: z
		.string()
		.trim()
		.refine(
			(value) => value === '' || (/^\d+$/.test(value) && Number(value) <= 120),
			'form.number',
		),
	prepaymentPercent: z
		.string()
		.trim()
		.refine(
			(value) => value === '' || (/^\d+$/.test(value) && Number(value) <= 100),
			'form.percent',
		),
	includesDelivery: z.boolean(),
	includesInstallation: z.boolean(),
})

const toInt = (value: string) => (value === '' ? null : Number(value))

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
			warrantyMonths: offer?.warrantyMonths?.toString() ?? '',
			prepaymentPercent: offer?.prepaymentPercent?.toString() ?? '',
			includesDelivery: offer?.includesDelivery ?? false,
			includesInstallation: offer?.includesInstallation ?? false,
		},
	})
	const { errors, isDirty } = form.formState

	const submit = form.handleSubmit(async (values) => {
		const data = {
			price: parseAmount(values.price) ?? 0,
			days: Number(values.days),
			comment: values.comment.trim(),
			warrantyMonths: toInt(values.warrantyMonths),
			prepaymentPercent: toInt(values.prepaymentPercent),
			includesDelivery: values.includesDelivery,
			includesInstallation: values.includesInstallation,
		}
		try {
			if (offer) await update.mutateAsync({ offerId: offer.id, data })
			else await create.mutateAsync({ orderId, data })
			await invalidatePaths(queryClient, API_PATHS.orders, API_PATHS.offers)
			form.reset(form.getValues())
			toast.success(offer ? t('offer.updated') : t('offer.sent'))
			onDone?.()
		} catch (error) {
			showError(error)
		}
	})

	return (
		<form onSubmit={submit} className="flex flex-col gap-4" noValidate>
			<UnsavedChangesGuard when={isDirty && !create.isPending && !update.isPending} />
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
			<fieldset className="flex flex-col gap-4 rounded-lg border p-4">
				<legend className="px-1 text-body-sm font-medium">{t('offer.terms')}</legend>
				{(['includesDelivery', 'includesInstallation'] as const).map((name) => (
					<div key={name} className="flex items-center gap-3">
						<Controller
							control={form.control}
							name={name}
							render={({ field }) => (
								<Switch
									id={`offer-${name}`}
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							)}
						/>
						<Label htmlFor={`offer-${name}`} className="cursor-pointer font-normal">
							{t(`offer.${name}`)}
						</Label>
					</div>
				))}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
					<Field
						label={t('offer.warranty')}
						htmlFor="offer-warranty"
						error={formError(t, errors.warrantyMonths)}
					>
						<Input
							id="offer-warranty"
							inputMode="numeric"
							maxLength={3}
							placeholder="12"
							className="h-10 tabular-nums"
							aria-invalid={Boolean(errors.warrantyMonths)}
							{...form.register('warrantyMonths')}
						/>
					</Field>
					<Field
						label={t('offer.prepayment')}
						htmlFor="offer-prepayment"
						hint={t('offer.prepaymentHint')}
						error={formError(t, errors.prepaymentPercent)}
					>
						<Input
							id="offer-prepayment"
							inputMode="numeric"
							maxLength={3}
							placeholder="50"
							className="h-10 tabular-nums"
							aria-invalid={Boolean(errors.prepaymentPercent)}
							{...form.register('prepaymentPercent')}
						/>
					</Field>
				</div>
			</fieldset>
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
