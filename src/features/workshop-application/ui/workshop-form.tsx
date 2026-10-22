import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { CitySelect } from '@/entities/city'
import { API_PATHS, invalidatePaths } from '@/shared/api'
import { useSaveMyWorkshop } from '@/shared/api/generated/endpoints/workshops/workshops'
import { FurnitureTypeEnum, type WorkshopSchema } from '@/shared/api/generated/model'
import { Check } from '@/shared/design'
import { formError, PHONE_PATTERN } from '@/shared/lib/form'
import { formatPhone } from '@/shared/lib/format'
import { useApiErrorToast } from '@/shared/lib/use-api-error'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { toast } from '@/shared/ui/sonner'
import { Textarea } from '@/shared/ui/textarea'

const schema = z.object({
	name: z.string().trim().min(2, 'form.required').max(128, 'form.tooLong'),
	cityId: z.uuid({ message: 'form.required' }),
	phone: z.string().trim().regex(PHONE_PATTERN, 'form.phone'),
	taxId: z
		.string()
		.trim()
		.regex(/^\d{12}$/, 'form.taxId'),
	website: z
		.string()
		.trim()
		.refine((value) => !value || /^https?:\/\/\S+\.\S+/.test(value), 'form.url'),
	description: z.string().max(2000, 'form.tooLong'),
	furnitureTypes: z.array(z.enum(FurnitureTypeEnum)).min(1, 'form.pickOne'),
})

type Values = z.infer<typeof schema>

type Props = {
	workshop?: WorkshopSchema
	defaultCityId?: string | null
	defaultPhone?: string | null
}

export function WorkshopForm({ workshop, defaultCityId, defaultPhone }: Props) {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const showError = useApiErrorToast()
	const { mutateAsync, isPending } = useSaveMyWorkshop()
	const phone = workshop?.phone ?? defaultPhone
	const form = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: workshop?.name ?? '',
			cityId: workshop?.city.id ?? defaultCityId ?? '',
			phone: phone ? formatPhone(phone) : '',
			taxId: workshop?.taxId ?? '',
			website: workshop?.website ?? '',
			description: workshop?.description ?? '',
			furnitureTypes: workshop?.furnitureTypes ?? [],
		},
	})
	const { errors } = form.formState

	const submit = form.handleSubmit(async (values) => {
		try {
			await mutateAsync({ data: { ...values, website: values.website || null } })
			await invalidatePaths(queryClient, API_PATHS.workshops, API_PATHS.me)
			toast.success(workshop ? t('workshop.form.saved') : t('workshop.form.sent'))
		} catch (error) {
			showError(error)
		}
	})

	return (
		<form onSubmit={submit} className="grid grid-cols-1 gap-5 sm:grid-cols-2" noValidate>
			<Field
				label={t('workshop.form.name')}
				htmlFor="ws-name"
				error={formError(t, errors.name)}
				className="sm:col-span-2"
			>
				<Input
					id="ws-name"
					className="h-10"
					aria-invalid={Boolean(errors.name)}
					{...form.register('name')}
				/>
			</Field>
			<Field label={t('workshop.form.city')} htmlFor="ws-city" error={formError(t, errors.cityId)}>
				<Controller
					control={form.control}
					name="cityId"
					render={({ field }) => (
						<CitySelect
							id="ws-city"
							value={field.value}
							onChange={field.onChange}
							invalid={Boolean(errors.cityId)}
						/>
					)}
				/>
			</Field>
			<Field label={t('workshop.form.phone')} htmlFor="ws-phone" error={formError(t, errors.phone)}>
				<Input
					id="ws-phone"
					type="tel"
					inputMode="tel"
					placeholder="+7 701 123 45 67"
					className="h-10"
					aria-invalid={Boolean(errors.phone)}
					{...form.register('phone')}
				/>
			</Field>
			<Field
				label={t('workshop.form.taxId')}
				htmlFor="ws-tax"
				hint={t('workshop.form.taxIdHint')}
				error={formError(t, errors.taxId)}
			>
				<Input
					id="ws-tax"
					inputMode="numeric"
					maxLength={12}
					className="h-10 tabular-nums"
					aria-invalid={Boolean(errors.taxId)}
					{...form.register('taxId')}
				/>
			</Field>
			<Field
				label={t('workshop.form.website')}
				htmlFor="ws-site"
				hint={t('workshop.form.websiteHint')}
				error={formError(t, errors.website)}
			>
				<Input
					id="ws-site"
					type="url"
					placeholder="https://instagram.com/…"
					className="h-10"
					aria-invalid={Boolean(errors.website)}
					{...form.register('website')}
				/>
			</Field>
			<Field
				label={t('workshop.form.types')}
				error={formError(t, errors.furnitureTypes)}
				className="sm:col-span-2"
			>
				<Controller
					control={form.control}
					name="furnitureTypes"
					render={({ field }) => (
						<div className="flex flex-wrap gap-2">
							{Object.values(FurnitureTypeEnum).map((type) => {
								const active = field.value.includes(type)
								return (
									<button
										key={type}
										type="button"
										aria-pressed={active}
										onClick={() =>
											field.onChange(
												active
													? field.value.filter((item) => item !== type)
													: [...field.value, type],
											)
										}
										className={cn(
											'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-body-sm transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50',
											active && 'border-primary bg-primary/10 text-primary hover:bg-primary/15',
										)}
									>
										{active && <Check className="size-4" />}
										{t(`furnitureTypes.${type}`)}
									</button>
								)
							})}
						</div>
					)}
				/>
			</Field>
			<Field
				label={t('workshop.form.description')}
				htmlFor="ws-about"
				hint={t('workshop.form.descriptionHint')}
				error={formError(t, errors.description)}
				className="sm:col-span-2"
			>
				<Textarea id="ws-about" rows={5} {...form.register('description')} />
			</Field>
			<div className="sm:col-span-2">
				<Button type="submit" size="lg" disabled={isPending} className="w-full sm:w-auto">
					{workshop ? t('workshop.form.save') : t('workshop.form.submit')}
				</Button>
			</div>
		</form>
	)
}
