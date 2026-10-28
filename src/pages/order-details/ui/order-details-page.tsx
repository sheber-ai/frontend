import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	DesignSpecsList,
	DesignViewport,
	isDesignDocument,
	type ViewMode,
} from '@/entities/furniture'
import {
	OFFER_SORTS,
	type OfferSort,
	OfferStatusBadge,
	OfferTerms,
	offerHighlights,
	sortOffers,
} from '@/entities/offer'
import { clientNextStep, OrderStatusBadge, OrderTimeline, workshopNextStep } from '@/entities/order'
import { ReviewItem } from '@/entities/review'
import { isWorkshop, useViewer } from '@/entities/viewer'
import { WorkshopSummary } from '@/entities/workshop'
import { AcceptOfferButton } from '@/features/accept-offer'
import { AttachmentGallery } from '@/features/manage-attachments'
import { OrderActions } from '@/features/manage-order'
import { OrderChatButton } from '@/features/order-chat'
import { ReplyReviewForm } from '@/features/reply-review'
import { ReviewWorkshopPanel } from '@/features/review-workshop'
import { OfferForm, WithdrawOfferButton } from '@/features/send-offer'
import { useListAttachments } from '@/shared/api/generated/endpoints/attachments/attachments'
import { useListOrderThreads } from '@/shared/api/generated/endpoints/messages/messages'
import { useGetOrder, useListOrderOffers } from '@/shared/api/generated/endpoints/orders/orders'
import { useGetOrderReview } from '@/shared/api/generated/endpoints/reviews/reviews'
import type { OrderDetailSchema, ThreadSchema } from '@/shared/api/generated/model'
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
import { formatDate, formatMoney } from '@/shared/lib/format'
import { formatPhone } from '@/shared/lib/phone'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { Segmented } from '@/shared/ui/segmented'
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

const THREADS_POLL_MS = 30_000

/** What the client wrote about the work, shown to the workshop that did it, with its public answer. */
function ReceivedReview({ orderId }: { orderId: string }) {
	const { t } = useTranslation()
	const { data: review } = useGetOrderReview(orderId)
	if (!review) return null
	return (
		<Panel title={t('reviews.title')}>
			<div className="flex flex-col gap-3">
				<ReviewItem review={review} />
				<ReplyReviewForm review={review} />
			</div>
		</Panel>
	)
}

const SORT_LABELS = {
	price: 'offer.sortPrice',
	days: 'offer.sortDays',
	newest: 'offer.sortNewest',
} as const satisfies Record<OfferSort, string>

function useThreads(orderId: string, enabled: boolean) {
	const { data } = useListOrderThreads(orderId, {
		query: { enabled, refetchInterval: THREADS_POLL_MS },
	})
	return useMemo(
		() => new Map((data?.items ?? []).map((thread) => [thread.workshop.id, thread])),
		[data],
	)
}

function ChatWithWorkshop({
	orderId,
	thread,
}: {
	orderId: string
	thread: ThreadSchema | undefined
}) {
	const { t } = useTranslation()
	if (!thread || (!thread.canWrite && !thread.lastMessage)) return null
	return (
		<OrderChatButton
			orderId={orderId}
			workshopId={thread.workshop.id}
			title={t('chat.withWorkshop', { name: thread.workshop.name })}
			unread={thread.unreadCount}
		/>
	)
}

function WorkshopQuestions({
	order,
	threads,
}: {
	order: OrderDetailSchema
	threads: Map<string, ThreadSchema>
}) {
	const { t } = useTranslation()
	const questions = [...threads.values()].filter((thread) => thread.offerStatus === null)
	if (questions.length === 0) return null
	return (
		<Panel title={t('chat.questions')}>
			<p className="-mt-2 text-body-sm text-muted-foreground">{t('chat.questionsHint')}</p>
			<ul className="flex flex-col gap-3">
				{questions.map((thread) => (
					<li
						key={thread.workshop.id}
						className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
					>
						<WorkshopSummary workshop={thread.workshop} />
						<ChatWithWorkshop orderId={order.id} thread={thread} />
					</li>
				))}
			</ul>
		</Panel>
	)
}

