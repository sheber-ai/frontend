import type * as React from 'react'
import { useMemo } from 'react'
import { MATERIALS, SCENE_COLORS } from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import { mix } from '../lib/color'
import { type DesignDocument, type LayoutNode, PANEL } from '../model/document'
import { computeLayout, type Layout, type Rect } from '../model/layout'
import { pathTo } from '../model/operations'
import { buildParts, type Part } from '../model/parts'

type Props = {
	document: DesignDocument
	/** `blueprint`: interior, door symbols and dimensions. `facade`: closed fronts in colour (thumbnails). */
	variant?: 'blueprint' | 'facade'
	selectedId?: string | null
	onSelect?: (id: string | null) => void
	showDimensions?: boolean
	showCellSizes?: boolean
	className?: string
}

const NUMBER = new Intl.NumberFormat('ru-RU')

type Frame = { height: number; unit: number }

/** SVG y grows down, document y grows up. */
const top = (frame: Frame, rect: { y: number; h: number }) => frame.height - rect.y - rect.h

function SvgRect({
	frame,
	rect,
	className,
	style,
	...props
}: { frame: Frame; rect: Rect } & Omit<
	React.SVGProps<SVGRectElement>,
	'x' | 'y' | 'width' | 'height'
>) {
	return (
		<rect
			x={rect.x}
			y={top(frame, rect)}
			width={Math.max(rect.w, 0)}
			height={Math.max(rect.h, 0)}
			className={className}
			style={style}
			vectorEffect="non-scaling-stroke"
			{...props}
		/>
	)
}

type Chain = { from: number; to: number }[]

function HorizontalChain({ frame, chain, y }: { frame: Frame; chain: Chain; y: number }) {
	const tick = frame.unit * 0.35
	return (
		<g>
			{chain.map(({ from, to }) => (
				<g key={`${from}-${to}`}>
					<line x1={from} x2={to} y1={y} y2={y} vectorEffect="non-scaling-stroke" />
					{[from, to].map((x) => (
						<line
							key={x}
							x1={x - tick}
							x2={x + tick}
							y1={y + tick}
							y2={y - tick}
							vectorEffect="non-scaling-stroke"
						/>
					))}
					<text
						x={(from + to) / 2}
						y={y - frame.unit * 0.35}
						textAnchor="middle"
						fontSize={frame.unit}
						className="fill-primary stroke-none font-semibold tabular-nums"
					>
						{to - from > frame.unit * 2 ? NUMBER.format(Math.round(to - from)) : ''}
					</text>
				</g>
			))}
		</g>
	)
}

function VerticalChain({
	frame,
	chain,
	x,
	side,
}: {
	frame: Frame
	chain: Chain
	x: number
	side: 'left' | 'right'
}) {
	const tick = frame.unit * 0.35
	const textX = side === 'left' ? x - frame.unit * 0.35 : x + frame.unit * 0.35
	return (
		<g>
			{chain.map(({ from, to }) => {
				const y1 = frame.height - from
				const y2 = frame.height - to
				const mid = (y1 + y2) / 2
				return (
					<g key={`${from}-${to}`}>
						<line x1={x} x2={x} y1={y1} y2={y2} vectorEffect="non-scaling-stroke" />
						{[y1, y2].map((y) => (
							<line
								key={y}
								x1={x - tick}
								x2={x + tick}
								y1={y + tick}
								y2={y - tick}
								vectorEffect="non-scaling-stroke"
							/>
						))}
						<text
							x={textX}
							y={mid}
							textAnchor="middle"
							fontSize={frame.unit}
							transform={`rotate(-90 ${textX} ${mid})`}
							className="fill-primary stroke-none font-semibold tabular-nums"
						>
							{to - from > frame.unit * 2 ? NUMBER.format(Math.round(to - from)) : ''}
						</text>
					</g>
				)
			})}
		</g>
	)
}

/** Y split whose heights the side chain shows: around the selection, else the rightmost one. */
function focusSplit(doc: DesignDocument, layout: Layout, selectedId: string | null | undefined) {
	const candidates = selectedId ? pathTo(doc.layout, selectedId).reverse() : []
	for (const id of candidates) {
		const node = layout.nodes.get(id)?.node
		if (node?.kind === 'split' && node.axis === 'y') return node
	}
	// Without a selection, the rightmost tiered section: its chain sits right next to it
	const last = (node: LayoutNode): LayoutNode | null => {
		if (node.kind === 'cell') return null
		for (const child of [...node.children].reverse()) {
			const found = last(child.node)
			if (found) return found
		}
		return node.axis === 'y' ? node : null
	}
	const found = last(doc.layout)
	return found?.kind === 'split' ? found : null
}

