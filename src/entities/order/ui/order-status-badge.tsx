import { useTranslation } from 'react-i18next'
import type { OrderStatusEnum } from '@/shared/api/generated/model'
import { Badge } from '@/shared/ui/badge'

const VARIANTS = {
	published: 'info',
	assigned: 'warning',
	in_progress: 'warning',
	completed: 'success',
	cancelled: 'secondary',
} as const satisfies Record<OrderStatusEnum, string>

export function OrderStatusBadge({ status }: { status: OrderStatusEnum }) {
	const { t } = useTranslation()
	return <Badge variant={VARIANTS[status]}>{t(`orderStatus.${status}`)}</Badge>
}
