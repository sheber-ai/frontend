import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { CitySelect } from '@/entities/city'
import { type DesignDocument, DesignSpecsList, DesignThumbnail } from '@/entities/furniture'
import { useViewer } from '@/entities/viewer'
import { useListAttachments } from '@/shared/api/generated/endpoints/attachments/attachments'
import {
	getListMyOrdersQueryKey,
	useCreateOrder,
} from '@/shared/api/generated/endpoints/orders/orders'
import { createOrderBodyDescriptionMax } from '@/shared/api/generated/zod/orders/orders.zod'
import { ArrowLeft, ArrowRight, Image, Info, Send, TriangleAlert } from '@/shared/design'
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
	/** The design as it will be published, for the review step */
	document: DesignDocument
	/** Remarks that do not block publishing */
	warnings?: number
	/** Opens the editor tab with photos and documents */
	onShowFiles?: () => void
	/** Saves pending edits; publishing stops if it fails */
	beforePublish?: () => Promise<boolean>
	/** The design has errors: the dialog explains instead of showing the form */
	blocked?: boolean
	onShowIssues?: () => void
	children: React.ReactNode
}

const FILE_PURPOSES = ['reference', 'room', 'document'] as const

function Review({
	designId,
	document,
	warnings,
	onShowFiles,
	close,
}: {
	designId: string
	document: DesignDocument
	warnings: number
	onShowFiles?: () => void
	close: () => void
}) {
	const { t } = useTranslation()
	const { viewer } = useViewer()
	const { data } = useListAttachments({ designId })
	const count = (purpose: string) =>
		data?.items.filter((item) => item.purpose === purpose).length ?? 0
	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
				<div className="aspect-square rounded-lg border bg-blueprint p-3 max-sm:hidden">
					<DesignThumbnail document={document} />
				</div>
				<DesignSpecsList document={document} />
			</div>
			<section className="flex flex-col gap-2 rounded-lg border p-3">
				<div className="flex items-center justify-between gap-2">
					<p className="flex items-center gap-2 text-body-sm font-medium">
						<Image className="size-4 text-muted-foreground" />
						{t('publish.files')}
					</p>
					{onShowFiles && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => {
								close()
								onShowFiles()
							}}
						>
							{t('publish.editFiles')}
						</Button>
					)}
				</div>
				<ul className="flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-muted-foreground">
					{FILE_PURPOSES.map((purpose) => (
						<li key={purpose}>
							{t(`attachments.purposes.${purpose}.title`)}: {count(purpose)}
						</li>
					))}
				</ul>
				{data && count('room') === 0 && (
					<p className="text-body-sm text-muted-foreground">{t('publish.noRoomPhotos')}</p>
				)}
			</section>
			{warnings > 0 && (
				<p className="flex items-start gap-2 text-body-sm text-muted-foreground">
					<Info className="mt-0.5 size-4 shrink-0" />
					{t('publish.warnings', { count: warnings })}
				</p>
			)}
			{viewer && !viewer.phone && (
				<p
					role="alert"
					className="flex items-start gap-2 rounded-lg bg-warning/15 p-3 text-body-sm"
				>
					<TriangleAlert className="mt-0.5 size-4 shrink-0" />
					<span>
						{t('errors.profile_incomplete')}{' '}
						<Link to="/profile" className="font-medium underline underline-offset-4">
							{t('publish.toProfile')}
						</Link>
					</span>
				</p>
			)}
		</div>
	)
}

export function PublishOrderDialog({
	designId,
	document,
	warnings = 0,
	onShowFiles,
	beforePublish,
	blocked,
	onShowIssues,
	children,
}: Props) {
	const { t } = useTranslation()
	const { viewer } = useViewer()
	const [open, setOpen] = useState(false)
	const [step, setStep] = useState<'review' | 'details'>('review')
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
		<Dialog
			open={open}
			onOpenChange={(value) => {
				setOpen(value)
				if (value) setStep('review')
			}}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-lg">
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
				) : step === 'review' ? (
					<div className="flex flex-col gap-5">
						<DialogHeader>
							<DialogTitle>{t('publish.reviewTitle')}</DialogTitle>
							<DialogDescription>{t('publish.reviewText')}</DialogDescription>
						</DialogHeader>
						<Review
							designId={designId}
							document={document}
							warnings={warnings}
							onShowFiles={onShowFiles}
							close={() => setOpen(false)}
						/>
						<DialogFooter>
							<Button className="w-full sm:w-auto" onClick={() => setStep('details')}>
								{t('publish.next')}
								<ArrowRight />
							</Button>
						</DialogFooter>
					</div>
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
								hint={t('publish.budgetHint')}
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

						<DialogFooter className="gap-2">
							<Button
								type="button"
								variant="ghost"
								className="w-full sm:w-auto"
								onClick={() => setStep('review')}
							>
								<ArrowLeft />
								{t('common.back')}
							</Button>
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