function doorSymbol(frame: Frame, part: Part) {
	const { x, w } = part.box
	const y = top(frame, part.box)
	const h = part.box.h
	const hingeLeft = part.motion?.type === 'hinge' && part.motion.direction === -1
	const apexX = hingeLeft ? x : x + w
	const farX = hingeLeft ? x + w : x
	return `M${farX} ${y} L${apexX} ${y + h / 2} L${farX} ${y + h}`
}

export function DesignDrawing({
	document: doc,
	variant = 'blueprint',
	selectedId,
	onSelect,
	showDimensions = variant === 'blueprint',
	showCellSizes = variant === 'blueprint',
	className,
}: Props) {
	const layout = useMemo(() => computeLayout(doc), [doc])
	const parts = useMemo(() => buildParts(doc, layout), [doc, layout])
	const { width: W, height: H } = doc.size
	const unit = Math.max(W, H) / 38
	const frame: Frame = { height: H, unit }
	const margin = showDimensions
		? { left: unit * 4.2, top: unit * 4.2, right: unit * 2.6, bottom: unit * 0.8 }
		: { left: unit * 0.4, top: unit * 0.4, right: unit * 0.4, bottom: unit * 0.4 }
	const viewBox = `${-margin.left} ${-margin.top} ${W + margin.left + margin.right} ${H + margin.top + margin.bottom}`

	const facade = variant === 'facade'
	const bodyColor = MATERIALS[doc.materials.body].color
	const frontColor = MATERIALS[doc.materials.fronts].color
	const inside = mix(bodyColor, SCENE_COLORS.shadow, 0.28)
	const fronts = parts.filter((part) => part.kind === 'door' || part.kind === 'sliding')
	const drawers = parts.filter((part) => part.kind === 'drawer')
	const external = drawers.filter((part) => part.box.z >= doc.size.depth)
	const sections =
		doc.layout.kind === 'split' && doc.layout.axis === 'x'
			? doc.layout.children.flatMap((child) => {
					const rect = layout.nodes.get(child.node.id)?.rect
					return rect ? [{ from: rect.x, to: rect.x + rect.w }] : []
				})
			: []
	const side = focusSplit(doc, layout, selectedId)
	const sideChain: Chain = side
		? side.children.flatMap((child) => {
				const rect = layout.nodes.get(child.node.id)?.rect
				return rect ? [{ from: rect.y, to: rect.y + rect.h }] : []
			})
		: []

	const select = (id: string) => (event: React.SyntheticEvent) => {
		event.stopPropagation()
		onSelect?.(id)
	}

	return (
		<svg
			viewBox={viewBox}
			className={cn('size-full select-none', className)}
			role="img"
			aria-label={`${NUMBER.format(W)} × ${NUMBER.format(H)} × ${NUMBER.format(doc.size.depth)}`}
			onClick={() => onSelect?.(null)}
			onKeyDown={undefined}
		>
			<g strokeLinejoin="round">
				{/* Carcass */}
				<SvgRect
					frame={frame}
					rect={layout.outer}
					className={facade ? 'stroke-foreground/40' : 'fill-card stroke-foreground'}
					style={facade ? { fill: bodyColor } : undefined}
					strokeWidth={facade ? 1 : 1.6}
				/>
				<SvgRect
					frame={frame}
					rect={layout.interior}
					className={facade ? 'stroke-foreground/30' : 'fill-muted stroke-foreground'}
					style={facade ? { fill: inside } : undefined}
					strokeWidth={1}
				/>
				{doc.plinth > 0 && (
					<SvgRect
						frame={frame}
						rect={{ x: PANEL, y: 0, w: W - 2 * PANEL, h: doc.plinth }}
						className={facade ? 'stroke-foreground/30' : 'fill-secondary stroke-foreground'}
						style={facade ? { fill: mix(bodyColor, SCENE_COLORS.shadow, 0.15) } : undefined}
						strokeWidth={1}
					/>
				)}

				{/* Interior */}
				{parts
					.filter((part) => part.kind === 'divider' || part.kind === 'shelf')
					.map((part) => (
						<SvgRect
							key={part.key}
							frame={frame}
							rect={part.box}
							className={facade ? 'stroke-foreground/30' : 'fill-card stroke-foreground'}
							style={facade ? { fill: bodyColor } : undefined}
							strokeWidth={1}
						/>
					))}
				{parts
					.filter((part) => part.kind === 'rod')
					.map((part) => (
						<g key={part.key} className={facade ? 'stroke-foreground/50' : 'stroke-foreground'}>
							<line
								x1={part.box.x + PANEL}
								x2={part.box.x + part.box.w - PANEL}
								y1={top(frame, part.box) + part.box.h / 2}
								y2={top(frame, part.box) + part.box.h / 2}
								strokeWidth={2}
								vectorEffect="non-scaling-stroke"
							/>
						</g>
					))}

				{/* Fronts */}
				{(facade ? drawers : external).map((part) => (
					<g key={part.key}>
						<SvgRect
							frame={frame}
							rect={part.box}
							className={facade ? 'stroke-foreground/40' : 'fill-card stroke-foreground'}
							style={
								facade ? { fill: part.material === 'fronts' ? frontColor : bodyColor } : undefined
							}
							strokeWidth={1}
						/>
						{part.handle && (
							<SvgRect
								frame={frame}
								rect={part.handle}
								className="fill-foreground/70 stroke-none"
							/>
						)}
					</g>
				))}
				{!facade &&
					drawers
						.filter((part) => part.box.z < doc.size.depth)
						.map((part) => (
							<SvgRect
								key={part.key}
								frame={frame}
								rect={part.box}
								className="fill-none stroke-foreground/50"
								strokeDasharray="6 4"
								strokeWidth={1}
							/>
						))}
				{fronts.map((part) =>
					facade ? (
						<g key={part.key}>
							<SvgRect
								frame={frame}
								rect={part.box}
								className="stroke-foreground/40"
								style={{ fill: frontColor }}
								strokeWidth={1}
							/>
							{part.handle && (
								<SvgRect
									frame={frame}
									rect={part.handle}
									className="fill-foreground/70 stroke-none"
								/>
							)}
						</g>
					) : (
						<g key={part.key} className="fill-none stroke-primary/70">
							<SvgRect frame={frame} rect={part.box} strokeDasharray="10 6" strokeWidth={1} />
							{part.kind === 'door' && (
								<path
									d={doorSymbol(frame, part)}
									strokeDasharray="10 6"
									vectorEffect="non-scaling-stroke"
								/>
							)}
						</g>
					),
				)}

				{/* Selection and hit areas */}
				{onSelect &&
					layout.order.map((id) => {
						const entry = layout.nodes.get(id)
						if (entry?.node.kind !== 'cell') return null
						return (
							<SvgRect
								key={`hit-${id}`}
								frame={frame}
								rect={entry.rect}
								className="cursor-pointer fill-transparent stroke-none outline-none hover:fill-primary/5 focus-visible:fill-primary/10"
								role="button"
								tabIndex={0}
								aria-label={`${NUMBER.format(Math.round(entry.rect.w))} × ${NUMBER.format(Math.round(entry.rect.h))}`}
								onClick={select(id)}
								onKeyDown={(event) => {
									if (event.key === 'Enter' || event.key === ' ') select(id)(event)
								}}
							/>
						)
					})}
				{selectedId && layout.nodes.get(selectedId) && (
					<SvgRect
						frame={frame}
						rect={layout.nodes.get(selectedId)?.rect ?? layout.interior}
						className="pointer-events-none fill-primary/10 stroke-primary"
						strokeWidth={2.5}
					/>
				)}

				{showCellSizes &&
					layout.order.map((id) => {
						const entry = layout.nodes.get(id)
						if (entry?.node.kind !== 'cell') return null
						const { rect } = entry
						if (rect.w < unit * 4.5 || rect.h < unit * 1.8) return null
						return (
							<text
								key={`size-${id}`}
								x={rect.x + rect.w / 2}
								y={top(frame, rect) + rect.h / 2}
								textAnchor="middle"
								dominantBaseline="middle"
								fontSize={unit * 0.8}
								className="pointer-events-none fill-muted-foreground stroke-card tabular-nums"
								strokeWidth={unit * 0.25}
								paintOrder="stroke"
							>
								{NUMBER.format(Math.round(rect.w))}×{NUMBER.format(Math.round(rect.h))}
							</text>
						)
					})}
			</g>

			{showDimensions && (
				<g className="fill-none stroke-primary">
					{sections.length > 1 && (
						<HorizontalChain frame={frame} chain={sections} y={-unit * 1.6} />
					)}
					<HorizontalChain frame={frame} chain={[{ from: 0, to: W }]} y={-unit * 3.4} />
					{doc.plinth > 0 && (
						<VerticalChain
							frame={frame}
							chain={[
								{ from: 0, to: doc.plinth },
								{ from: doc.plinth, to: H },
							]}
							x={-unit * 1.6}
							side="left"
						/>
					)}
					<VerticalChain frame={frame} chain={[{ from: 0, to: H }]} x={-unit * 3.4} side="left" />
					{sideChain.length > 1 && (
						<VerticalChain frame={frame} chain={sideChain} x={W + unit * 1.4} side="right" />
					)}
				</g>
			)}
		</svg>
	)
}
