import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CitySelect } from '@/entities/city'
import { DesignThumbnail } from '@/entities/furniture'
import { OfferStatusBadge } from '@/entities/offer'
import { OrderCard } from '@/entities/order'
import { isWorkshop, useViewer } from '@/entities/viewer'
import { useListOrderFeed } from '@/shared/api/generated/endpoints/orders/orders'
import { useGetMyWorkshop } from '@/shared/api/generated/endpoints/workshops/workshops'
import { FurnitureTypeEnum, type ListOrderFeedParams } from '@/shared/api/generated/model'
import { Factory, Inbox } from '@/shared/design'
import { Button } from '@/shared/ui/button'
import { CardGridSkeleton } from '@/shared/ui/card-grid-skeleton'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { Segmented } from '@/shared/ui/segmented'
import { Switch } from '@/shared/ui/switch'

/** `city`: a city id, "all", or absent for every city the workshop serves; `fresh`: hide orders with my offer */
export type MarketSearch = { city?: string; type?: FurnitureTypeEnum; fresh?: boolean }

const ALL = 'all'
const PAGE_SIZE = 24

type FeedFilters = Omit<ListOrderFeedParams, 'offset' | 'limit'>

function FeedCards({ filters, page }: { filters: FeedFilters; page: number }) {
	const { data, isPending } = useListOrderFeed({
		...filters,
		offset: page * PAGE_SIZE,
		limit: PAGE_SIZE,
	})
	if (isPending) return <CardGridSkeleton count={4} className="col-span-full" />
	return data?.items.map((order) => (
		<OrderCard
			key={order.id}
			order={order}
			preview={<DesignThumbnail document={order.document} />}
			aside={order.myOfferStatus ? <OfferStatusBadge status={order.myOfferStatus} /> : undefined}
		/>
	))
}

/** First page decides the total; further pages load on demand. Remounted when filters change. */
function FeedResults({ filters }: { filters: FeedFilters }) {
	const { t } = useTranslation()
	const [pages, setPages] = useState(1)
	const { data, isPending } = useListOrderFeed({ ...filters, offset: 0, limit: PAGE_SIZE })

	if (isPending) return <CardGridSkeleton />
	if (!data || data.total === 0)
		return (
			<EmptyState icon={<Inbox />} title={t('market.emptyTitle')} text={t('market.emptyText')} />
		)

	const shown = Math.min(pages * PAGE_SIZE, data.total)
	return (
		<div className="flex flex-col gap-6">
			<p className="text-body-sm text-muted-foreground" aria-live="polite">
				{t('market.found', { count: data.total })}
			</p>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
				{Array.from({ length: pages }, (_, page) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: a page number is its identity
					<FeedCards key={page} filters={filters} page={page} />
				))}
			</div>
			{shown < data.total && (
				<div className="flex flex-col items-center gap-2">
					<Button variant="outline" onClick={() => setPages((count) => count + 1)}>
						{t('market.more')}
					</Button>
					<p className="text-caption text-muted-foreground">
						{t('market.shown', { shown, total: data.total })}
					</p>
				</div>
			)}
		</div>
	)
}

export function MarketPage({ search }: { search: MarketSearch }) {
	const { t } = useTranslation()
	const { viewer, isPending: viewerPending } = useViewer()
	const navigate = useNavigate()
	const approved = isWorkshop(viewer)
	const mine = search.city === undefined
	const { data: workshop } = useGetMyWorkshop({ query: { enabled: approved && mine } })
	// No city in the URL means every city the workshop serves; "all" is an explicit choice
	const cityId = search.city === ALL ? undefined : search.city
	const filters: FeedFilters = {
		cityId,
		myCities: mine || undefined,
		furnitureType: search.type,
		withoutMyOffer: search.fresh || undefined,
	}

	const setSearch = (patch: MarketSearch) =>
		void navigate({
			to: '/market',
			search: (current: MarketSearch) => ({ ...current, ...patch }),
			replace: true,
		})

	if (!viewerPending && !approved) {
		return (
			<main className="page-container py-12">
				<EmptyState
					icon={<Factory />}
					title={t('market.lockedTitle')}
					text={t('market.lockedText')}
					action={
						<Button asChild>
							<Link to="/workshop">{t('market.toWorkshop')}</Link>
						</Button>
					}
				/>
			</main>
		)
	}

	return (
		<main className="page-container flex flex-col gap-8 py-8 sm:py-12">
			<PageHeader title={t('market.title')} description={t('market.description')} />
			<div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
				<CitySelect
					value={cityId}
					onChange={(city) => setSearch({ city })}
					presets={[
						{
							key: 'mine',
							label: t('city.mine'),
							active: mine,
							onSelect: () => setSearch({ city: undefined }),
						},
						{
							key: ALL,
							label: t('city.all'),
							active: search.city === ALL,
							onSelect: () => setSearch({ city: ALL }),
						},
					]}
				/>
				<Segmented
					label={t('market.type')}
					value={search.type ?? ALL}
					onChange={(value) =>
						setSearch({ type: value === ALL ? undefined : (value as FurnitureTypeEnum) })
					}
					className="md:max-w-xl"
					options={[
						{ value: ALL, label: t('market.allTypes') },
						...Object.values(FurnitureTypeEnum).map((type) => ({
							value: type,
							label: t(`furnitureTypes.${type}`),
						})),
					]}
				/>
			</div>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="inline-flex items-center gap-3">
					<Switch
						id="market-fresh"
						checked={Boolean(search.fresh)}
						onCheckedChange={(checked) => setSearch({ fresh: checked || undefined })}
					/>
					<label htmlFor="market-fresh" className="cursor-pointer text-body-sm">
						{t('market.withoutMine')}
					</label>
				</div>
			</div>
			{mine && workshop && (
				<p className="-mt-4 text-body-sm text-muted-foreground">
					{t('market.myCitiesHint', {
						cities: [workshop.city, ...workshop.serviceCities].map((city) => city.name).join(', '),
					})}
				</p>
			)}
			{approved ? (
				<FeedResults key={JSON.stringify(filters)} filters={filters} />
			) : (
				<CardGridSkeleton />
			)}
		</main>
	)
}
