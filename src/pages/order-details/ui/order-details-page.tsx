import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	DesignSpecsList,
	DesignViewport,
	isDesignDocument,
	type ViewMode,
} from '@/entities/furniture'
import { OfferStatusBadge } from '@/entities/offer'
import { OrderStatusBadge, OrderTimeline } from '@/entities/order'
import { isWorkshop, useViewer } from '@/entities/viewer'
import { WorkshopSummary } from '@/entities/workshop'
import { AcceptOfferButton } from '@/features/accept-offer'
import { OrderActions } from '@/features/manage-order'
import { OfferForm, WithdrawOfferButton } from '@/features/send-offer'
import { useGetOrder, useListOrderOffers } from '@/shared/api/generated/endpoints/orders/orders'
import type { OrderDetailSchema } from '@/shared/api/generated/model'
import {
	ArrowLeft,
	Calendar,
	ExternalLink,
	Link as LinkIcon,
	Mail,
	MapPin,
	MessageCircle,
	Pencil,
	Phone,
	TriangleAlert,
	Wallet,
} from '@/shared/design'
import { formatDate, formatMoney, formatPhone } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { Skeleton } from '@/shared/ui/skeleton'

function Panel({
	title,
	children,
	aside,
}: {
	title: React.ReactNode
	children: React.ReactNode
	aside?: React.ReactNode
}) {
	return (
		<section className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-h4">{title}</h2>
				{aside}
			</div>
			{children}
		</section>
	)
}

function OwnerOffers({ order }: { order: OrderDetailSchema }) {
	const { t, i18n } = useTranslation()
	const { data, isPending } = useListOrderOffers(order.id)

	if (isPending) return <Skeleton className="h-32" />
	if (!data || data.items.length === 0) {
		return (
			<p className="rounded-lg bg-muted px-4 py-6 text-center text-body-sm text-muted-foreground">
				{order.status === 'published' ? t('orderPage.noOffersYet') : t('orderPage.noOffers')}
			</p>
		)
	}
	return (
		<ul className="flex flex-col gap-3">
			{data.items.map((offer) => (
				<li key={offer.id} className="flex flex-col gap-3 rounded-lg border p-4">
					<div className="flex items-start justify-between gap-3">
						<WorkshopSummary workshop={offer.workshop} />
						<OfferStatusBadge status={offer.status} />
					</div>
					<div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
						<span className="text-h4 tabular-nums">{formatMoney(offer.price, i18n.language)}</span>
						<span className="text-body-sm text-muted-foreground">
							{t('offer.daysValue', { count: offer.days })}
						</span>
					</div>
					{offer.comment && <p className="text-body-sm whitespace-pre-line">{offer.comment}</p>}
					{order.status === 'published' && offer.status === 'pending' && (
						<AcceptOfferButton offerId={offer.id} workshopName={offer.workshop.name} />
					)}
				</li>
			))}
		</ul>
	)
}

function WorkshopOffer({ order }: { order: OrderDetailSchema }) {
	const { t, i18n } = useTranslation()
	const [editing, setEditing] = useState(false)
	const offer = order.myOffer
	const active = offer && offer.status !== 'withdrawn'

	if (!active || editing) {
		if (order.status !== 'published') {
			return <p className="text-body-sm text-muted-foreground">{t('orderPage.closed')}</p>
		}
		return (
			<OfferForm
				orderId={order.id}
				offer={editing && offer ? offer : undefined}
				onDone={() => setEditing(false)}
			/>
		)
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
				<span className="text-h3 tabular-nums">{formatMoney(offer.price, i18n.language)}</span>
				<span className="text-body-sm text-muted-foreground">
					{t('offer.daysValue', { count: offer.days })}
				</span>
			</div>
			{offer.comment && <p className="text-body-sm whitespace-pre-line">{offer.comment}</p>}
			{offer.status === 'pending' && order.status === 'published' && (
				<div className="flex flex-wrap gap-2">
					<Button variant="outline" onClick={() => setEditing(true)}>
						<Pencil />
						{t('offer.edit')}
					</Button>
					<WithdrawOfferButton offerId={offer.id} />
				</div>
			)}
		</div>
	)
}

