import { useId } from 'react'
import { HARDWARE, MATERIALS, SCENE_COLORS } from '@/shared/design'
import { luminance, mix } from '../lib/color'
import { corners, SKETCH_PLINTH, type WardrobeSketch } from '../model/sketch'

const C = Math.cos(Math.PI / 6)
const S = 0.5
/** Door thickness, gap between doors and side panel thickness, cm */
const DOOR = 1.8
const GAP = 0.5
const PANEL = 1.8
const HANDLE_LENGTH = 22

// Each face is drawn in flat 2D coordinates (cm, y up) and mapped onto the isometric plane by an affine matrix,
// so textures, gradients and details follow the face orientation.
const frontPlane = (z: number) => `matrix(${C} ${S} 0 -1 ${-C * z} ${S * z})`
const sidePlane = (x: number) => `matrix(${-C} ${S} 0 -1 ${C * x} ${S * x})`
const floorPlane = (y: number) => `matrix(${C} ${S} ${-C} ${S} 0 ${-y})`

type Rect = { x: number; y: number; width: number; height: number }

export function WardrobeModel({ sketch }: { sketch: WardrobeSketch }) {
	const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
	const id = (name: string) => `${uid}-${name}`
	const url = (name: string) => `url(#${id(name)})`

	const material = MATERIALS[sketch.material]
	const metal = HARDWARE[material.hardware]
	const { light, shadow } = SCENE_COLORS
	const isWood = material.finish === 'wood'
	const { x0, x1, z0, z1, y1 } = corners(sketch)
	const p = SKETCH_PLINTH
	const zf = z1 + DOOR

	const base = material.color
	// Edge highlights read as stripes on dark finishes, so soften them
	const bevelLight = luminance(base) < 0.35 ? 0.16 : 0.4
	const sideColor = mix(base, shadow, 0.3)
	const topColor = mix(base, light, 0.2)

	const edges = Array.from(
		{ length: sketch.sections + 1 },
		(_, i) => x0 + (sketch.width * i) / sketch.sections,
	)
	const doors: Rect[] = Array.from({ length: sketch.sections }, (_, i) => {
		const left = (edges[i] ?? x0) + (i === 0 ? 0 : GAP / 2)
		const right = (edges[i + 1] ?? x1) - (i === sketch.sections - 1 ? 0 : GAP / 2)
		return { x: left, y: p + GAP, width: right - left, height: y1 - p - GAP }
	})
	const handleY = p + (y1 - p) * 0.45

	/** Veneer (wood) or paint texture over a face rect. */
	const texture = (rect: Rect, key: string, grainAlong: 'height' | 'width' = 'height') =>
		isWood ? (
			<>
				<rect {...rect} fill={material.figure} filter={url(`figure-${grainAlong}-${key}`)} />
				<rect {...rect} fill={material.grain} filter={url(`fibers-${grainAlong}-${key}`)} />
			</>
		) : (
			<rect {...rect} fill={shadow} filter={url('paint')} />
		)

	const woodFilters = (key: string, seed: number) =>
		(['height', 'width'] as const).map((along) => {
			const [fiberX, fiberY] = along === 'height' ? [0.38, 0.02] : [0.02, 0.38]
			const [figureX, figureY] = along === 'height' ? [0.06, 0.005] : [0.005, 0.06]
			const warp = along === 'height' ? '0.03 0.006' : '0.006 0.03'
			return [
				<NoiseFilter
					key={`fibers-${along}-${key}`}
					id={id(`fibers-${along}-${key}`)}
					frequency={`${fiberX} ${fiberY}`}
					octaves={3}
					seed={seed}
					gain={1.7}
					bias={-0.72}
					warp={{ frequency: warp, scale: 5 }}
				/>,
				<NoiseFilter
					key={`figure-${along}-${key}`}
					id={id(`figure-${along}-${key}`)}
					frequency={`${figureX} ${figureY}`}
					octaves={2}
					seed={seed + 3}
					gain={1.3}
					bias={-0.5}
					warp={{ frequency: warp, scale: 12 }}
				/>,
			]
		})

	return (
		<g>
			<defs>
				{isWood ? (
					<>
						{doors.map((_, i) => woodFilters(`door${i}`, 11 + i * 17))}
						{woodFilters('side', 5)}
						{woodFilters('top', 7)}
						{woodFilters('frame', 9)}
					</>
				) : (
					<NoiseFilter
						id={id('paint')}
						frequency="2.2"
						octaves={1}
						seed={4}
						gain={0.12}
						bias={-0.04}
					/>
				)}
				<filter id={id('blur-soft')} x="-30%" y="-30%" width="160%" height="160%">
					<feGaussianBlur stdDeviation="5" />
				</filter>
				<filter id={id('blur-tight')} x="-30%" y="-30%" width="160%" height="160%">
					<feGaussianBlur stdDeviation="1.4" />
				</filter>
				<filter id={id('blur-handle')} x="-100%" y="-100%" width="300%" height="300%">
					<feGaussianBlur stdDeviation="0.5" />
				</filter>
				{/* Local y grows upward, so offset 0 is the bottom of a face */}
				<linearGradient id={id('front-light')} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={shadow} stopOpacity={0.2} />
					<stop offset="0.28" stopColor={shadow} stopOpacity={0} />
					<stop offset="0.7" stopColor={light} stopOpacity={0} />
					<stop offset="1" stopColor={light} stopOpacity={0.16} />
				</linearGradient>
				<linearGradient id={id('sheen')} x1="0" y1="1" x2="1" y2="0">
					<stop offset="0.25" stopColor={light} stopOpacity={0} />
					<stop offset="0.5" stopColor={light} stopOpacity={isWood ? 0.06 : 0.1} />
					<stop offset="0.75" stopColor={light} stopOpacity={0} />
				</linearGradient>
				<linearGradient id={id('side-light')} x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor={shadow} stopOpacity={0.3} />
					<stop offset="1" stopColor={shadow} stopOpacity={0} />
				</linearGradient>
				<linearGradient id={id('top-light')} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={shadow} stopOpacity={0.18} />
					<stop offset="1" stopColor={light} stopOpacity={0.2} />
				</linearGradient>
				<linearGradient id={id('occlusion')} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={shadow} stopOpacity={0.4} />
					<stop offset="0.1" stopColor={shadow} stopOpacity={0} />
				</linearGradient>
				<linearGradient id={id('metal')} x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor={metal.dark} />
					<stop offset="0.35" stopColor={metal.light} />
					<stop offset="0.6" stopColor={metal.base} />
					<stop offset="1" stopColor={metal.dark} />
				</linearGradient>
			</defs>

			{/* Contact shadow on the floor */}
			<g transform={floorPlane(0)}>
				<rect
					x={x0 - 8}
					y={z0 - 6}
					width={sketch.width + 22}
					height={z1 - z0 + DOOR + 18}
					fill={shadow}
					opacity={0.16}
					filter={url('blur-soft')}
				/>
				<rect
					x={x0}
					y={z0}
					width={sketch.width}
					height={z1 - z0 + DOOR + 1}
					fill={shadow}
					opacity={0.38}
					filter={url('blur-tight')}
				/>
			</g>

			{/* Right side panel and the door edge in front of it */}
			<g transform={sidePlane(x1)}>
				<rect x={z0} y={0} width={z1 - z0} height={y1} fill={sideColor} />
				{texture({ x: z0, y: 0, width: z1 - z0, height: y1 }, 'side')}
				<rect x={z0} y={0} width={z1 - z0} height={y1} fill={url('side-light')} />
				<rect x={z0} y={0} width={z1 - z0} height={y1} fill={url('occlusion')} />
				<rect
					x={z1}
					y={p + GAP}
					width={DOOR}
					height={y1 - p - GAP}
					fill={mix(sideColor, light, 0.12)}
				/>
				<line
					x1={z1}
					y1={p + GAP}
					x2={z1}
					y2={y1}
					stroke={shadow}
					strokeOpacity={0.45}
					strokeWidth={0.25}
				/>
			</g>

			{/* Top panel and door top edges */}
			<g transform={floorPlane(y1)}>
				<rect x={x0} y={z0} width={sketch.width} height={z1 - z0} fill={topColor} />
				{texture({ x: x0, y: z0, width: sketch.width, height: z1 - z0 }, 'top', 'width')}
				<rect x={x0} y={z0} width={sketch.width} height={z1 - z0} fill={url('top-light')} />
				{doors.map((door) => (
					<rect
						key={door.x}
						x={door.x}
						y={z1}
						width={door.width}
						height={DOOR}
						fill={mix(topColor, shadow, 0.06)}
					/>
				))}
				<line
					x1={x0}
					y1={z1}
					x2={x1}
					y2={z1}
					stroke={shadow}
					strokeOpacity={0.35}
					strokeWidth={0.2}
				/>
			</g>

			{/* Plinth between the side panels, recessed and in shadow */}
			<g transform={frontPlane(z1)}>
				<rect x={x0} y={0} width={sketch.width} height={p} fill={mix(base, shadow, 0.35)} />
				{texture({ x: x0, y: 0, width: sketch.width, height: p }, 'frame', 'width')}
				<rect
					x={x0 + PANEL}
					y={0}
					width={sketch.width - PANEL * 2}
					height={p - 0.5}
					fill={mix(base, shadow, 0.72)}
				/>
			</g>

			{/* Doors */}
			<g transform={frontPlane(zf)}>
				<rect x={x0} y={p} width={sketch.width} height={y1 - p} fill={shadow} opacity={0.75} />
				{doors.map((door, i) => {
					const handleX =
						sketch.sections === 1 || i % 2 === 0 ? door.x + door.width - 5 : door.x + 5
					return (
						<g key={door.x}>
							<rect {...door} fill={base} />
							{texture(door, `door${i}`)}
							<rect {...door} fill={url('front-light')} />
							<rect {...door} fill={url('sheen')} />
							<path
								d={`M${door.x} ${door.y} V${door.y + door.height} H${door.x + door.width}`}
								fill="none"
								stroke={light}
								strokeOpacity={bevelLight}
								strokeWidth={1}
								vectorEffect="non-scaling-stroke"
							/>
							<path
								d={`M${door.x + door.width} ${door.y + door.height} V${door.y} H${door.x}`}
								fill="none"
								stroke={shadow}
								strokeOpacity={0.35}
								strokeWidth={1}
								vectorEffect="non-scaling-stroke"
							/>
							<rect
								x={handleX - 0.4}
								y={handleY - 1}
								width={1.5}
								height={HANDLE_LENGTH}
								rx={0.75}
								fill={shadow}
								opacity={0.35}
								filter={url('blur-handle')}
							/>
							<rect
								x={handleX - 0.7}
								y={handleY}
								width={1.4}
								height={HANDLE_LENGTH}
								rx={0.7}
								fill={url('metal')}
							/>
						</g>
					)
				})}
			</g>
		</g>
	)
}

