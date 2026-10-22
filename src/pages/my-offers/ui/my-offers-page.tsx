import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { OfferStatusBadge } from '@/entities/offer'
import { OrderStatusBadge } from '@/entities/order'
import { useListMyOffers } from '@/shared/api/generated/endpoints/offers/offers'
import { ArrowRight, Inbox } from '@/shared/design'
import { formatDate, formatMoney } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'

export function MyOffersPage() {
	const { t, i18n } = useTranslation()
	const { data, isPending } = useListMyOffers({ limit: 100 })

	return (
		<main className="page-container flex flex-col gap-8 py-8 sm:py-12">
			<PageHeader title={t('myOffers.title')} description={t('myOffers.description')} />
			{isPending ? (
				<div className="flex flex-col gap-3">
					<Skeleton className="h-24" />
					<Skeleton className="h-24" />
				</div>
			) : data && data.items.length > 0 ? (
				<ul className="flex flex-col gap-3">
					{data.items.map((offer) => (
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
