import { Link } from '@tanstack/react-router'
import type * as React from 'react'
import { useTranslation } from 'react-i18next'
import { CLIENT_ACTION_STEPS, clientNextStep, OrderStatusBadge } from '@/entities/order'
import { getViewerName, useViewer } from '@/entities/viewer'
import { WorkshopStatusBadge } from '@/entities/workshop'
import { ProfileForm } from '@/features/edit-profile'
import { useListDesigns } from '@/shared/api/generated/endpoints/designs/designs'
import { useListMyOrders } from '@/shared/api/generated/endpoints/orders/orders'
import { type OrderSchema, OrderStatusEnum } from '@/shared/api/generated/model'
import {
	ArrowRight,
	Box,
	CircleCheck,
	ClipboardList,
	Factory,
	Lock,
	Mail,
	MapPin,
	Plus,
} from '@/shared/design'
import { formatDate } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { Skeleton } from '@/shared/ui/skeleton'
import { toast } from '@/shared/ui/sonner'

const RECENT_COUNT = 5

function initials(name: string): string {
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((word) => word[0]?.toLocaleUpperCase() ?? '')
		.join('')
}

function Panel({
	title,
	action,
	children,
	className,
}: {
	title: React.ReactNode
	action?: React.ReactNode
	children: React.ReactNode
	className?: string
}) {
	return (
		<section className={cn('flex flex-col gap-4 rounded-2xl border bg-card p-5 sm:p-6', className)}>
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-h4">{title}</h2>
				{action}
			</div>
			{children}
		</section>
	)
}

function Attention({ orders }: { orders: OrderSchema[] }) {
	const { t } = useTranslation()
	const items = orders
		.map((order) => ({ order, step: clientNextStep(order) }))
		.filter(
			(item): item is { order: OrderSchema; step: NonNullable<typeof item.step> } =>
				item.step !== null && CLIENT_ACTION_STEPS.includes(item.step),
		)
	if (items.length === 0) {
		return (
			<p className="flex items-start gap-2 rounded-xl bg-muted px-4 py-3 text-body-sm text-muted-foreground">
				<CircleCheck className="mt-0.5 size-4 shrink-0 text-success" />
				{t('profile.allClear')}
			</p>
		)
	}
	return (
		<ul className="flex flex-col gap-2">
			{items.map(({ order, step }) => (
				<li key={order.id}>
					<Link
						to="/orders/$orderId"
						params={{ orderId: order.id }}
						className="group flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 transition-colors hover:bg-primary/10 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
					>
						<span className="flex min-w-0 flex-1 flex-col">
							<span className="truncate font-medium">{order.title}</span>
							<span className="text-body-sm text-muted-foreground">
								{t(`orderNextStep.${step}`, { count: order.offersCount })}
							</span>
						</span>
						<ArrowRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
					</Link>
				</li>
			))}
		</ul>
	)
}

function StatusCounts({ orders }: { orders: OrderSchema[] }) {
	const { t } = useTranslation()
	const counts = Object.values(OrderStatusEnum)
		.map((status) => ({ status, count: orders.filter((order) => order.status === status).length }))
		.filter((item) => item.count > 0)
	return (
		<ul className="flex flex-wrap gap-2">
			{counts.map(({ status, count }) => (
				<li
					key={status}
					className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-body-sm"
				>
					<span className="font-medium tabular-nums">{count}</span>
					<span className="text-muted-foreground">{t(`orderStatus.${status}`)}</span>
				</li>
			))}
		</ul>
	)
}

function RecentOrders({ orders }: { orders: OrderSchema[] }) {
	const { t, i18n } = useTranslation()
	return (
		<ul className="flex flex-col divide-y">
			{orders.slice(0, RECENT_COUNT).map((order) => (
				<li key={order.id}>
					<Link
						to="/orders/$orderId"
						params={{ orderId: order.id }}
						className="group flex flex-col gap-1.5 py-3 focus-visible:outline-none sm:flex-row sm:items-center sm:gap-4"
					>
						<span className="flex min-w-0 flex-1 flex-col">
							<span className="truncate font-medium group-hover:text-primary group-focus-visible:underline">
								{order.title}
							</span>
							<span className="text-body-sm text-muted-foreground">
								{formatDate(order.createdAt, i18n.language)}
								{order.status === 'published' &&
									` · ${t('profile.offers', { count: order.offersCount })}`}
							</span>
						</span>
						<OrderStatusBadge status={order.status} />
					</Link>
				</li>
			))}
		</ul>
	)
}

