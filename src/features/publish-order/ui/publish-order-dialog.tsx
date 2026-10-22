import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { CitySelect } from '@/entities/city'
import { useViewer } from '@/entities/viewer'
import {
	getListMyOrdersQueryKey,
	useCreateOrder,
} from '@/shared/api/generated/endpoints/orders/orders'
import { createOrderBodyDescriptionMax } from '@/shared/api/generated/zod/orders/orders.zod'
import { Send, TriangleAlert } from '@/shared/design'
import { formError, parseAmount, todayIso } from '@/shared/lib/form'
import { useApiErrorToast } from '@/shared/lib/use-api-error'
import { Button } from '@/shared/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/shared/ui/dialog'
import { Field } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { toast } from '@/shared/ui/sonner'
import { Textarea } from '@/shared/ui/textarea'

const schema = z.object({
	cityId: z.uuid({ message: 'form.required' }),
	budget: z.string().regex(/^[\d\s]*$/, 'form.digits'),
	deadline: z.string().refine((value) => !value || value >= todayIso(), 'form.pastDate'),
	description: z.string().max(createOrderBodyDescriptionMax, 'form.tooLong'),
})

type Values = z.infer<typeof schema>

type Props = {
	designId: string
	/** Saves pending edits; publishing stops if it fails */
	beforePublish?: () => Promise<boolean>
	/** The design has errors: the dialog explains instead of showing the form */
	blocked?: boolean
	onShowIssues?: () => void
	children: React.ReactNode
}

export function PublishOrderDialog({
	designId,
	beforePublish,
	blocked,
	onShowIssues,
	children,
}: Props) {
	const { t } = useTranslation()
	const { viewer } = useViewer()
	const [open, setOpen] = useState(false)
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const showError = useApiErrorToast()
	const { mutateAsync, isPending } = useCreateOrder()

	const form = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: { cityId: viewer?.city?.id ?? '', budget: '', deadline: '', description: '' },
	})
	const { errors } = form.formState

	const submit = form.handleSubmit(async (values) => {
		if (beforePublish && !(await beforePublish())) return
		try {
			const order = await mutateAsync({
				data: {
					designId,
					cityId: values.cityId,
					budget: parseAmount(values.budget),
					deadline: values.deadline || null,
					description: values.description.trim(),
				},
			})
			await queryClient.invalidateQueries({ queryKey: getListMyOrdersQueryKey() })
			toast.success(t('publish.success'))
			setOpen(false)
			await navigate({ to: '/orders/$orderId', params: { orderId: order.id } })
		} catch (error) {
			showError(error)
		}
	})

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-lg">
				{blocked ? (
					<>
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<TriangleAlert className="size-5 text-destructive" />
								{t('publish.blockedTitle')}
							</DialogTitle>
							<DialogDescription>{t('publish.blockedText')}</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								onClick={() => {
									setOpen(false)
									onShowIssues?.()
								}}
							>
								{t('publish.showIssues')}
							</Button>
						</DialogFooter>
					</>
				) : (
					<form onSubmit={submit} className="flex flex-col gap-5" noValidate>
						<DialogHeader>
							<DialogTitle>{t('publish.title')}</DialogTitle>
							<DialogDescription>{t('publish.description')}</DialogDescription>
						</DialogHeader>

						<Field
							label={t('publish.city')}
							htmlFor="publish-city"
							error={formError(t, errors.cityId)}
						>
							<Controller
								control={form.control}
								name="cityId"
								render={({ field }) => (
									<CitySelect
										id="publish-city"
										value={field.value}
										onChange={field.onChange}
										invalid={Boolean(errors.cityId)}
									/>
								)}
							/>
						</Field>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Field
								label={t('publish.budget')}
								htmlFor="publish-budget"
								hint={t('publish.optional')}
								error={formError(t, errors.budget)}
							>
								<div className="relative">
									<Input
										id="publish-budget"
										inputMode="numeric"
										placeholder="450 000"
										className="h-10 pr-8"
										aria-invalid={Boolean(errors.budget)}
										{...form.register('budget')}
									/>
									<span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">
										₸
									</span>
								</div>
							</Field>
							<Field
								label={t('publish.deadline')}
								htmlFor="publish-deadline"
								hint={t('publish.optional')}
								error={formError(t, errors.deadline)}
							>
								<Input
									id="publish-deadline"
									type="date"
									min={todayIso()}
									className="h-10"
									aria-invalid={Boolean(errors.deadline)}
									{...form.register('deadline')}
								/>
							</Field>
						</div>

						<Field
							label={t('publish.notes')}
							htmlFor="publish-notes"
							hint={t('publish.notesHint')}
							error={formError(t, errors.description)}
						>
							<Textarea
								id="publish-notes"
								rows={4}
								placeholder={t('publish.notesPlaceholder')}
								{...form.register('description')}
							/>
						</Field>

						<DialogFooter>
							<Button type="submit" disabled={isPending} className="w-full sm:w-auto">
								<Send />
								{t('publish.submit')}
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	)
}
