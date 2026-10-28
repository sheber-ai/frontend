import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { type DesignDocument, handleType } from '../model/document'
import { summarizeDesign } from '../model/specs'

type Props = { document: DesignDocument; className?: string }

/** Key figures a workshop needs to quote: sizes, materials, what is inside. */
export function DesignSpecsList({ document: doc, className }: Props) {
	const { t, i18n } = useTranslation()
	const specs = useMemo(() => summarizeDesign(doc), [doc])
	const mm = (value: number) => `${formatNumber(value, i18n.language)} ${t('units.mm')}`

	const rows: [string, string | number][] = [
		[
			t('specs.size'),
			`${formatNumber(doc.size.width, i18n.language)} × ${formatNumber(doc.size.height, i18n.language)} × ${formatNumber(doc.size.depth, i18n.language)} ${t('units.mm')}`,
		],
		[t('specs.plinth'), doc.plinth ? mm(doc.plinth) : t('specs.none')],
		[t('specs.body'), t(`materials.${doc.materials.body}`)],
		[t('specs.fronts'), t(`materials.${doc.materials.fronts}`)],
		[t('specs.facade'), t(`specs.facadeType.${doc.facade.type}`)],
		[
			t('specs.sections'),
			specs.sections.map((width) => formatNumber(width, i18n.language)).join(' · '),
		],
		[t('specs.shelves'), specs.shelves],
		[t('specs.rods'), specs.rods],
		[t('specs.drawers'), specs.drawers],
		[t('specs.doors'), doc.facade.type === 'sliding' ? specs.slidingPanels : specs.doors],
	]
	// Handles matter only when there is something to open
	if (specs.doors + specs.drawers + specs.slidingPanels > 0)
		rows.push([t('specs.handles'), t(`editor.handles.${handleType(doc)}`)])

	return (
		<dl className={cn('grid grid-cols-1 gap-y-2 text-body-sm', className)}>
			{rows.map(([label, value]) => (
				<div
					key={label}
					className="flex items-baseline justify-between gap-3 border-b border-dashed pb-2 last:border-0 last:pb-0"
				>
					<dt className="text-muted-foreground">{label}</dt>
					<dd className="text-right font-medium tabular-nums">{value}</dd>
				</div>
			))}
		</dl>
	)
}
