import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { CitySelect } from '@/entities/city'
import type { Viewer } from '@/entities/viewer'
import {
	getGetMyProfileQueryKey,
	useUpdateMyProfile,
} from '@/shared/api/generated/endpoints/users/users'
import type { UserSchema } from '@/shared/api/generated/model'
import { formError, PHONE_PATTERN } from '@/shared/lib/form'
import { formatPhone } from '@/shared/lib/format'
import { useApiErrorToast } from '@/shared/lib/use-api-error'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'

const schema = z.object({
	firstName: z.string().trim().min(1, 'form.required').max(128, 'form.tooLong'),
	lastName: z.string().trim().max(128, 'form.tooLong'),
	phone: z.string().trim().regex(PHONE_PATTERN, 'form.phone'),
	cityId: z.uuid({ message: 'form.required' }),
})

type Values = z.infer<typeof schema>

type Props = {
	viewer: Viewer
	submitLabel: string
	onSaved?: (user: UserSchema) => void
}

export function ProfileForm({ viewer, submitLabel, onSaved }: Props) {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const showError = useApiErrorToast()
	const { mutateAsync, isPending } = useUpdateMyProfile()
	const form = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: {
			firstName: viewer.firstName ?? '',
			lastName: viewer.lastName ?? '',
			phone: viewer.phone ? formatPhone(viewer.phone) : '',
			cityId: viewer.city?.id ?? '',
		},
	})
	const { errors } = form.formState

	const submit = form.handleSubmit(async (values) => {
		try {
			const user = await mutateAsync({ data: { ...values, lastName: values.lastName || null } })
			queryClient.setQueryData(getGetMyProfileQueryKey(), user)
			onSaved?.(user)
		} catch (error) {
			showError(error)
		}
	})

	return (
		<form onSubmit={submit} className="grid grid-cols-1 gap-5 sm:grid-cols-2" noValidate>
			<Field
				label={t('profileForm.firstName')}
				htmlFor="profile-first"
				error={formError(t, errors.firstName)}
			>
				<Input
					id="profile-first"
					autoComplete="given-name"
					className="h-10"
					aria-invalid={Boolean(errors.firstName)}
					{...form.register('firstName')}
				/>
			</Field>
			<Field
				label={t('profileForm.lastName')}
				htmlFor="profile-last"
				error={formError(t, errors.lastName)}
			>
				<Input
					id="profile-last"
					autoComplete="family-name"
					className="h-10"
					{...form.register('lastName')}
				/>
			</Field>
			<Field
				label={t('profileForm.phone')}
				htmlFor="profile-phone"
				hint={t('profileForm.phoneHint')}
				error={formError(t, errors.phone)}
			>
				<Input
					id="profile-phone"
					type="tel"
					inputMode="tel"
					autoComplete="tel"
					placeholder="+7 701 123 45 67"
					className="h-10"
					aria-invalid={Boolean(errors.phone)}
					{...form.register('phone')}
				/>
			</Field>
			<Field
				label={t('profileForm.city')}
				htmlFor="profile-city"
				error={formError(t, errors.cityId)}
			>
				<Controller
					control={form.control}
					name="cityId"
					render={({ field }) => (
						<CitySelect
							id="profile-city"
							value={field.value}
							onChange={field.onChange}
							invalid={Boolean(errors.cityId)}
						/>
					)}
				/>
			</Field>
			<div className="sm:col-span-2">
				<Button type="submit" size="lg" disabled={isPending} className="w-full sm:w-auto">
					{submitLabel}
				</Button>
			</div>
		</form>
	)
}
