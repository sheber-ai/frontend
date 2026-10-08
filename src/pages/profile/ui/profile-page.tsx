import { useTranslation } from 'react-i18next'
import { getViewerName, RoleBadge, useViewer } from '@/entities/viewer'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export function ProfilePage() {
	const { t } = useTranslation()
	const { viewer } = useViewer()

	return (
		<main className="page-container py-10">
			<Card className="max-w-lg">
				<CardHeader>
					<CardTitle className="text-h3">{t('profile.title')}</CardTitle>
				</CardHeader>
				{viewer && (
					<CardContent>
						<dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
							<dt className="text-muted-foreground">{t('profile.name')}</dt>
							<dd>{getViewerName(viewer)}</dd>
							<dt className="text-muted-foreground">{t('profile.email')}</dt>
							<dd>{viewer.email}</dd>
							<dt className="text-muted-foreground">{t('profile.roles')}</dt>
							<dd className="flex flex-wrap gap-1">
								{viewer.roles.map((role) => (
									<RoleBadge key={role} role={role} />
								))}
							</dd>
						</dl>
					</CardContent>
				)}
			</Card>
		</main>
	)
}
