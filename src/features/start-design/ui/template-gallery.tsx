import { useTranslation } from 'react-i18next'
import { DESIGN_TEMPLATES, DesignDrawing, type DesignTemplate } from '@/entities/furniture'
import type { FurnitureTypeEnum } from '@/shared/api/generated/model'
import { ArrowRight } from '@/shared/design'
import { formatNumber } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'

type Props = {
	onPick: (template: DesignTemplate) => void
	disabled?: boolean
	/** Limit to one furniture type */
	type?: FurnitureTypeEnum
}

export function TemplateGallery({ onPick, disabled, type }: Props) {
	const { t, i18n } = useTranslation()
	const templates = DESIGN_TEMPLATES.filter((template) => !type || template.furnitureType === type)

	return (
		<ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
			{templates.map((template) => {
				const doc = template.build()
				return (
					<li key={template.id} className="min-w-0">
						<button
							type="button"
							disabled={disabled}
							onClick={() => onPick(template)}
							className={cn(
								'group flex h-full w-full flex-col overflow-hidden rounded-xl border bg-card text-left transition-shadow outline-none hover:shadow-lg hover:shadow-foreground/5 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60',
							)}
						>
							<div className="relative aspect-[4/3] bg-blueprint">
								<DesignDrawing
									document={doc}
									variant="facade"
									className="absolute inset-0 p-6 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
								/>
							</div>
							<div className="flex flex-1 flex-col gap-1 border-t p-4">
								<div className="flex items-center justify-between gap-2">
									<span className="text-caption tracking-wider text-muted-foreground uppercase">
										{t(`furnitureTypes.${template.furnitureType}`)}
									</span>
									<ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
								</div>
								<span className="text-h4">{t(`templates.${template.id}.title`)}</span>
								<span className="text-body-sm text-muted-foreground">
									{t(`templates.${template.id}.description`)}
								</span>
								<span className="mt-2 text-caption text-muted-foreground tabular-nums">
									{formatNumber(doc.size.width, i18n.language)} ×{' '}
									{formatNumber(doc.size.height, i18n.language)} ×{' '}
									{formatNumber(doc.size.depth, i18n.language)} {t('units.mm')}
								</span>
							</div>
						</button>
					</li>
				)
			})}
		</ul>
	)
}