function OwnerOffers({
	order,
	threads,
}: {
	order: OrderDetailSchema
	threads: Map<string, ThreadSchema>
}) {
	const { t, i18n } = useTranslation()
	const { data, isPending } = useListOrderOffers(order.id)
	const [sort, setSort] = useState<OfferSort>('price')

	if (isPending) return <Skeleton className="h-32" />
	if (!data || data.items.length === 0) {
		return (
			<p className="rounded-lg bg-muted px-4 py-6 text-center text-body-sm text-muted-foreground">
				{order.status === 'published' ? t('orderPage.noOffersYet') : t('orderPage.noOffers')}
			</p>
		)
	}
	const { cheapest, fastest } = offerHighlights(data.items)
	const offers = sortOffers(data.items, sort)
	return (
		<div className="flex flex-col gap-3">
			{data.items.length > 1 && (
				<Segmented
					label={t('offer.sort')}
					value={sort}
					onChange={setSort}
					options={OFFER_SORTS.map((value) => ({ value, label: t(SORT_LABELS[value]) }))}
				/>
			)}
			<ul className="flex flex-col gap-3">
				{offers.map((offer) => (
					<li key={offer.id} className="flex flex-col gap-3 rounded-lg border p-4">
						<div className="flex items-start justify-between gap-3">
							<WorkshopSummary workshop={offer.workshop} />
							<OfferStatusBadge status={offer.status} />
						</div>
						<div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
							<span className="text-h4 tabular-nums">
								{formatMoney(offer.price, i18n.language)}
							</span>
							<span className="text-body-sm text-muted-foreground">
								{t('offer.daysValue', { count: offer.days })}
							</span>
						</div>
						{(cheapest.has(offer.id) || fastest.has(offer.id)) && (
							<div className="flex flex-wrap gap-1.5">
								{cheapest.has(offer.id) && <Badge variant="success">{t('offer.cheapest')}</Badge>}
								{fastest.has(offer.id) && <Badge variant="info">{t('offer.fastest')}</Badge>}
							</div>
						)}
						<OfferTerms offer={offer} />
						{offer.comment && <p className="text-body-sm whitespace-pre-line">{offer.comment}</p>}
						<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
							{order.status === 'published' && offer.status === 'pending' && (
								<AcceptOfferButton offerId={offer.id} workshopName={offer.workshop.name} />
							)}
							<ChatWithWorkshop orderId={order.id} thread={threads.get(offer.workshop.id)} />
						</div>
					</li>
				))}
			</ul>
		</div>
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
			<OfferTerms offer={offer} />
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

function NextStepHint({
	order,
	workshopView,
	isAssignedWorkshop,
}: {
	order: OrderDetailSchema
	workshopView: boolean
	isAssignedWorkshop: boolean
}) {
	const { t } = useTranslation()
	let text: string | null = null
	if (order.isOwner) {
		const step = clientNextStep(order)
		if (step) text = t(`orderNextStep.${step}`, { count: order.offersCount })
	} else if (workshopView) {
		const live = order.myOffer?.status === 'pending' || order.myOffer?.status === 'accepted'
		const step = workshopNextStep(order.status, isAssignedWorkshop, live)
		if (step) text = t(`workshopNextStep.${step}`)
	}
	if (!text) return null
	return (
		<div className="flex flex-col gap-1 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
			<p className="text-caption tracking-wider text-primary uppercase">
				{t('orderPage.yourStep')}
			</p>
			<p className="text-body-sm">{text}</p>
		</div>
	)
}

const ORDER_FILE_PURPOSES = ['reference', 'room', 'document'] as const

function OrderFiles({ order }: { order: OrderDetailSchema }) {
	const { t } = useTranslation()
	const { data } = useListAttachments({ orderId: order.id })
	const editable = order.isOwner && order.status !== 'completed' && order.status !== 'cancelled'
	const empty = data !== undefined && data.items.length === 0
	return (
		<Panel title={t('orderPage.files')}>
			{editable ? (
				<p className="-mt-2 text-body-sm text-muted-foreground">{t('orderPage.filesHintOwner')}</p>
			) : (
				empty && (
					<p className="-mt-2 text-body-sm text-muted-foreground">{t('orderPage.filesEmpty')}</p>
				)
			)}
			{ORDER_FILE_PURPOSES.map((purpose) => (
				<AttachmentGallery
					key={purpose}
					purpose={purpose}
					target={{ orderId: order.id }}
					editable={editable}
				/>
			))}
		</Panel>
	)
}

function ClientChat({
	order,
	threads,
}: {
	order: OrderDetailSchema
	threads: Map<string, ThreadSchema>
}) {
	const { t } = useTranslation()
	const thread = [...threads.values()][0]
	if (!thread || (!thread.canWrite && !thread.lastMessage)) return null
	const started = Boolean(thread.lastMessage)
	return (
		<Panel title={t('chat.withClient')}>
			{!started && <p className="-mt-2 text-body-sm text-muted-foreground">{t('chat.askHint')}</p>}
			<OrderChatButton
				orderId={order.id}
				title={t('chat.withClient')}
				description={order.title}
				unread={thread.unreadCount}
				label={started ? t('chat.title') : t('chat.askClient')}
			/>
		</Panel>
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
	const workshopView = Boolean(order && !order.isOwner && isWorkshop(viewer))
	const threads = useThreads(orderId, Boolean(order && (order.isOwner || workshopView)))

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
								className="h-[50svh] min-h-72 lg:h-[68svh]"
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
					<OrderFiles order={order} />
					{document && (
						<Panel title={t('specs.title')}>
							<DesignSpecsList document={document} />
						</Panel>
					)}
				</div>

				<aside className="flex min-w-0 flex-col gap-6 max-lg:order-first">
					<Panel title={t('orderPage.progress')}>
						<NextStepHint
							order={order}
							workshopView={workshopView}
							isAssignedWorkshop={isAssignedWorkshop}
						/>
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

					{order.isOwner && order.workshop && order.status === 'completed' && (
						<Panel title={t('reviews.title')}>
							<ReviewWorkshopPanel orderId={order.id} workshopName={order.workshop.name} />
						</Panel>
					)}

					{isAssignedWorkshop && order.status === 'completed' && (
						<ReceivedReview orderId={order.id} />
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
							<OwnerOffers order={order} threads={threads} />
						</Panel>
					)}

					{order.isOwner && <WorkshopQuestions order={order} threads={threads} />}

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

					{workshopView && <ClientChat order={order} threads={threads} />}
				</aside>
			</div>
		</main>
	)
}
