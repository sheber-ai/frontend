import { ContactShadows, Edges, Line, OrbitControls } from '@react-three/drei'
import { Canvas, type ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { HARDWARE, MATERIALS, SCENE_COLORS } from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import { luminance, mix } from '../lib/color'
import { labelTexture } from '../lib/label-texture'
import { surfaceTexture } from '../lib/surface-texture'
import { type CameraView, cameraPosition } from '../model/camera'
import { BACK, type DesignDocument } from '../model/document'
import { computeLayout, type Layout } from '../model/layout'
import { type Box, buildParts, type Part, type PartMaterial } from '../model/parts'

export type DesignSceneProps = {
	document: DesignDocument
	selectedId?: string | null
	onSelect?: (id: string | null) => void
	/** Doors swing open, drawers slide out, sliding panels fade */
	open?: boolean
	showDimensions?: boolean
	/** Requested camera angle; bump `key` to apply the same view again (reset) */
	view?: { name: CameraView; key: number }
	/** WebGL failed or the GPU dropped the context */
	onRenderError?: () => void
	className?: string
}

const MM = 0.001
const FOV = 35
const NUMBER = new Intl.NumberFormat('ru-RU')

let unitBox: THREE.BoxGeometry | undefined
let unitCylinder: THREE.CylinderGeometry | undefined
function geometries() {
	unitBox ??= new THREE.BoxGeometry(1, 1, 1)
	unitCylinder ??= new THREE.CylinderGeometry(0.5, 0.5, 1, 20).rotateZ(Math.PI / 2)
	return { box: unitBox, cylinder: unitCylinder }
}

function useMaterials(doc: DesignDocument) {
	const { body, fronts } = doc.materials
	const materials = useMemo(() => {
		const bodyMaterial = MATERIALS[body]
		const frontMaterial = MATERIALS[fronts]
		const hardware = HARDWARE[frontMaterial.hardware]
		const surface = (name: typeof body) =>
			new THREE.MeshStandardMaterial({
				color: SCENE_COLORS.light,
				map: surfaceTexture(name, MATERIALS[name]),
				roughness: MATERIALS[name].roughness,
			})
		const result: Record<PartMaterial, THREE.MeshStandardMaterial> = {
			body: surface(body),
			fronts: surface(fronts),
			inner: surface(body),
			back: new THREE.MeshStandardMaterial({
				color: mix(bodyMaterial.color, SCENE_COLORS.backPanel, 0.55),
				roughness: 0.85,
			}),
			metal: new THREE.MeshStandardMaterial({
				color: hardware.base,
				roughness: 0.32,
				metalness: 0.75,
			}),
		}
		return result
	}, [body, fronts])

	useEffect(
		() => () => {
			for (const material of Object.values(materials)) material.dispose()
		},
		[materials],
	)
	return materials
}

function edgeColor(doc: DesignDocument, material: PartMaterial): string {
	const name = material === 'fronts' ? doc.materials.fronts : doc.materials.body
	const color = MATERIALS[name].color
	return mix(color, SCENE_COLORS.shadow, luminance(color) > 0.5 ? 0.35 : 0.5)
}

const center = (box: Box): [number, number, number] => [
	box.x + box.w / 2,
	box.y + box.h / 2,
	box.z + box.d / 2,
]

function PartMesh({
	part,
	doc,
	material,
	materials,
	onPick,
}: {
	part: Part
	doc: DesignDocument
	material: THREE.Material
	materials: Record<PartMaterial, THREE.MeshStandardMaterial>
	onPick?: (event: ThreeEvent<MouseEvent>) => void
}) {
	const { box, cylinder } = geometries()
	const isRod = part.kind === 'rod'
	return (
		<>
			<mesh
				geometry={isRod ? cylinder : box}
				material={material}
				position={center(part.box)}
				scale={[part.box.w, part.box.h, part.box.d]}
				castShadow
				receiveShadow
				onClick={onPick}
			>
				{!isRod && (
					<Edges threshold={20} color={edgeColor(doc, part.material)} transparent opacity={0.55} />
				)}
			</mesh>
			{part.handle && (
				<mesh
					geometry={box}
					material={materials.metal}
					position={center(part.handle)}
					scale={[part.handle.w, part.handle.h, part.handle.d]}
					castShadow
				/>
			)}
			{part.tray && (
				<mesh
					geometry={box}
					material={materials.inner}
					position={center(part.tray)}
					scale={[part.tray.w, part.tray.h, part.tray.d]}
					receiveShadow
				/>
			)}
		</>
	)
}

/** Moves a front between closed (0) and open (1) every frame without React renders. */
function MovingPart({
	part,
	progress,
	children,
}: {
	part: Part
	progress: RefObject<number>
	children: React.ReactNode
}) {
	const group = useRef<THREE.Group>(null)
	const motion = part.motion

	useFrame(() => {
		const node = group.current
		if (!node || !motion) return
		const t = progress.current
		if (motion.type === 'hinge') node.rotation.y = motion.direction * t * (Math.PI * 0.52)
		if (motion.type === 'slide') node.position.z = t * motion.distance
		if (motion.type === 'fade') node.visible = t < 0.5
	})

	if (motion?.type === 'hinge') {
		return (
			<group ref={group} position={[motion.pivotX, 0, motion.pivotZ]}>
				<group position={[-motion.pivotX, 0, -motion.pivotZ]}>{children}</group>
			</group>
		)
	}
	return <group ref={group}>{children}</group>
}

function Progress({ open, progress }: { open: boolean; progress: RefObject<number> }) {
	useFrame((_, delta) => {
		const target = open ? 1 : 0
		progress.current += (target - progress.current) * Math.min(1, delta * 5)
	})
	return null
}

/** Billboard label in mm; drawn on top so dimensions never hide behind the model. */
function Label({
	position,
	text,
	height,
	foreground,
	background,
}: {
	position: THREE.Vector3Tuple
	text: string
	height: number
	foreground: string
	background: string
}) {
	const label = useMemo(
		() => labelTexture(text, foreground, background),
		[text, foreground, background],
	)
	if (!label) return null
	return (
		<sprite position={position} scale={[height * label.aspect, height, 1]} renderOrder={10}>
			<spriteMaterial map={label.texture} depthTest={false} transparent />
		</sprite>
	)
}

function Selection({
	layout,
	selectedId,
	depth,
	labelSize,
}: {
	layout: Layout
	selectedId: string
	depth: number
	labelSize: number
}) {
	const entry = layout.nodes.get(selectedId)
	const outline = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), [])
	useEffect(() => () => outline.dispose(), [outline])
	if (!entry) return null
	const { rect } = entry
	const box: Box = { x: rect.x, y: rect.y, z: BACK, w: rect.w, h: rect.h, d: depth - BACK }
	return (
		<group>
			<lineSegments
				geometry={outline}
				position={center(box)}
				scale={[box.w + 4, box.h + 4, box.d + 4]}
			>
				<lineBasicMaterial color={SCENE_COLORS.line} />
			</lineSegments>
			<mesh position={center(box)} scale={[box.w, box.h, box.d]} raycast={() => null}>
				<boxGeometry />
				<meshBasicMaterial
					color={SCENE_COLORS.line}
					transparent
					opacity={0.08}
					depthWrite={false}
				/>
			</mesh>
			<Label
				position={[rect.x + rect.w / 2, rect.y + rect.h / 2, depth]}
				text={`${NUMBER.format(Math.round(rect.w))} × ${NUMBER.format(Math.round(rect.h))}`}
				height={labelSize}
				foreground={SCENE_COLORS.light}
				background={SCENE_COLORS.line}
			/>
		</group>
	)
}

