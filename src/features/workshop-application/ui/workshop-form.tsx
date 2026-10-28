import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import type * as React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { CityMultiSelect, CitySelect } from '@/entities/city'
import { API_PATHS, invalidatePaths } from '@/shared/api'
import { useSaveMyWorkshop } from '@/shared/api/generated/endpoints/workshops/workshops'
import {
	FurnitureTypeEnum,
	WorkshopMaterialEnum,
	type WorkshopSchema,
	WorkshopServiceEnum,
} from '@/shared/api/generated/model'
import { formError, phoneField } from '@/shared/lib/form'
import { useApiErrorToast } from '@/shared/lib/use-api-error'
import { Button } from '@/shared/ui/button'
import { ChoiceChips } from '@/shared/ui/choice-chips'
import { Field } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { PhoneInput } from '@/shared/ui/phone-input'
import { toast } from '@/shared/ui/sonner'
import { Textarea } from '@/shared/ui/textarea'
import { UnsavedChangesGuard } from '@/shared/ui/unsaved-changes-guard'

const FOUNDED_MIN = 1950
const WARRANTY_MAX = 120

const optionalInt = (check: (value: number) => boolean, message: string) =>
	z
		.string()
		.trim()
		.refine((value) => value === '' || (/^\d+$/.test(value) && check(Number(value))), message)

const schema = z.object({
	name: z.string().trim().min(2, 'form.required').max(128, 'form.tooLong'),
	cityId: z.uuid({ message: 'form.required' }),
	serviceCityIds: z.array(z.uuid()).max(20),
	phone: phoneField(),
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
	services: z.array(z.enum(WorkshopServiceEnum)),
	materials: z.array(z.enum(WorkshopMaterialEnum)),
	warrantyMonths: optionalInt((value) => value <= WARRANTY_MAX, 'form.number'),
	foundedYear: optionalInt(
		(value) => value >= FOUNDED_MIN && value <= new Date().getFullYear(),
		'form.year',
	),
})

type Values = z.infer<typeof schema>

type Props = {
	workshop?: WorkshopSchema
	defaultCityId?: string | null
	defaultPhone?: string | null
}

function Section({
	title,
	text,
	children,
}: {
	title: string
	text: string
	children: React.ReactNode
}) {
	return (
		<fieldset className="grid grid-cols-1 gap-5 border-t pt-6 first:border-t-0 first:pt-0 sm:grid-cols-2">
			<legend className="contents">
				<span className="flex flex-col gap-1 sm:col-span-2">
					<span className="text-h4">{title}</span>
					<span className="text-body-sm text-muted-foreground">{text}</span>
				</span>
			</legend>
			{children}
		</fieldset>
	)
}

const toInt = (value: string) => (value === '' ? null : Number(value))