type NoiseProps = {
	id: string
	frequency: string
	octaves: number
	seed: number
	/** Alpha = gain * noise + bias */
	gain: number
	bias: number
	/** Bends the noise with a low-frequency field, so wood fibers flow instead of running straight */
	warp?: { frequency: string; scale: number }
}

/** Masks the filled shape with fractal noise: stretched noise gives wood fibers, round noise gives paint texture. */
function NoiseFilter({ id, frequency, octaves, seed, gain, bias, warp }: NoiseProps) {
	return (
		<filter id={id} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
			<feTurbulence
				type="fractalNoise"
				baseFrequency={frequency}
				numOctaves={octaves}
				seed={seed}
				result="noise"
			/>
			{warp && (
				<>
					<feTurbulence
						type="fractalNoise"
						baseFrequency={warp.frequency}
						numOctaves={1}
						seed={seed + 1}
						result="warp"
					/>
					<feDisplacementMap
						in="noise"
						in2="warp"
						scale={warp.scale}
						xChannelSelector="R"
						yChannelSelector="G"
						result="noise"
					/>
				</>
			)}
			<feColorMatrix
				in="noise"
				type="matrix"
				values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${gain} 0 0 0 ${bias}`}
				result="mask"
			/>
			<feComposite in="SourceGraphic" in2="mask" operator="in" />
		</filter>
	)
}
