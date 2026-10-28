import { Link } from '@tanstack/react-router'
import type * as React from 'react'
import { useTranslation } from 'react-i18next'
import type { OrderSchema } from '@/shared/api/generated/model'
import { Calendar, MapPin, MessageCircle, Wallet } from '@/shared/design'
import { formatDate, formatMoney } from '@/shared/lib/format'
import { OrderStatusBadge } from './order-status-badge'

type Props = {
	order: OrderSchema
	preview: React.ReactNode
	/** Extra badge, e.g. the viewer's offer status in the feed */
	aside?: React.ReactNode
	/** Bottom line, e.g. what to do next with the order */
	footer?: React.ReactNode
}

export function OrderCard({ order, preview, aside, footer }: Props) {
	const { t, i18n } = useTranslation()
	return (
		<Link
			to="/orders/$orderId"
			params={{ orderId: order.id }}
			className="group flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg hover:shadow-foreground/5 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
		>
			<div className="relative aspect-[4/3] bg-blueprint">
				<div className="absolute inset-0 p-4 pt-10 [&>*]:size-full">{preview}</div>
				<div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
					<OrderStatusBadge status={order.status} />
					{aside}
				</div>
			</div>
			<div className="flex flex-1 flex-col gap-3 border-t p-4">
				<div className="min-w-0">
					<p className="truncate text-h4 group-hover:text-primary">{order.title}</p>
					<p className="text-body-sm text-muted-foreground">
						{t(`furnitureTypes.${order.furnitureType}`)}
					</p>
				</div>
				<dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-1.5 text-body-sm text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0">
					<div className="flex min-w-0 items-center gap-1.5">
						<MapPin />
						<dt className="sr-only">{t('order.city')}</dt>
						<dd className="truncate">{order.city.name}</dd>
					</div>
					<div className="flex min-w-0 items-center gap-1.5">
						<Wallet />
						<dt className="sr-only">{t('order.budget')}</dt>
						<dd className="truncate">
							{order.budget ? formatMoney(order.budget, i18n.language) : t('order.budgetOpen')}
						</dd>
					</div>
					<div className="flex min-w-0 items-center gap-1.5">
						<Calendar />
						<dt className="sr-only">{t('order.deadline')}</dt>
						<dd className="truncate">
							{order.deadline ? formatDate(order.deadline, i18n.language) : t('order.deadlineOpen')}
						</dd>
					</div>
					<div className="flex min-w-0 items-center gap-1.5">
						<MessageCircle />
						<dt className="sr-only">{t('order.offers')}</dt>
						<dd className="truncate">{t('order.offersCount', { count: order.offersCount })}</dd>
					</div>
				</dl>
				{footer}
			</div>
		</Link>
	)
}