export function WorkshopForm({ workshop, defaultCityId, defaultPhone }: Props) {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const showError = useApiErrorToast()
	const { mutateAsync, isPending } = useSaveMyWorkshop()
	const form = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: workshop?.name ?? '',
			cityId: workshop?.city.id ?? defaultCityId ?? '',
			serviceCityIds: workshop?.serviceCities.map((city) => city.id) ?? [],
			phone: workshop?.phone ?? defaultPhone ?? '',
			taxId: workshop?.taxId ?? '',
			website: workshop?.website ?? '',
			description: workshop?.description ?? '',
			furnitureTypes: workshop?.furnitureTypes ?? [],
			services: workshop?.services ?? [],
			materials: workshop?.materials ?? [],
			warrantyMonths: workshop?.warrantyMonths?.toString() ?? '',
			foundedYear: workshop?.foundedYear?.toString() ?? '',
		},
	})
	const { errors, isDirty } = form.formState

	const submit = form.handleSubmit(async (values) => {
		try {
			await mutateAsync({
				data: {
					...values,
					// The main city is implied; drop it if it was picked as an extra one before
					serviceCityIds: values.serviceCityIds.filter((id) => id !== values.cityId),
					website: values.website || null,
					warrantyMonths: toInt(values.warrantyMonths),
					foundedYear: toInt(values.foundedYear),
				},
			})
			await invalidatePaths(queryClient, API_PATHS.workshops, API_PATHS.me)
			form.reset(values)
			toast.success(workshop ? t('workshop.form.saved') : t('workshop.form.sent'))
		} catch (error) {
			showError(error)
		}
	})

	return (
		<form onSubmit={submit} className="flex flex-col gap-8" noValidate>
			<UnsavedChangesGuard when={isDirty && !isPending} />
			<Section title={t('workshop.form.sectionMain')} text={t('workshop.form.sectionMainText')}>
				<Field label={t('workshop.form.name')} htmlFor="ws-name" error={formError(t, errors.name)}>
					<Input
						id="ws-name"
						className="h-10"
						autoComplete="organization"
						aria-invalid={Boolean(errors.name)}
						{...form.register('name')}
					/>
				</Field>
				<Field
					label={t('workshop.form.city')}
					htmlFor="ws-city"
					error={formError(t, errors.cityId)}
				>
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
				<Field
					label={t('workshop.form.serviceCities')}
					htmlFor="ws-service-cities"
					hint={t('workshop.form.serviceCitiesHint')}
					className="sm:col-span-2"
				>
					<Controller
						control={form.control}
						name="serviceCityIds"
						render={({ field }) => (
							<CityMultiSelect
								id="ws-service-cities"
								value={field.value}
								onChange={field.onChange}
								exclude={[form.watch('cityId')]}
							/>
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
					<Textarea id="ws-about" rows={5} maxLength={2000} {...form.register('description')} />
				</Field>
				<Field
					label={t('workshop.form.website')}
					htmlFor="ws-site"
					hint={t('workshop.form.websiteHint')}
					error={formError(t, errors.website)}
					className="sm:col-span-2"
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
			</Section>

			<Section title={t('workshop.form.sectionWork')} text={t('workshop.form.sectionWorkText')}>
				<Field
					label={<span id="ws-types-label">{t('workshop.form.types')}</span>}
					error={formError(t, errors.furnitureTypes)}
					className="sm:col-span-2"
				>
					<Controller
						control={form.control}
						name="furnitureTypes"
						render={({ field }) => (
							<ChoiceChips
								labelledBy="ws-types-label"
								invalid={Boolean(errors.furnitureTypes)}
								options={Object.values(FurnitureTypeEnum).map((value) => ({
									value,
									label: t(`furnitureTypes.${value}`),
								}))}
								value={field.value}
								onChange={field.onChange}
							/>
						)}
					/>
				</Field>
				<Field
					label={<span id="ws-services-label">{t('workshop.form.services')}</span>}
					className="sm:col-span-2"
				>
					<Controller
						control={form.control}
						name="services"
						render={({ field }) => (
							<ChoiceChips
								labelledBy="ws-services-label"
								options={Object.values(WorkshopServiceEnum).map((value) => ({
									value,
									label: t(`workshopServices.${value}`),
								}))}
								value={field.value}
								onChange={field.onChange}
							/>
						)}
					/>
				</Field>
				<Field
					label={<span id="ws-materials-label">{t('workshop.form.materials')}</span>}
					className="sm:col-span-2"
				>
					<Controller
						control={form.control}
						name="materials"
						render={({ field }) => (
							<ChoiceChips
								labelledBy="ws-materials-label"
								options={Object.values(WorkshopMaterialEnum).map((value) => ({
									value,
									label: t(`workshopMaterials.${value}`),
								}))}
								value={field.value}
								onChange={field.onChange}
							/>
						)}
					/>
				</Field>
				<Field
					label={t('workshop.form.warranty')}
					htmlFor="ws-warranty"
					hint={t('workshop.form.warrantyHint')}
					error={formError(t, errors.warrantyMonths)}
				>
					<Input
						id="ws-warranty"
						inputMode="numeric"
						maxLength={3}
						placeholder="12"
						className="h-10 tabular-nums"
						aria-invalid={Boolean(errors.warrantyMonths)}
						{...form.register('warrantyMonths')}
					/>
				</Field>
				<Field
					label={t('workshop.form.foundedYear')}
					htmlFor="ws-founded"
					hint={t('workshop.form.foundedYearHint')}
					error={formError(t, errors.foundedYear)}
				>
					<Input
						id="ws-founded"
						inputMode="numeric"
						maxLength={4}
						placeholder="2015"
						className="h-10 tabular-nums"
						aria-invalid={Boolean(errors.foundedYear)}
						{...form.register('foundedYear')}
					/>
				</Field>
			</Section>

			<Section
				title={t('workshop.form.sectionPrivate')}
				text={t('workshop.form.sectionPrivateText')}
			>
				<Field
					label={t('workshop.form.phone')}
					htmlFor="ws-phone"
					hint={t('workshop.form.phoneHint')}
					error={formError(t, errors.phone)}
				>
					<Controller
						control={form.control}
						name="phone"
						render={({ field }) => (
							<PhoneInput
								id="ws-phone"
								placeholder="+7 701 123 45 67"
								className="h-10"
								aria-invalid={Boolean(errors.phone)}
								value={field.value}
								onChange={field.onChange}
								onBlur={field.onBlur}
								ref={field.ref}
							/>
						)}
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
			</Section>

			<div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center">
				<Button
					type="submit"
					size="lg"
					disabled={isPending || (Boolean(workshop) && !isDirty)}
					className="w-full sm:w-auto"
				>
					{workshop ? t('workshop.form.save') : t('workshop.form.submit')}
				</Button>
				{workshop && isDirty && (
					<p className="text-body-sm text-muted-foreground">{t('common.unsaved')}</p>
				)}
			</div>
		</form>
	)
}