export function ProfilePage() {
	const { t } = useTranslation()
	const { viewer } = useViewer()
	const orders = useListMyOrders({ limit: 100 })
	const designs = useListDesigns({ limit: 1 })
	const name = viewer ? getViewerName(viewer) : ''
	const items = orders.data?.items ?? []
	const drafts = designs.data?.total ?? 0

	return (
		<main className="page-container flex flex-col gap-8 py-8 sm:py-12">
			<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex min-w-0 items-center gap-4">
					<span
						aria-hidden
						className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-h3 text-primary-foreground select-none sm:size-20"
					>
						{initials(name) || '·'}
					</span>
					<div className="flex min-w-0 flex-col gap-1">
						<h1 className="text-h3 break-words text-balance sm:text-h1">
							{name || t('profile.title')}
						</h1>
						<p className="flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-muted-foreground [&_svg]:size-4">
							{viewer?.email && (
								<span className="inline-flex min-w-0 items-center gap-1.5">
									<Mail />
									<span className="truncate">{viewer.email}</span>
								</span>
							)}
							{viewer?.city && (
								<span className="inline-flex items-center gap-1.5">
									<MapPin />
									{viewer.city.name}
								</span>
							)}
						</p>
					</div>
				</div>
				{items.length > 0 && (
					<Button asChild size="lg" className="w-full sm:w-auto">
						<Link to="/projects/new">
							<Plus />
							{t('profile.newProject')}
						</Link>
					</Button>
				)}
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
				<div className="flex min-w-0 flex-col gap-6">
					{orders.isPending ? (
						<Skeleton className="h-64 rounded-2xl" />
					) : items.length === 0 ? (
						<EmptyState
							icon={<ClipboardList />}
							title={t('profile.noOrdersTitle')}
							text={t('profile.noOrdersText')}
							action={
								<div className="flex flex-col gap-2 sm:flex-row">
									<Button asChild>
										<Link to="/projects/new">
											<Plus />
											{t('profile.newProject')}
										</Link>
									</Button>
									{drafts > 0 && (
										<Button asChild variant="outline">
											<Link to="/projects">
												<Box />
												{t('profile.drafts', { count: drafts })}
											</Link>
										</Button>
									)}
								</div>
							}
						/>
					) : (
						<>
							<Panel title={t('profile.attention')}>
								<Attention orders={items} />
							</Panel>
							<Panel
								title={t('profile.orders')}
								action={
									<Button asChild variant="ghost" size="sm">
										<Link to="/orders">
											{t('profile.allOrders')}
											<ArrowRight />
										</Link>
									</Button>
								}
							>
								<StatusCounts orders={items} />
								<RecentOrders orders={items} />
							</Panel>
						</>
					)}

					{items.length > 0 && drafts > 0 && (
						<Link
							to="/projects"
							className="group flex items-center gap-3 rounded-2xl border bg-card p-5 transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
						>
							<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
								<Box className="size-5" />
							</span>
							<span className="flex-1 font-medium">{t('profile.drafts', { count: drafts })}</span>
							<ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
						</Link>
					)}
				</div>

				<aside className="flex min-w-0 flex-col gap-6">
					<Panel title={t('profile.personal')}>
						<p className="-mt-2 flex items-start gap-2 text-body-sm text-muted-foreground">
							<Lock className="mt-0.5 size-4 shrink-0" />
							{t('profile.personalText')}
						</p>
						{viewer ? (
							<ProfileForm
								viewer={viewer}
								submitLabel={t('common.save')}
								onSaved={() => toast.success(t('profile.saved'))}
							/>
						) : (
							<Skeleton className="h-64" />
						)}
					</Panel>

					<Link
						to="/workshop"
						className="group flex items-center gap-3 rounded-2xl border bg-card p-5 transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
					>
						<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
							<Factory className="size-5" />
						</span>
						<span className="flex min-w-0 flex-1 flex-col gap-1">
							<span className="font-medium">
								{viewer?.workshopStatus ? t('profile.workshopManage') : t('profile.workshop')}
							</span>
							{viewer?.workshopStatus ? (
								<WorkshopStatusBadge status={viewer.workshopStatus} />
							) : (
								<span className="text-body-sm text-muted-foreground">
									{t('profile.workshopApply')}
								</span>
							)}
						</span>
						<ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
					</Link>
				</aside>
			</div>
		</main>
	)
}
