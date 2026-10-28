import { keepPreviousData } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DesignThumbnail } from '@/entities/furniture'
import {
	CLIENT_ACTION_STEPS,
	clientNextStep,
	ORDER_GROUPS,
	OrderCard,
	type OrderGroup,
} from '@/entities/order'
import { useListMyOrders } from '@/shared/api/generated/endpoints/orders/orders'
import type { OrderSchema } from '@/shared/api/generated/model'
import { ArrowRight, ClipboardList, Plus } from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { CardGridSkeleton } from '@/shared/ui/card-grid-skeleton'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { countPages, Pagination } from '@/shared/ui/pagination'
import { Segmented } from '@/shared/ui/segmented'

function NextStep({ order }: { order: OrderSchema }) {
	const { t } = useTranslation()
	const step = clientNextStep(order)
	if (!step) return null
	const yours = CLIENT_ACTION_STEPS.includes(step)
	return (
		<p
			className={cn(
				'-mx-4 -mb-4 flex items-center gap-2 border-t px-4 py-2.5 text-body-sm',
				yours ? 'bg-primary/5 font-medium text-primary' : 'text-muted-foreground',
			)}
		>
			<span className="flex-1">{t(`orderNextStep.${step}`, { count: order.offersCount })}</span>
			{yours && <ArrowRight className="size-4 shrink-0" />}
		</p>
	)
}

const PAGE_SIZE = 12

export function OrdersPage({ tab, page }: { tab: OrderGroup; page: number }) {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { data, isPending, isFetching, isPlaceholderData } = useListMyOrders(
		{ group: tab, offset: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE },
		{ query: { placeholderData: keepPreviousData } },
	)
	const visible = data?.items ?? []
	const hasAny = data ? Object.values(data.counts).some((value) => value > 0) : false
	const pageCount = countPages(data?.total ?? 0, PAGE_SIZE)
	const go = (group: OrderGroup, target: number) =>
		void navigate({
			to: '/orders',
			search: {
				...(group === 'active' ? {} : { tab: group }),
				...(target > 1 ? { page: target } : {}),
			},
			replace: true,
		})

	// A page can empty out (an order moved to another tab): fall back to the last existing one
	useEffect(() => {
		if (data && !isPlaceholderData && page > pageCount) go(tab, pageCount)
	})

	return (
		<main className="page-container flex flex-col gap-8 py-8 sm:py-12">
			<PageHeader
				title={t('orders.title')}
				description={t('orders.description')}
				actions={
					hasAny && (
						<Button asChild>
							<Link to="/projects/new">
								<Plus />
								{t('orders.newProject')}
							</Link>
						</Button>
					)
				}
			/>
			{isPending ? (
				<CardGridSkeleton />
			) : !hasAny ? (
				<EmptyState
					icon={<ClipboardList />}
					title={t('orders.emptyTitle')}
					text={t('orders.emptyText')}
					action={
						<Button asChild>
							<Link to="/projects">
								<Plus />
								{t('orders.toProjects')}
							</Link>
						</Button>
					}
				/>
			) : (
				<>
					<Segmented
						label={t('orders.tabs')}
						value={tab}
						onChange={(value) => go(value, 1)}
						className="w-full sm:max-w-lg"
						options={ORDER_GROUPS.map((group) => ({
							value: group,
							label: (
								<>
									{t(`orders.${group}`)}
									<span className="ml-1.5 text-muted-foreground tabular-nums">
										{data?.counts[group] ?? 0}
									</span>
								</>
							),
						}))}
					/>
					{visible.length > 0 ? (
						<div
							className={cn(
								'grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
								isPlaceholderData && 'opacity-60',
							)}
						>
							{visible.map((order) => (
								<OrderCard
									key={order.id}
									order={order}
									preview={<DesignThumbnail document={order.document} />}
									footer={<NextStep order={order} />}
								/>
							))}
						</div>
					) : (
						<p className="rounded-xl border border-dashed px-6 py-10 text-center text-body-sm text-muted-foreground">
							{t('orders.emptyTab')}
						</p>
					)}
					<Pagination
						page={Math.min(page, pageCount)}
						pageCount={pageCount}
						disabled={isFetching}
						onChange={(target) => {
							go(tab, target)
							window.scrollTo({ top: 0 })
						}}
					/>
				</>
			)}
		</main>
	)
}
