import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { WorkshopStatusBadge } from '@/entities/workshop'
import { ModerationActions } from '@/features/moderate-workshop'
import { useListWorkshops } from '@/shared/api/generated/endpoints/workshops/workshops'
import { WorkshopStatusEnum } from '@/shared/api/generated/model'
import { ExternalLink, Inbox, Mail, MapPin, Phone } from '@/shared/design'
import { formatDate } from '@/shared/lib/format'
import { formatPhone } from '@/shared/lib/phone'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { Segmented } from '@/shared/ui/segmented'
import { Skeleton } from '@/shared/ui/skeleton'

export type AdminWorkshopsSearch = { status: WorkshopStatusEnum }

export function AdminWorkshopsPage({ search }: { search: AdminWorkshopsSearch }) {
	const { t, i18n } = useTranslation()
	const navigate = useNavigate()
	const { data, isPending } = useListWorkshops({ status: search.status, limit: 100 })

	return (
		<main className="page-container flex flex-col gap-8 py-8 sm:py-12">
			<PageHeader title={t('moderation.title')} description={t('moderation.description')} />
			<Segmented
				label={t('moderation.filter')}
				value={search.status}
				onChange={(status) =>
					void navigate({ to: '/admin/workshops', search: { status }, replace: true })
				}
				className="sm:max-w-md"
				options={Object.values(WorkshopStatusEnum).map((status) => ({
					value: status,
					label: t(`workshopStatus.${status}`),
				}))}
			/>
			{isPending ? (
				<Skeleton className="h-48" />
			) : data && data.items.length > 0 ? (
				<ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
					{data.items.map((workshop) => (
						<li
							key={workshop.id}
							className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-5"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<p className="truncate text-h4">{workshop.name}</p>
									<p className="text-body-sm text-muted-foreground">
										{t('moderation.applied', {
											date: formatDate(workshop.createdAt, i18n.language),
										})}
									</p>
								</div>
								<WorkshopStatusBadge status={workshop.status} />
							</div>
							<dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-body-sm sm:grid-cols-2 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
								<div className="flex min-w-0 items-center gap-2">
									<MapPin />
									<dt className="sr-only">{t('workshop.form.city')}</dt>
									<dd className="truncate">{workshop.city.name}</dd>
								</div>
								<div className="flex min-w-0 items-center gap-2">
									<Phone />
									<dt className="sr-only">{t('workshop.form.phone')}</dt>
									<dd className="truncate">{formatPhone(workshop.phone)}</dd>
								</div>
								<div className="flex min-w-0 items-center gap-2">
									<Mail />
									<dt className="sr-only">{t('moderation.owner')}</dt>
									<dd className="truncate">
										{workshop.ownerName}
										{workshop.ownerEmail && ` · ${workshop.ownerEmail}`}
									</dd>
								</div>
								<div className="flex min-w-0 items-center gap-2">
									<dt className="text-muted-foreground">{t('workshop.form.taxId')}</dt>
									<dd className="tabular-nums">{workshop.taxId}</dd>
								</div>
							</dl>
							<p className="text-body-sm text-muted-foreground">
								{workshop.furnitureTypes.map((type) => t(`furnitureTypes.${type}`)).join(', ')}
							</p>
							{workshop.description && (
								<p className="text-body-sm whitespace-pre-line">{workshop.description}</p>
							)}
							{workshop.website && (
								<a
									href={workshop.website}
									target="_blank"
									rel="noreferrer"
									className="inline-flex min-w-0 items-center gap-1.5 text-body-sm text-primary hover:underline"
								>
									<span className="truncate">{workshop.website}</span>
									<ExternalLink className="size-4 shrink-0" />
								</a>
							)}
							{workshop.rejectionReason && (
								<p className="rounded-lg bg-muted px-3 py-2 text-body-sm">
									<span className="font-medium">{t('workshop.reason')}: </span>
									{workshop.rejectionReason}
								</p>
							)}
							<ModerationActions
								workshopId={workshop.id}
								name={workshop.name}
								status={workshop.status}
							/>
						</li>
					))}
				</ul>
			) : (
				<EmptyState
					icon={<Inbox />}
					title={t('moderation.emptyTitle')}
					text={t('moderation.emptyText')}
				/>
			)}
		</main>
	)
}
