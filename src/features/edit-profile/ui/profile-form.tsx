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
import { formError, phoneField } from '@/shared/lib/form'
import { useApiErrorToast } from '@/shared/lib/use-api-error'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { PhoneInput } from '@/shared/ui/phone-input'
import { UnsavedChangesGuard } from '@/shared/ui/unsaved-changes-guard'

const schema = z.object({
	firstName: z.string().trim().min(1, 'form.required').max(128, 'form.tooLong'),
	lastName: z.string().trim().max(128, 'form.tooLong'),
	phone: phoneField(),
	cityId: z.uuid({ message: 'form.required' }),
})

type Values = z.infer<typeof schema>

type Props = {
	viewer: Viewer
	submitLabel: string
	onSaved?: (user: UserSchema) => void
	/** Ask before leaving with unsaved edits; off where saving itself navigates away (onboarding) */
	guardUnsaved?: boolean
}

export function ProfileForm({ viewer, submitLabel, onSaved, guardUnsaved = true }: Props) {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const showError = useApiErrorToast()
	const { mutateAsync, isPending } = useUpdateMyProfile()
	const form = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: {
			firstName: viewer.firstName ?? '',
			lastName: viewer.lastName ?? '',
			phone: viewer.phone ?? '',
			cityId: viewer.city?.id ?? '',
		},
	})
	const { errors, isDirty } = form.formState

	const submit = form.handleSubmit(async (values) => {
		try {
			const user = await mutateAsync({ data: { ...values, lastName: values.lastName || null } })
			queryClient.setQueryData(getGetMyProfileQueryKey(), user)
			form.reset(values)
			onSaved?.(user)
		} catch (error) {
			showError(error)
		}
	})

	return (
		<form onSubmit={submit} className="@container" noValidate>
			<UnsavedChangesGuard when={guardUnsaved && isDirty && !isPending} />
			<div className="grid grid-cols-1 gap-5 @lg:grid-cols-2">
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
					<Controller
						control={form.control}
						name="phone"
						render={({ field }) => (
							<PhoneInput
								id="profile-phone"
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
				<div className="@lg:col-span-2">
					<Button type="submit" size="lg" disabled={isPending} className="w-full @lg:w-auto">
						{submitLabel}
					</Button>
				</div>
			</div>
		</form>
	)
}
