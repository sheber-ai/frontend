import { cn } from '@/shared/lib/utils'
import { type Point3, path, project } from '../lib/iso'
import {
	corners,
	DIMENSION_GAP,
	SKETCH_PLINTH,
	sketchViewBox,
	type WardrobeSketch,
} from '../model/sketch'
import { WardrobeModel } from './wardrobe-model'

const VIEW_BOX = sketchViewBox()
const MM = new Intl.NumberFormat('ru-RU')

type Props = {
	sketch: WardrobeSketch
	/** `model` is a shaded render, `blueprint` is a dimensioned line drawing. */
	mode: 'model' | 'blueprint'
	showDimensions?: boolean
	/** Fit the frame to this wardrobe instead of the largest one (thumbnails). */
	fit?: boolean
	className?: string
}

export function WardrobeDrawing({
	sketch,
	mode,
	showDimensions = true,
	fit = false,
	className,
}: Props) {
	return (
		<svg
			viewBox={fit ? sketchViewBox(sketch, 12) : VIEW_BOX}
			className={cn('size-full overflow-visible', className)}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			{mode === 'model' ? (
				<WardrobeModel sketch={sketch} />
			) : (
				<BlueprintLayer sketch={sketch} showDimensions={showDimensions} />
			)}
		</svg>
	)
}

function doorEdges({ width, sections }: WardrobeSketch, x0: number) {
	return Array.from({ length: sections + 1 }, (_, index) => x0 + (width * index) / sections)
}

function handleXs(sketch: WardrobeSketch, x0: number) {
	const edges = doorEdges(sketch, x0)
	return Array.from({ length: sketch.sections }, (_, index) => {
		const left = edges[index] ?? x0
		const right = edges[index + 1] ?? x0
		return index % 2 === 0 ? right - 5 : left + 5
	})
}

function BlueprintLayer({
	sketch,
	showDimensions,
}: {
	sketch: WardrobeSketch
	showDimensions: boolean
}) {
	const { x0, x1, z0, z1, y1 } = corners(sketch)
	const p = SKETCH_PLINTH
	const g = DIMENSION_GAP
	const handleY = p + (y1 - p) * 0.45
	const shelves = [0.25, 0.5, 0.75].map((level) => p + (y1 - p) * level)

	const line = (points: Point3[], strokeWidth: number) => (
		<path d={path(points)} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
	)

	return (
		<g className="fill-none stroke-primary">
			<g className="opacity-50" strokeDasharray="4 4">
				{line(
					[
						[x0, 0, z1],
						[x0, 0, z0],
						[x1, 0, z0],
					],
					1,
				)}
				{line(
					[
						[x0, 0, z0],
						[x0, y1, z0],
					],
					1,
				)}
				{shelves.map((y) => (
					<path
						key={y}
						d={path([
							[x1, y, z1],
							[x1, y, z0],
						])}
						strokeWidth={1}
						vectorEffect="non-scaling-stroke"
					/>
				))}
			</g>

			<path
				d={path(
					[
						[x0, 0, z1],
						[x1, 0, z1],
						[x1, y1, z1],
						[x0, y1, z1],
					],
					true,
				)}
				strokeWidth={1.8}
				vectorEffect="non-scaling-stroke"
			/>
			{line(
				[
					[x0, y1, z1],
					[x0, y1, z0],
					[x1, y1, z0],
					[x1, y1, z1],
				],
				1.8,
			)}
			{line(
				[
					[x1, 0, z1],
					[x1, 0, z0],
					[x1, y1, z0],
				],
				1.8,
			)}
			{line(
				[
					[x0, p, z1],
					[x1, p, z1],
					[x1, p, z0],
				],
				1.2,
			)}
			{doorEdges(sketch, x0)
				.slice(1, -1)
				.map((x) => (
					<path
						key={x}
						d={path([
							[x, p, z1],
							[x, y1, z1],
						])}
						strokeWidth={1.2}
						vectorEffect="non-scaling-stroke"
					/>
				))}
			{handleXs(sketch, x0).map((x) => (
				<path
					key={x}
					d={path([
						[x, handleY, z1],
						[x, handleY + 18, z1],
					])}
					strokeWidth={1.6}
					vectorEffect="non-scaling-stroke"
				/>
			))}

			{showDimensions && (
				<g className="opacity-80">
					{line(
						[
							[x0, 0, z1],
							[x0, 0, z1 + g + 5],
						],
						0.8,
					)}
					{line(
						[
							[x1, 0, z1],
							[x1, 0, z1 + g + 5],
						],
						0.8,
					)}
					{line(
						[
							[x0, 0, z1 + g],
							[x1, 0, z1 + g],
						],
						1,
					)}
					{line(
						[
							[x0, 0, z1],
							[x0 - g - 5, 0, z1],
						],
						0.8,
					)}
					{line(
						[
							[x0, y1, z1],
							[x0 - g - 5, y1, z1],
						],
						0.8,
					)}
					{line(
						[
							[x0 - g, 0, z1],
							[x0 - g, y1, z1],
						],
						1,
					)}
					{line(
						[
							[x1, 0, z0],
							[x1 + g + 5, 0, z0],
						],
						0.8,
					)}
					{line(
						[
							[x1, 0, z1],
							[x1 + g + 5, 0, z1],
						],
						0.8,
					)}
					{line(
						[
							[x1 + g, 0, z1],
							[x1 + g, 0, z0],
						],
						1,
					)}
					<DimensionLabel at={[0, 0, z1 + g]} rotate={30} value={sketch.width} />
					<DimensionLabel at={[x0 - g, y1 / 2, z1]} rotate={-90} value={sketch.height} />
					<DimensionLabel at={[x1 + g, 0, 0]} rotate={-30} value={sketch.depth} />
				</g>
			)}
		</g>
	)
}

function DimensionLabel({ at, rotate, value }: { at: Point3; rotate: number; value: number }) {
	const [x, y] = project(at)
	return (
		<text
			x={x}
			y={y}
			dy={-5}
			textAnchor="middle"
			transform={`rotate(${rotate} ${x} ${y})`}
			fontSize={11}
			className="fill-primary stroke-background font-semibold tabular-nums"
			strokeWidth={4}
			paintOrder="stroke"
		>
			{MM.format(value * 10)}
		</text>
	)
}
