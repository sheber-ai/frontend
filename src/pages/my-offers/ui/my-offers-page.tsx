import { keepPreviousData } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { OFFER_TABS, OfferStatusBadge, type OfferTab, offerStage } from '@/entities/offer'
import { OrderStatusBadge } from '@/entities/order'
import { useListMyOffers } from '@/shared/api/generated/endpoints/offers/offers'
import { ArrowRight, Inbox } from '@/shared/design'
import { formatDate, formatMoney } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { countPages, Pagination } from '@/shared/ui/pagination'
import { Segmented } from '@/shared/ui/segmented'
import { Skeleton } from '@/shared/ui/skeleton'

const PAGE_SIZE = 20

export function MyOffersPage({ tab, page }: { tab: OfferTab; page: number }) {
	const { t, i18n } = useTranslation()
	const navigate = useNavigate()
	const { data, isPending, isFetching, isPlaceholderData } = useListMyOffers(
		{ tab, offset: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE },
		{ query: { placeholderData: keepPreviousData } },
	)
	const visible = (data?.items ?? []).map((offer) => ({ offer, stage: offerStage(offer) }))
	const hasAny = data ? data.counts.active + data.counts.archive > 0 : false
	const pageCount = countPages(data?.total ?? 0, PAGE_SIZE)
	const go = (value: OfferTab, target: number) =>
		void navigate({
			to: '/market/offers',
			search: {
				...(value === 'active' ? {} : { tab: value }),
				...(target > 1 ? { page: target } : {}),
			},
			replace: true,
		})

	// A page can empty out (offers moved to the archive): fall back to the last existing one
	useEffect(() => {
		if (data && !isPlaceholderData && page > pageCount) go(tab, pageCount)
	})

	return (
		<main className="page-container flex flex-col gap-8 py-8 sm:py-12">
			<PageHeader title={t('myOffers.title')} description={t('myOffers.description')} />
			{isPending ? (
				<div className="flex flex-col gap-3">
					<Skeleton className="h-24" />
					<Skeleton className="h-24" />
				</div>
			) : hasAny ? (
				<div className="flex flex-col gap-4">
					<Segmented
						label={t('myOffers.tabs')}
						value={tab}
						onChange={(value) => go(value, 1)}
						className="w-full sm:max-w-sm"
						options={OFFER_TABS.map((value) => ({
							value,
							label: (
								<>
									{t(`myOffers.${value}`)}
									<span className="ml-1.5 text-muted-foreground tabular-nums">
										{data?.counts[value] ?? 0}
									</span>
								</>
							),
						}))}
					/>
					{visible.length === 0 && (
						<p className="rounded-xl border border-dashed px-6 py-10 text-center text-body-sm text-muted-foreground">
							{tab === 'active' ? t('myOffers.emptyActive') : t('myOffers.emptyArchive')}
						</p>
					)}
					<ul
						className={cn(
							'flex flex-col gap-3 transition-opacity',
							isPlaceholderData && 'opacity-60',
						)}
					>
						{visible.map(({ offer, stage }) => (
							<li key={offer.id}>
								<Link
									to="/orders/$orderId"
									params={{ orderId: offer.order.id }}
									className="group grid grid-cols-1 gap-3 rounded-xl border bg-card p-4 transition-shadow outline-none hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5"
								>
									<div className="flex min-w-0 flex-col gap-2">
										<div className="flex flex-wrap gap-1.5">
											<OfferStatusBadge status={offer.status} />
											<OrderStatusBadge status={offer.order.status} />
										</div>
										<p className="truncate text-h4 group-hover:text-primary">{offer.order.title}</p>
										<p className="text-body-sm text-muted-foreground">
											{t(`furnitureTypes.${offer.order.furnitureType}`)} · {offer.order.city.name} ·{' '}
											{formatDate(offer.updatedAt, i18n.language)}
										</p>
										<p
											className={cn(
												'text-body-sm',
												stage === 'chosen' ? 'font-medium text-primary' : 'text-muted-foreground',
											)}
										>
											{t(`myOffers.hint.${stage}`)}
										</p>
									</div>
									<div className="flex items-center justify-between gap-4 sm:justify-end">
										<div className="text-right">
											<p className="text-h4 tabular-nums">
												{formatMoney(offer.price, i18n.language)}
											</p>
											<p className="text-body-sm text-muted-foreground">
												{t('offer.daysValue', { count: offer.days })}
											</p>
										</div>
										<ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
									</div>
								</Link>
							</li>
						))}
					</ul>
					<Pagination
						page={Math.min(page, pageCount)}
						pageCount={pageCount}
						disabled={isFetching}
						onChange={(target) => {
							go(tab, target)
							window.scrollTo({ top: 0 })
						}}
					/>
				</div>
			) : (
				<EmptyState
					icon={<Inbox />}
					title={t('myOffers.emptyTitle')}
					text={t('myOffers.emptyText')}
					action={
						<Button asChild>
							<Link to="/market">{t('myOffers.toMarket')}</Link>
						</Button>
					}
				/>
			)}
		</main>
	)
}
