import { useTranslation } from 'react-i18next'
import type { WorkshopStatusEnum } from '@/shared/api/generated/model'
import { Badge } from '@/shared/ui/badge'

const VARIANTS = {
	pending: 'warning',
	approved: 'success',
	rejected: 'destructive',
} as const satisfies Record<WorkshopStatusEnum, string>

export function WorkshopStatusBadge({ status }: { status: WorkshopStatusEnum }) {
	const { t } = useTranslation()
	return <Badge variant={VARIANTS[status]}>{t(`workshopStatus.${status}`)}</Badge>
}
