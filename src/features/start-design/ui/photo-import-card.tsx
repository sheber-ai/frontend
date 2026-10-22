import { useTranslation } from 'react-i18next'
import { Camera, WandSparkles } from '@/shared/design'
import { Badge } from '@/shared/ui/badge'

/** Placeholder for AI photo recognition. */
export function PhotoImportCard() {
	const { t } = useTranslation()
	return (
		<div className="flex h-full flex-col gap-5 rounded-xl border border-dashed bg-muted/40 p-5 sm:p-6">
			<div className="flex items-start justify-between gap-3">
				<span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
					<Camera className="size-5" />
				</span>
				<Badge variant="outline" className="gap-1">
					<WandSparkles />
					{t('start.photo.soon')}
				</Badge>
			</div>
			<div className="flex flex-col gap-1">
				<h3 className="text-h4">{t('start.photo.title')}</h3>
				<p className="text-body-sm text-muted-foreground">{t('start.photo.text')}</p>
			</div>
			<ol className="mt-auto flex flex-col gap-2 text-body-sm text-muted-foreground">
				{(['one', 'two', 'three'] as const).map((step, index) => (
					<li key={step} className="flex gap-3">
						<span className="flex size-6 shrink-0 items-center justify-center rounded-full border text-caption tabular-nums">
							{index + 1}
						</span>
						{t(`start.photo.steps.${step}`)}
					</li>
				))}
			</ol>
		</div>
	)
}
