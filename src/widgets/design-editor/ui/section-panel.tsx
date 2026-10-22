import { useTranslation } from 'react-i18next'
import {
	addSection,
	type DesignDocument,
	divideCell,
	type Fill,
	type FillType,
	findParent,
	type Hinge,
	type Issue,
	type Layout,
	LIMITS,
	pathTo,
	removeNode,
	setAxis,
	setChildSize,
	setDoor,
	setFill,
} from '@/entities/furniture'
import {
	Archive,
	ChevronUp,
	Columns3,
	DoorClosed,
	Move3d,
	Plus,
	Rows3,
	Shirt,
	Square,
	Trash2,
	TriangleAlert,
	X,
} from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Segmented } from '@/shared/ui/segmented'
import { nodeLabel } from '../model/node-label'
import type { EditorState } from '../model/use-editor-state'
import { CountStepper } from './count-stepper'
import { MmField } from './mm-field'
import { PanelSection } from './panel-section'

type Props = {
	document: DesignDocument
	layout: Layout
	selectedId: string | null
	issues: Issue[]
	apply: EditorState['apply']
	select: EditorState['select']
}

const DEFAULT_FILLS: Record<FillType, Fill> = {
	empty: { type: 'empty' },
	shelves: { type: 'shelves', count: 2 },
	rod: { type: 'rod' },
	drawers: { type: 'drawers', count: 3 },
}

type DoorChoice = Hinge | 'none'