export function OrderDetailsPage({ orderId }: { orderId: string }) {
	const { t, i18n } = useTranslation()
	const { viewer } = useViewer()
	const { data: order, isPending, isError } = useGetOrder(orderId)
	const [mode, setMode] = useState<ViewMode>('3d')
	const [open, setOpen] = useState(false)
	const [dimensions, setDimensions] = useState(true)
	const document = useMemo(
		() => (order && isDesignDocument(order.document) ? order.document : null),
		[order],
	)

	if (isPending) {
		return (
			<main className="page-container flex flex-col gap-6 py-8">
				<Skeleton className="h-10 w-1/2" />
				<Skeleton className="h-[60svh]" />
			</main>
		)
	}

	if (isError || !order) {
		return (
			<main className="page-container py-12">
				<EmptyState
					icon={<TriangleAlert />}
					title={t('orderPage.notFound')}
					text={t('orderPage.notFoundText')}
				/>
			</main>
		)
	}

	const workshopView = !order.isOwner && isWorkshop(viewer)
	const isAssignedWorkshop = workshopView && order.myOffer?.status === 'accepted'
	const back = order.isOwner ? '/orders' : '/market'

	return (
		<main className="page-container flex flex-col gap-6 py-6 sm:py-10">
			<div className="flex flex-col gap-3">
				<Link
					to={back}
					className="inline-flex w-fit items-center gap-1.5 text-body-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="size-4" />
					{order.isOwner ? t('orderPage.backToOrders') : t('orderPage.backToMarket')}
				</Link>
				<div className="flex flex-wrap items-center gap-2">
					<OrderStatusBadge status={order.status} />
					{order.myOffer && <OfferStatusBadge status={order.myOffer.status} />}
				</div>
				<h1 className="text-h2 text-balance sm:text-h1">{order.title}</h1>
				<ul className="flex flex-wrap gap-x-5 gap-y-2 text-body-sm text-muted-foreground [&_svg]:size-4">
					<li>{t(`furnitureTypes.${order.furnitureType}`)}</li>
					<li className="inline-flex items-center gap-1.5">
						<MapPin />
						{order.city.name}
					</li>
					<li className="inline-flex items-center gap-1.5">
						<Wallet />
						{order.budget ? formatMoney(order.budget, i18n.language) : t('order.budgetOpen')}
					</li>
					<li className="inline-flex items-center gap-1.5">
						<Calendar />
						{order.deadline
							? t('orderPage.until', { date: formatDate(order.deadline, i18n.language) })
							: t('order.deadlineOpen')}
					</li>
					<li className="inline-flex items-center gap-1.5">
						<MessageCircle />
						{t('order.offersCount', { count: order.offersCount })}
					</li>
				</ul>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
				<div className="flex min-w-0 flex-col gap-6">
					<div className="overflow-hidden rounded-xl border">
						{document ? (
							<DesignViewport
								document={document}
								mode={mode}
								onModeChange={setMode}
								open={open}
								onOpenChange={setOpen}
								dimensions={dimensions}
								onDimensionsChange={setDimensions}
								className="h-[60svh] min-h-80 lg:h-[68svh]"
							/>
						) : (
							<div className="flex h-80 items-center justify-center text-muted-foreground">
								{t('orderPage.noModel')}
							</div>
						)}
					</div>

					{order.description && (
						<Panel title={t('orderPage.notes')}>
							<p className="text-body whitespace-pre-line">{order.description}</p>
						</Panel>
					)}
					{order.sourceUrl && (
						<Panel title={t('orderPage.reference')}>
							<a
								href={order.sourceUrl}
								target="_blank"
								rel="noreferrer"
								className="flex min-w-0 items-center gap-2 text-body-sm text-primary hover:underline"
							>
								<LinkIcon className="size-4 shrink-0" />
								<span className="truncate">{order.sourceUrl}</span>
								<ExternalLink className="size-4 shrink-0" />
							</a>
						</Panel>
					)}
					{document && (
						<Panel title={t('specs.title')}>
							<DesignSpecsList document={document} />
						</Panel>
					)}
				</div>

				<aside className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
					<Panel title={t('orderPage.progress')}>
						<OrderTimeline status={order.status} />
						<OrderActions order={order} isAssignedWorkshop={isAssignedWorkshop} />
					</Panel>

					{order.contact && (
						<Panel
							title={order.isOwner ? t('orderPage.workshopContact') : t('orderPage.clientContact')}
						>
							<div className="flex flex-col gap-2 text-body-sm">
								<p className="text-h4">{order.contact.name}</p>
								{order.contact.phone && (
									<a
										href={`tel:${order.contact.phone}`}
										className="inline-flex items-center gap-2 text-primary hover:underline"
									>
										<Phone className="size-4" />
										{formatPhone(order.contact.phone)}
									</a>
								)}
								{order.contact.email && (
									<a
										href={`mailto:${order.contact.email}`}
										className="inline-flex items-center gap-2 text-primary hover:underline"
									>
										<Mail className="size-4" />
										{order.contact.email}
									</a>
								)}
							</div>
						</Panel>
					)}

					{order.isOwner && order.workshop && (
						<Panel title={t('orderPage.workshop')}>
							<WorkshopSummary workshop={order.workshop} />
						</Panel>
					)}

					{order.isOwner && (
						<Panel
							title={t('orderPage.offers')}
							aside={
								<span className="text-body-sm text-muted-foreground tabular-nums">
									{order.offersCount}
								</span>
							}
						>
							<OwnerOffers order={order} />
						</Panel>
					)}

					{workshopView && (
						<Panel
							title={
								order.myOffer && order.myOffer.status !== 'withdrawn'
									? t('orderPage.myOffer')
									: t('orderPage.sendOffer')
							}
						>
							<WorkshopOffer order={order} />
						</Panel>
					)}
				</aside>
			</div>
		</main>
	)
}
