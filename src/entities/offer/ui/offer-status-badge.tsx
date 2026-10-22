import { useTranslation } from 'react-i18next'
import type { OfferStatusEnum } from '@/shared/api/generated/model'
import { Badge } from '@/shared/ui/badge'

const VARIANTS = {
	pending: 'info',
	accepted: 'success',
	rejected: 'secondary',
	withdrawn: 'outline',
} as const satisfies Record<OfferStatusEnum, string>

export function OfferStatusBadge({ status }: { status: OfferStatusEnum }) {
	const { t } = useTranslation()
	return <Badge variant={VARIANTS[status]}>{t(`offerStatus.${status}`)}</Badge>
}
