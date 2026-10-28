import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, DoorClosed, DoorOpen, Rotate3d, Ruler, TriangleAlert } from '@/shared/design'
import { formatNumber } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { ErrorBoundary } from '@/shared/ui/error-boundary'
import { Segmented } from '@/shared/ui/segmented'
import { CAMERA_VIEWS, type CameraView } from '../model/camera'
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
	// Camera angle is view state only: never saved into the document
	const [view, setView] = useState<{ name: CameraView; key: number }>({ name: 'iso', key: 0 })
	const [failed, setFailed] = useState(false)
	const showView = (name: CameraView) => setView((current) => ({ name, key: current.key + 1 }))

	const renderFailure = (retry: () => void) => (
		<div className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center">
			<TriangleAlert className="size-7 text-warning" />
			<p className="max-w-xs text-body-sm text-muted-foreground">{t('editor.view.failed')}</p>
			<div className="flex flex-wrap justify-center gap-2">
				<Button size="sm" onClick={() => onModeChange('drawing')}>
					<Ruler />
					{t('editor.view.toDrawing')}
				</Button>
				<Button
					size="sm"
					variant="outline"
					onClick={() => {
						setFailed(false)
						retry()
					}}
				>
					{t('attachments.retry')}
				</Button>
			</div>
		</div>
	)

	return (
		<div className={cn('relative overflow-hidden bg-blueprint', className)}>
			{mode === '3d' ? (
				failed ? (
					renderFailure(() => undefined)
				) : (
					<ErrorBoundary fallback={renderFailure} onError={() => setFailed(true)}>
						<DesignScene
							document={doc}
							selectedId={selectedId}
							onSelect={onSelect}
							open={open}
							showDimensions={dimensions}
							view={view}
							onRenderError={() => setFailed(true)}
						/>
					</ErrorBoundary>
				)
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
					{mode === '3d' && !failed && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									aria-label={t('editor.view.angle')}
									title={t('editor.view.angle')}
									className="flex size-10 items-center justify-center rounded-lg border bg-card/90 text-muted-foreground shadow-sm backdrop-blur transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4"
								>
									<Rotate3d />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-48">
								<DropdownMenuLabel>{t('editor.view.angle')}</DropdownMenuLabel>
								{CAMERA_VIEWS.map((name) => (
									<DropdownMenuItem key={name} onSelect={() => showView(name)}>
										{t(`editor.view.angles.${name}`)}
									</DropdownMenuItem>
								))}
								<DropdownMenuSeparator />
								<DropdownMenuItem onSelect={() => showView('iso')}>
									{t('editor.view.reset')}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
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
