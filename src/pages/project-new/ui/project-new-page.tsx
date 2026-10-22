import { useTranslation } from 'react-i18next'
import {
	LinkImportCard,
	PhotoImportCard,
	TemplateGallery,
	useStartDesign,
} from '@/features/start-design'
import { PageHeader } from '@/shared/ui/page-header'

export function ProjectNewPage() {
	const { t } = useTranslation()
	const { start, isPending } = useStartDesign()

	return (
		<main className="page-container flex flex-col gap-12 py-8 sm:py-12">
			<PageHeader
				eyebrow={t('start.eyebrow')}
				title={t('start.title')}
				description={t('start.description')}
			/>

			<section className="flex flex-col gap-5">
				<div className="flex flex-col gap-1">
					<h2 className="text-h3">{t('start.templatesTitle')}</h2>
					<p className="text-body-sm text-muted-foreground">{t('start.templatesText')}</p>
				</div>
				<TemplateGallery disabled={isPending} onPick={(template) => void start(template)} />
			</section>

			<section className="flex flex-col gap-5">
				<div className="flex flex-col gap-1">
					<h2 className="text-h3">{t('start.importTitle')}</h2>
					<p className="text-body-sm text-muted-foreground">{t('start.importText')}</p>
				</div>
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<LinkImportCard />
					<PhotoImportCard />
				</div>
			</section>
		</main>
	)
}
