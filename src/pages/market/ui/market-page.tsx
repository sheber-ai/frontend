import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { CitySelect } from '@/entities/city'
import { DesignThumbnail } from '@/entities/furniture'
import { OfferStatusBadge } from '@/entities/offer'
import { OrderCard } from '@/entities/order'
import { isWorkshop, useViewer } from '@/entities/viewer'
import { useListOrderFeed } from '@/shared/api/generated/endpoints/orders/orders'
import { FurnitureTypeEnum } from '@/shared/api/generated/model'
import { Factory, Inbox } from '@/shared/design'
import { Button } from '@/shared/ui/button'
import { CardGridSkeleton } from '@/shared/ui/card-grid-skeleton'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { Segmented } from '@/shared/ui/segmented'

export type MarketSearch = { city?: string; type?: FurnitureTypeEnum }

const ALL = 'all'

export function MarketPage({ search }: { search: MarketSearch }) {
	const { t } = useTranslation()
	const { viewer, isPending: viewerPending } = useViewer()
	const navigate = useNavigate()
	const approved = isWorkshop(viewer)
	const { data, isPending } = useListOrderFeed(
		{ cityId: search.city, furnitureType: search.type, limit: 100 },
		{ query: { enabled: approved } },
	)

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
					value={search.city}
					allowAll
					onChange={(city) => setSearch({ city })}
					onClear={() => setSearch({ city: undefined })}
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
			{isPending ? (
				<CardGridSkeleton />
			) : data && data.items.length > 0 ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
					{data.items.map((order) => (
						<OrderCard
							key={order.id}
							order={order}
							preview={<DesignThumbnail document={order.document} />}
							aside={
								order.myOfferStatus ? <OfferStatusBadge status={order.myOfferStatus} /> : undefined
							}
						/>
					))}
				</div>
			) : (
				<EmptyState icon={<Inbox />} title={t('market.emptyTitle')} text={t('market.emptyText')} />
			)}
		</main>
	)
}
