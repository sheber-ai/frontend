import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { DesignThumbnail } from '@/entities/furniture'
import { OrderCard } from '@/entities/order'
import { useListMyOrders } from '@/shared/api/generated/endpoints/orders/orders'
import { ClipboardList, Plus } from '@/shared/design'
import { Button } from '@/shared/ui/button'
import { CardGridSkeleton } from '@/shared/ui/card-grid-skeleton'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'

export function OrdersPage() {
	const { t } = useTranslation()
	const { data, isPending } = useListMyOrders({ limit: 100 })

	return (
		<main className="page-container flex flex-col gap-8 py-8 sm:py-12">
			<PageHeader title={t('orders.title')} description={t('orders.description')} />
			{isPending ? (
				<CardGridSkeleton />
			) : data && data.items.length > 0 ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
					{data.items.map((order) => (
						<OrderCard
							key={order.id}
							order={order}
							preview={<DesignThumbnail document={order.document} />}
						/>
					))}
				</div>
			) : (
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
			)}
		</main>
	)
}
