import { useTranslation } from 'react-i18next'
import type { UserRoleEnum } from '@/shared/api/generated/model'
import { Badge } from '@/shared/ui/badge'

type Props = {
	role: UserRoleEnum
}

export function RoleBadge({ role }: Props) {
	const { t } = useTranslation()
	return <Badge variant="secondary">{t(`roles.${role}`)}</Badge>
}
