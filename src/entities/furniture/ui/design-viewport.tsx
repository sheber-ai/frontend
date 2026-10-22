import { useTranslation } from 'react-i18next'
import { Box, DoorClosed, DoorOpen, Ruler } from '@/shared/design'
import { formatNumber } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Segmented } from '@/shared/ui/segmented'
import type { DesignDocument } from '../model/document'
import { DesignDrawing } from './design-drawing'
import { DesignScene } from './design-scene-lazy'

export type ViewMode = '3d' | 'drawing'

type Props = {
	document: DesignDocument
	selectedId?: string | null
	onSelect?: (id: string | null) => void
	mode: ViewMode
	onModeChange: (mode: ViewMode) => void
	open: boolean
	onOpenChange: (open: boolean) => void
	dimensions: boolean
	onDimensionsChange: (value: boolean) => void
	className?: string
}

function OverlayToggle({
	active,
	onClick,
	label,
	children,
}: {
	active: boolean
	onClick: () => void
	label: string
	children: React.ReactNode
}) {
	return (
		<button
			type="button"
			aria-pressed={active}
			aria-label={label}
			title={label}
			onClick={onClick}
			className={cn(
				'flex size-10 items-center justify-center rounded-lg border bg-card/90 text-muted-foreground shadow-sm backdrop-blur transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4',
				active &&
					'border-primary/40 bg-primary text-primary-foreground hover:text-primary-foreground',
			)}
		>
			{children}
		</button>
	)
}

/** Model or drawing with view controls; read-only when `onSelect` is omitted. */
export function DesignViewport({
	document: doc,
	selectedId,
	onSelect,
	mode,
	onModeChange,
	open,
	onOpenChange,
	dimensions,
	onDimensionsChange,
	className,
}: Props) {
	const { t, i18n } = useTranslation()
	const { width, height, depth } = doc.size

	return (
		<div className={cn('relative overflow-hidden bg-blueprint', className)}>
			{mode === '3d' ? (
				<DesignScene
					document={doc}
					selectedId={selectedId}
					onSelect={onSelect}
					open={open}
					showDimensions={dimensions}
				/>
			) : (
				<div className="size-full p-4 pt-16 sm:p-8 sm:pt-16">
					<DesignDrawing
						document={doc}
						selectedId={selectedId}
						onSelect={onSelect}
						showDimensions={dimensions}
					/>
				</div>
			)}

			<div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
				<Segmented<ViewMode>
					label={t('editor.view.label')}
					value={mode}
					onChange={onModeChange}
					className="pointer-events-auto flex w-auto bg-card/90 shadow-sm backdrop-blur [&_button]:px-3"
					options={[
						{ value: '3d', label: t('editor.view.model'), icon: <Box /> },
						{ value: 'drawing', label: t('editor.view.drawing'), icon: <Ruler /> },
					]}
				/>
				<div className="pointer-events-auto flex gap-2">
					{mode === '3d' && (
						<OverlayToggle
							active={open}
							onClick={() => onOpenChange(!open)}
							label={open ? t('editor.view.close') : t('editor.view.open')}
						>
							{open ? <DoorOpen /> : <DoorClosed />}
						</OverlayToggle>
					)}
					<OverlayToggle
						active={dimensions}
						onClick={() => onDimensionsChange(!dimensions)}
						label={t('editor.view.dimensions')}
					>
						<Ruler />
					</OverlayToggle>
				</div>
			</div>

			<div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap items-end justify-between gap-2">
				<span className="rounded-full border bg-card/90 px-3 py-1 text-caption text-muted-foreground tabular-nums backdrop-blur">
					{formatNumber(width, i18n.language)} × {formatNumber(height, i18n.language)} ×{' '}
					{formatNumber(depth, i18n.language)} {t('units.mm')}
				</span>
				{onSelect && !selectedId && (
					<span className="rounded-full bg-foreground px-3 py-1 text-caption text-background shadow-lg max-sm:hidden">
						{mode === '3d' ? t('editor.view.hint3d') : t('editor.view.hintDrawing')}
					</span>
				)}
			</div>
		</div>
	)
}
