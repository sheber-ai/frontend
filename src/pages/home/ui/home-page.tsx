import { useTranslation } from 'react-i18next'
import { useGetHealth } from '@/shared/api/generated/endpoints/system/system'
import { Badge } from '@/shared/ui/badge'

export function HomePage() {
	const { t } = useTranslation()

	return (
		<main className="mx-auto flex min-h-svh max-w-3xl flex-col items-start justify-center gap-4 px-6">
			<h1 className="text-4xl font-semibold tracking-tight">{t('app.name')}</h1>
			<p className="text-lg text-muted-foreground">{t('app.tagline')}</p>
			<ApiStatus />
		</main>
	)
}

function ApiStatus() {
	const { t } = useTranslation()
	const { data, isPending, isError } = useGetHealth()

	if (isPending) return <Badge variant="secondary">{t('apiStatus.checking')}</Badge>
	if (isError) return <Badge variant="destructive">{t('apiStatus.error')}</Badge>
	return (
		<Badge variant="outline">
			{t('apiStatus.ok')} · {data.env}
		</Badge>
	)
}