function Dimension({
	from,
	to,
	label,
	labelSize,
}: {
	from: THREE.Vector3Tuple
	to: THREE.Vector3Tuple
	label: number
	labelSize: number
}) {
	const mid: THREE.Vector3Tuple = [
		(from[0] + to[0]) / 2,
		(from[1] + to[1]) / 2,
		(from[2] + to[2]) / 2,
	]
	return (
		<group>
			<Line points={[from, to]} color={SCENE_COLORS.line} lineWidth={1.2} />
			<Label
				position={mid}
				text={NUMBER.format(Math.round(label))}
				height={labelSize}
				foreground={SCENE_COLORS.line}
				background={SCENE_COLORS.light}
			/>
		</group>
	)
}

function Dimensions({
	doc,
	layout,
	labelSize,
}: {
	doc: DesignDocument
	layout: Layout
	labelSize: number
}) {
	const { width: w, height: h, depth: d } = doc.size
	const o = labelSize * 1.25
	const root = doc.layout
	const sections =
		root.kind === 'split' && root.axis === 'x'
			? root.children.flatMap((child) => {
					const rect = layout.nodes.get(child.node.id)?.rect
					return rect ? [rect] : []
				})
			: []
	return (
		<group>
			<Dimension from={[0, h + o * 2, d]} to={[w, h + o * 2, d]} label={w} labelSize={labelSize} />
			<Dimension from={[-o, 0, d]} to={[-o, h, d]} label={h} labelSize={labelSize} />
			<Dimension from={[w + o, 0, 0]} to={[w + o, 0, d]} label={d} labelSize={labelSize} />
			{sections.map((rect) => (
				<Dimension
					key={rect.x}
					from={[rect.x, h + o, d]}
					to={[rect.x + rect.w, h + o, d]}
					label={rect.w}
					labelSize={labelSize * 0.85}
				/>
			))}
		</group>
	)
}

