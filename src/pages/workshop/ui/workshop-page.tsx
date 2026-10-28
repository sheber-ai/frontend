import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { hasRole, useViewer } from '@/entities/viewer'
import { missingProfileParts, profileCompleteness, WorkshopStatusBadge } from '@/entities/workshop'
import { AttachmentGallery } from '@/features/manage-attachments'
import { WorkshopForm } from '@/features/workshop-application'
import { API_PATHS, invalidatePaths } from '@/shared/api'
import { useGetMyWorkshop } from '@/shared/api/generated/endpoints/workshops/workshops'
import type { WorkshopSchema } from '@/shared/api/generated/model'
import { refreshSession } from '@/shared/auth'
import {
	ArrowRight,
	BadgeCheck,
	CircleCheck,
	Eye,
	Hourglass,
	Inbox,
	ShieldCheck,
	Store,
	TriangleAlert,
} from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'

function Completeness({ workshop }: { workshop: WorkshopSchema }) {
	const { t } = useTranslation()
	const missing = missingProfileParts(workshop)
	const percent = profileCompleteness(workshop)
	return (
		<section className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
			<div className="flex items-baseline justify-between gap-3">
				<h2 className="text-h4">{t('workshop.completeness')}</h2>
				<span className="text-body-sm font-medium tabular-nums">{percent}%</span>
			</div>
			<div
				role="progressbar"
				aria-label={t('workshop.completeness')}
				aria-valuenow={percent}
				aria-valuemin={0}
				aria-valuemax={100}
				className="h-2 overflow-hidden rounded-full bg-secondary"
			>
				<div
					className="h-full rounded-full bg-primary transition-[width]"
					style={{ width: `${percent}%` }}
				/>
			</div>
			{missing.length === 0 ? (
				<p className="flex items-start gap-2 text-body-sm">
					<CircleCheck className="mt-0.5 size-4 shrink-0 text-success" />
					{t('workshop.completenessDone')}
				</p>
			) : (
				<>
					<p className="text-body-sm text-muted-foreground">{t('workshop.completenessText')}</p>
					<ul className="flex flex-col gap-2 text-body-sm">
						{missing.map((check) => (
							<li key={check} className="flex gap-2">
								<span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
								{t(`workshop.checks.${check}`)}
							</li>
						))}
					</ul>
				</>
			)}
		</section>
	)
}

function Shortcuts({ workshopId }: { workshopId: string }) {
	const { t } = useTranslation()
	const LINK =
		'flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none [&>svg]:size-4 [&>svg]:text-muted-foreground'
	return (
		<section className="flex flex-col gap-2 rounded-2xl border bg-card p-3">
			<h2 className="px-3 pt-2 text-caption tracking-wider text-muted-foreground uppercase">
				{t('workshop.shortcuts')}
			</h2>
			<Link to="/market" className={LINK}>
				<Store />
				<span className="flex-1">{t('nav.market')}</span>
				<ArrowRight />
			</Link>
			<Link to="/market/offers" className={LINK}>
				<Inbox />
				<span className="flex-1">{t('workshop.myOffers')}</span>
				<ArrowRight />
			</Link>
			<Link to="/workshops/$workshopId" params={{ workshopId }} className={LINK}>
				<Eye />
				<span className="flex flex-1 flex-col">
					{t('workshop.viewPublic')}
					<span className="text-caption text-muted-foreground">{t('workshop.publicHint')}</span>
				</span>
				<ArrowRight />
			</Link>
		</section>
	)
}

export function WorkshopPage() {
	const { t } = useTranslation()
	const { viewer } = useViewer()
	const queryClient = useQueryClient()
	const { data: workshop, isPending, isError } = useGetMyWorkshop()
	const approved = workshop?.status === 'approved'

	// A role granted after login appears only in a refreshed token
	useEffect(() => {
		if (!approved || !viewer || hasRole(viewer, 'contractor')) return
		void refreshSession().then(() => invalidatePaths(queryClient, API_PATHS.me))
	}, [approved, viewer, queryClient])

	const status = workshop ? (
		<div
			className={cn(
				'flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5',
				workshop.status === 'approved' && 'border-success/40 bg-success/5',
				workshop.status === 'pending' && 'border-warning/50 bg-warning/10',
				workshop.status === 'rejected' && 'border-destructive/40 bg-destructive/5',
			)}
		>
			<div className="flex gap-3">
				<span className="mt-0.5 [&_svg]:size-5">
					{workshop.status === 'approved' && <BadgeCheck className="text-success" />}
					{workshop.status === 'pending' && <Hourglass />}
					{workshop.status === 'rejected' && <TriangleAlert className="text-destructive" />}
				</span>
				<div className="flex flex-col gap-1">
					<div className="flex flex-wrap items-center gap-2">
						<p className="font-medium">{t(`workshop.status.${workshop.status}.title`)}</p>
						<WorkshopStatusBadge status={workshop.status} />
					</div>
					<p className="text-body-sm text-muted-foreground">
						{t(`workshop.status.${workshop.status}.text`)}
					</p>
					{workshop.rejectionReason && (
						<p className="text-body-sm">
							<span className="font-medium">{t('workshop.reason')}: </span>
							{workshop.rejectionReason}
						</p>
					)}
				</div>
			</div>
		</div>
	) : null

	return (
		<main className="page-container flex flex-col gap-8 py-8 sm:py-12">
			<PageHeader
				eyebrow={t('workshop.eyebrow')}
				title={workshop ? workshop.name : t('workshop.applyTitle')}
				description={workshop ? undefined : t('workshop.applyText')}
			/>
			{status}
			{isPending ? (
				<Skeleton className="h-96" />
			) : (
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
					<div className="flex min-w-0 flex-col gap-6">
						{workshop && !isError && (
							<section className="flex flex-col gap-6 rounded-2xl border bg-card p-5 sm:p-8">
								<div className="flex flex-col gap-1">
									<h2 className="text-h4">{t('workshop.mediaTitle')}</h2>
									<p className="text-body-sm text-muted-foreground">{t('workshop.mediaText')}</p>
								</div>
								<AttachmentGallery
									purpose="workshop_logo"
									target={{ workshopId: workshop.id }}
									editable
								/>
								<AttachmentGallery
									purpose="workshop_portfolio"
									target={{ workshopId: workshop.id }}
									editable
									captions
									ordered
								/>
							</section>
						)}
						<div className="rounded-2xl border bg-card p-5 sm:p-8">
							<WorkshopForm
								workshop={isError ? undefined : workshop}
								defaultCityId={viewer?.city?.id}
								defaultPhone={viewer?.phone}
							/>
						</div>
					</div>
					<aside className="flex min-w-0 flex-col gap-4 max-lg:order-first lg:self-start">
						{workshop && !isError && <Completeness workshop={workshop} />}
						{workshop && approved && <Shortcuts workshopId={workshop.id} />}
						{!approved && (
							<div className="flex flex-col gap-4 rounded-2xl bg-secondary p-5 text-secondary-foreground sm:p-6">
								<ShieldCheck className="size-6 text-primary" />
								<p className="text-h4">{t('workshop.whyTitle')}</p>
								<ul className="flex flex-col gap-3 text-body-sm">
									{(['one', 'two', 'three'] as const).map((key) => (
										<li key={key} className="flex gap-2">
											<span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
											{t(`workshop.why.${key}`)}
										</li>
									))}
								</ul>
							</div>
						)}
					</aside>
				</div>
			)}
		</main>
	)
}
