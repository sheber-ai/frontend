import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { hasRole, useViewer } from '@/entities/viewer'
import { WorkshopStatusBadge } from '@/entities/workshop'
import { WorkshopForm } from '@/features/workshop-application'
import { API_PATHS, invalidatePaths } from '@/shared/api'
import { useGetMyWorkshop } from '@/shared/api/generated/endpoints/workshops/workshops'
import { refreshSession } from '@/shared/auth'
import { ArrowRight, BadgeCheck, Hourglass, ShieldCheck, TriangleAlert } from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'

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
			{approved && (
				<Button asChild className="w-full sm:w-auto">
					<Link to="/market">
						{t('workshop.toMarket')}
						<ArrowRight />
					</Link>
				</Button>
			)}
		</div>
	) : null

	return (
		<main className="page-container flex flex-col gap-8 py-8 sm:py-12">
			<PageHeader
				eyebrow={t('workshop.eyebrow')}
				title={workshop ? workshop.name : t('workshop.applyTitle')}
				description={workshop ? undefined : t('workshop.applyText')}
			/>
			{isPending ? (
				<Skeleton className="h-96" />
			) : (
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
					<div className="flex min-w-0 flex-col gap-6">
						{status}
						<div className="rounded-2xl border bg-card p-5 sm:p-8">
							<WorkshopForm
								workshop={isError ? undefined : workshop}
								defaultCityId={viewer?.city?.id}
								defaultPhone={viewer?.phone}
							/>
						</div>
					</div>
					<aside className="flex flex-col gap-4 rounded-2xl bg-secondary p-5 text-secondary-foreground sm:p-6 lg:self-start">
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
					</aside>
				</div>
			)}
		</main>
	)
}