function Model({
	document: doc,
	selectedId,
	onSelect,
	open = false,
	showDimensions = true,
}: DesignSceneProps) {
	const layout = useMemo(() => computeLayout(doc), [doc])
	const parts = useMemo(() => buildParts(doc, layout), [doc, layout])
	const materials = useMaterials(doc)
	const progress = useRef(0)
	const labelSize = Math.max(doc.size.width, doc.size.height) * 0.046
	const { box } = geometries()
	const hitMaterial = useMemo(
		() => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
		[],
	)
	useEffect(() => () => hitMaterial.dispose(), [hitMaterial])

	const pick = (id: string | undefined) => (event: ThreeEvent<MouseEvent>) => {
		if (!onSelect) return
		event.stopPropagation()
		onSelect(id ?? doc.layout.id)
	}

	return (
		<group scale={MM} position={[(-doc.size.width / 2) * MM, 0, (-doc.size.depth / 2) * MM]}>
			<Progress open={open} progress={progress} />
			{parts.map((part) => {
				const mesh = (
					<PartMesh
						key={part.key}
						part={part}
						doc={doc}
						material={materials[part.material]}
						materials={materials}
						onPick={pick(part.nodeId)}
					/>
				)
				return part.motion ? (
					<MovingPart key={part.key} part={part} progress={progress}>
						{mesh}
					</MovingPart>
				) : (
					mesh
				)
			})}
			{onSelect &&
				layout.order.map((id) => {
					const entry = layout.nodes.get(id)
					if (entry?.node.kind !== 'cell') return null
					const { rect } = entry
					return (
						<mesh
							key={`hit-${id}`}
							geometry={box}
							material={hitMaterial}
							position={[rect.x + rect.w / 2, rect.y + rect.h / 2, (doc.size.depth + BACK) / 2]}
							scale={[rect.w, rect.h, doc.size.depth - BACK - 30]}
							onClick={pick(id)}
						/>
					)
				})}
			{selectedId && (
				<Selection
					layout={layout}
					selectedId={selectedId}
					depth={doc.size.depth}
					labelSize={labelSize}
				/>
			)}
			{showDimensions && <Dimensions doc={doc} layout={layout} labelSize={labelSize} />}
		</group>
	)
}

const ANIMATION_SECONDS = 0.45
const reducedMotion = () =>
	typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Puts the camera at the requested view; glides there unless the user prefers reduced motion. */