export function SectionPanel({ document: doc, layout, selectedId, issues, apply, select }: Props) {
	const { t } = useTranslation()
	const entry = selectedId ? layout.nodes.get(selectedId) : undefined

	if (!entry) {
		return (
			<div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
				<span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
					<Move3d className="size-6" />
				</span>
				<div className="flex flex-col gap-1">
					<p className="text-h4">{t('editor.section.emptyTitle')}</p>
					<p className="text-body-sm text-muted-foreground">{t('editor.section.emptyText')}</p>
				</div>
				<Button variant="outline" onClick={() => select(doc.layout.id)}>
					{t('editor.section.selectBody')}
				</Button>
			</div>
		)
	}

	const { node, rect } = entry
	const parent = findParent(doc.layout, node.id)
	const childEntry = parent?.children[entry.index]
	const nodeIssues = issues.filter((issue) => issue.nodeId === node.id)
	const coveringDoor = pathTo(doc.layout, node.id)
		.slice(0, -1)
		.find((id) => layout.nodes.get(id)?.node.door)

	const doorValue: DoorChoice = node.door?.hinge ?? 'none'
	const changeDoor = (choice: DoorChoice) =>
		apply((current) => setDoor(current, node.id, choice === 'none' ? null : { hinge: choice }))

	return (
		<div className="flex flex-col">
			<div className="flex items-start justify-between gap-3 border-b px-4 py-4 sm:px-5">
				<div className="min-w-0">
					<p className="truncate text-h4">{nodeLabel(t, doc.layout, node.id)}</p>
					<p className="text-body-sm text-muted-foreground tabular-nums">
						{t('editor.section.clear', { width: Math.round(rect.w), height: Math.round(rect.h) })}
					</p>
				</div>
				<div className="flex shrink-0 gap-1">
					{parent && (
						<Button
							variant="outline"
							size="icon-sm"
							aria-label={t('editor.section.parent')}
							title={t('editor.section.parent')}
							onClick={() => select(parent.id)}
						>
							<ChevronUp />
						</Button>
					)}
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label={t('editor.section.deselect')}
						title={t('editor.section.deselect')}
						onClick={() => select(null)}
					>
						<X />
					</Button>
				</div>
			</div>

			{nodeIssues.length > 0 && (
				<ul className="flex flex-col gap-2 border-b px-4 py-4 sm:px-5">
					{nodeIssues.map((issue) => (
						<li
							key={issue.code}
							className={cn(
								'flex gap-2 rounded-lg px-3 py-2 text-body-sm',
								issue.level === 'error'
									? 'bg-destructive/10 text-destructive'
									: 'bg-warning/15 text-foreground',
							)}
						>
							<TriangleAlert className="mt-0.5 size-4 shrink-0" />
							{t(`issues.${issue.code}`, issue.params)}
						</li>
					))}
				</ul>
			)}

			{parent && childEntry && (
				<PanelSection
					title={parent.axis === 'x' ? t('editor.section.width') : t('editor.section.height')}
				>
					<Segmented
						label={t('editor.section.sizeMode')}
						value={childEntry.size === null ? 'auto' : 'fixed'}
						onChange={(mode) =>
							apply((current) =>
								setChildSize(
									current,
									parent.id,
									entry.index,
									mode === 'auto' ? null : Math.round(parent.axis === 'x' ? rect.w : rect.h),
								),
							)
						}
						options={[
							{ value: 'auto', label: t('editor.section.auto') },
							{ value: 'fixed', label: t('editor.section.fixed') },
						]}
					/>
					{childEntry.size === null ? (
						<p className="text-body-sm text-muted-foreground">{t('editor.section.autoHint')}</p>
					) : (
						<MmField
							label={parent.axis === 'x' ? t('editor.section.width') : t('editor.section.height')}
							value={childEntry.size}
							{...LIMITS.childSize}
							slider={false}
							onChange={(size) =>
								apply((current) => setChildSize(current, parent.id, entry.index, size))
							}
						/>
					)}
				</PanelSection>
			)}

			{node.kind === 'cell' ? (
				<>
					<PanelSection title={t('editor.section.fill')}>
						<Segmented<FillType>
							label={t('editor.section.fill')}
							layout="grid"
							value={node.fill.type}
							onChange={(type) =>
								apply((current) => setFill(current, node.id, DEFAULT_FILLS[type]))
							}
							options={[
								{ value: 'empty', label: t('editor.fill.empty'), icon: <Square /> },
								{ value: 'shelves', label: t('editor.fill.shelves'), icon: <Rows3 /> },
								{ value: 'rod', label: t('editor.fill.rod'), icon: <Shirt /> },
								{ value: 'drawers', label: t('editor.fill.drawers'), icon: <Archive /> },
							]}
						/>
						{node.fill.type === 'shelves' && (
							<CountStepper
								label={t('editor.fill.shelvesCount')}
								value={node.fill.count}
								{...LIMITS.shelves}
								onChange={(count) =>
									apply((current) => setFill(current, node.id, { type: 'shelves', count }))
								}
							/>
						)}
						{node.fill.type === 'drawers' && (
							<CountStepper
								label={t('editor.fill.drawersCount')}
								value={node.fill.count}
								{...LIMITS.drawers}
								onChange={(count) =>
									apply((current) => setFill(current, node.id, { type: 'drawers', count }))
								}
							/>
						)}
					</PanelSection>

					<PanelSection title={t('editor.section.divide')}>
						<div className="grid grid-cols-2 gap-2">
							<Button
								variant="outline"
								onClick={() => apply((current) => divideCell(current, node.id, 'x', 2))}
							>
								<Columns3 />
								{t('editor.section.divideColumns')}
							</Button>
							<Button
								variant="outline"
								onClick={() => apply((current) => divideCell(current, node.id, 'y', 2))}
							>
								<Rows3 />
								{t('editor.section.divideRows')}
							</Button>
						</div>
						<p className="text-body-sm text-muted-foreground">{t('editor.section.divideHint')}</p>
					</PanelSection>
				</>
			) : (
				<PanelSection title={t('editor.section.parts')}>
					<Segmented
						label={t('editor.section.direction')}
						value={node.axis}
						onChange={(axis) => apply((current) => setAxis(current, node.id, axis))}
						options={[
							{ value: 'x', label: t('editor.section.columns'), icon: <Columns3 /> },
							{ value: 'y', label: t('editor.section.rows'), icon: <Rows3 /> },
						]}
					/>
					<ul className="flex flex-col gap-1">
						{node.children.map((child) => {
							const childRect = layout.nodes.get(child.node.id)?.rect
							const length = childRect
								? Math.round(node.axis === 'x' ? childRect.w : childRect.h)
								: 0
							return (
								<li key={child.node.id}>
									<button
										type="button"
										onClick={() => select(child.node.id)}
										className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-body-sm transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
									>
										<span className="truncate">{nodeLabel(t, doc.layout, child.node.id)}</span>
										<span className="shrink-0 text-muted-foreground tabular-nums">
											{child.size === null ? `${t('editor.section.auto')} · ` : ''}
											{t('editor.section.mm', { value: length })}
										</span>
									</button>
								</li>
							)
						})}
					</ul>
					<Button
						variant="outline"
						disabled={node.children.length >= LIMITS.children.max}
						onClick={() => apply((current) => addSection(current, node.id))}
					>
						<Plus />
						{t('editor.section.add')}
					</Button>
				</PanelSection>
			)}

			{doc.facade.type === 'hinged' && (
				<PanelSection title={t('editor.section.door')}>
					<Segmented<DoorChoice>
						label={t('editor.section.door')}
						layout="grid"
						value={doorValue}
						onChange={changeDoor}
						options={[
							{ value: 'none', label: t('editor.door.none'), icon: <Square /> },
							{ value: 'left', label: t('editor.door.left'), icon: <DoorClosed /> },
							{
								value: 'right',
								label: t('editor.door.right'),
								icon: <DoorClosed className="-scale-x-100" />,
							},
							{ value: 'double', label: t('editor.door.double'), icon: <Columns3 /> },
						]}
					/>
					{coveringDoor && !node.door && (
						<p className="text-body-sm text-muted-foreground">
							{t('editor.door.covered', { name: nodeLabel(t, doc.layout, coveringDoor) })}
						</p>
					)}
				</PanelSection>
			)}

			{parent && (
				<div className="px-4 py-5 sm:px-5">
					<Button
						variant="ghost"
						className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
						onClick={() => {
							select(parent.id)
							apply((current) => removeNode(current, node.id))
						}}
					>
						<Trash2 />
						{t('editor.section.remove')}
					</Button>
				</div>
			)}
		</div>
	)
}
