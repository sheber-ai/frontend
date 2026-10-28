import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { DesignCard } from '@/entities/furniture'
import { OrderStatusBadge } from '@/entities/order'
import { DeleteDesignButton } from '@/features/delete-design'
import { useListDesigns } from '@/shared/api/generated/endpoints/designs/designs'
import { Box, Plus } from '@/shared/design'
import { Button } from '@/shared/ui/button'
import { CardGridSkeleton } from '@/shared/ui/card-grid-skeleton'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'

export function ProjectsPage() {
	const { t } = useTranslation()
	const { data, isPending } = useListDesigns({ limit: 100 })

	const create = (
		<Button size="lg" asChild>
			<Link to="/projects/new">
				<Plus />
				{t('projects.new')}
			</Link>
		</Button>
	)

	return (
		<main className="page-container flex flex-col gap-8 py-8 sm:py-12">
			<PageHeader
				title={t('projects.title')}
				description={t('projects.description')}
				actions={create}
			/>
			{isPending ? (
				<CardGridSkeleton />
			) : data && data.items.length > 0 ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
					{data.items.map((design) => (
						<DesignCard
							key={design.id}
							design={design}
							actions={<DeleteDesignButton designId={design.id} title={design.title} />}
							badge={
								design.activeOrder ? (
									<OrderStatusBadge status={design.activeOrder.status} />
								) : undefined
							}
						/>
					))}
				</div>
			) : (
				<EmptyState
					icon={<Box />}
					title={t('projects.emptyTitle')}
					text={t('projects.emptyText')}
					action={create}
				/>
			)}
		</main>
	)
}