function CameraRig({
	width,
	height,
	depth,
	view,
}: {
	width: number
	height: number
	depth: number
	view: { name: CameraView; key: number }
}) {
	const camera = useThree((state) => state.camera)
	const canvas = useThree((state) => state.size)
	const controls = useThree((state) => state.controls) as { update?: () => void } | null
	const flight = useRef<{ from: THREE.Vector3; to: THREE.Vector3; t: number } | null>(null)
	const lastKey = useRef<number | null>(null)
	// The first frames can report a 0×0 canvas: an aspect of 0 would put the camera at infinity
	const aspect = canvas.width > 0 && canvas.height > 0 ? canvas.width / canvas.height : null

	// biome-ignore lint/correctness/useExhaustiveDependencies: refit on canvas shape and view requests, not on every size edit
	useEffect(() => {
		if (aspect === null) return
		const size = { width, height, depth }
		const to = new THREE.Vector3(
			...cameraPosition(view.name, size, [0, height / 2, 0], FOV, aspect),
		)
		// Glide only when the user picked a view; a resize or the first placement jumps straight there
		const requested = lastKey.current !== null && lastKey.current !== view.key
		lastKey.current = view.key
		if (!requested || reducedMotion()) {
			flight.current = null
			camera.position.copy(to)
			controls?.update?.()
			return
		}
		flight.current = { from: camera.position.clone(), to, t: 0 }
	}, [aspect, camera, controls, view.key, view.name])

	useFrame((_, delta) => {
		const current = flight.current
		if (!current) return
		current.t = Math.min(current.t + delta / ANIMATION_SECONDS, 1)
		const eased = 1 - (1 - current.t) ** 3
		camera.position.lerpVectors(current.from, current.to, eased)
		controls?.update?.()
		if (current.t === 1) flight.current = null
	})
	return null
}

const DEFAULT_VIEW = { name: 'iso', key: 0 } as const

export function DesignScene(props: DesignSceneProps) {
	const { width, height, depth } = props.document.size
	const span = Math.max(width, height, depth) * MM
	const target: THREE.Vector3Tuple = [0, (height / 2) * MM, 0]
	const size = { width: width * MM, height: height * MM, depth: depth * MM }
	const distance = Math.hypot(...cameraPosition('iso', size, [0, 0, 0], FOV, 1.3))
	const [lost, setLost] = useState(false)
	const { onRenderError } = props

	return (
		<div className={cn('relative size-full touch-none', props.className)}>
			<Canvas
				shadows
				dpr={[1, 2]}
				camera={{
					position: [distance * 0.4, target[1], distance * 0.9],
					fov: FOV,
					near: 0.05,
					far: 60,
				}}
				onPointerMissed={() => props.onSelect?.(null)}
				onCreated={({ gl }) => {
					gl.domElement.addEventListener('webglcontextlost', (event) => {
						event.preventDefault()
						setLost(true)
						onRenderError?.()
					})
				}}
			>
				<hemisphereLight args={[SCENE_COLORS.skyLight, SCENE_COLORS.groundLight, 1.1]} />
				<directionalLight
					position={[span * -1.2, span * 2, span * 1.8]}
					intensity={1.8}
					castShadow
					shadow-mapSize={[2048, 2048]}
					shadow-bias={-0.0004}
					shadow-camera-left={-span}
					shadow-camera-right={span}
					shadow-camera-top={span * 1.4}
					shadow-camera-bottom={-span * 0.2}
				/>
				<directionalLight position={[span * 1.5, span, span * 0.5]} intensity={0.45} />
				<CameraRig
					width={size.width}
					height={size.height}
					depth={size.depth}
					view={props.view ?? DEFAULT_VIEW}
				/>
				<Model {...props} />
				<ContactShadows
					position={[0, 0, 0]}
					scale={span * 3}
					blur={2.4}
					opacity={0.45}
					far={span}
				/>
				<OrbitControls
					makeDefault
					target={target}
					enablePan={false}
					minDistance={distance * 0.35}
					maxDistance={distance * 3}
					// Top view sits on the pole; below the floor makes no sense
					maxPolarAngle={Math.PI * 0.5}
				/>
			</Canvas>
			{lost && <div className="absolute inset-0 bg-background/60" aria-hidden />}
		</div>
	)
}
