import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { MATERIALS, SCENE_COLORS } from '@/shared/design'
import {
	CABINET_LIMITS,
	type CabinetParams,
	PANEL_THICKNESS,
	PLINTH_HEIGHT,
} from '../model/cabinet'

// Shared unit geometries: parts are resized via scale, so params can change every frame for free.
// Created lazily so importing this module has no side effects (keeps three.js tree-shakable).
let unitGeometries: { box: THREE.BoxGeometry; edges: THREE.EdgesGeometry } | undefined
function getUnitGeometries() {
	if (!unitGeometries) {
		const box = new THREE.BoxGeometry(1, 1, 1)
		unitGeometries = { box, edges: new THREE.EdgesGeometry(box) }
	}
	return unitGeometries
}
const DOOR_SWING = 1.9
const SHELF_KEYS = Array.from({ length: CABINET_LIMITS.maxShelves }, (_, index) => `shelf${index}`)
const CARCASS_KEYS = ['left', 'right', 'top', 'bottom', 'plinth', ...SHELF_KEYS] as const

type Props = {
	/** Called every frame, so animated scenes can pass a ref-backed getter. */
	getParams: () => CabinetParams
	edgeColor?: string
}

type Vec3 = [number, number, number]

export function Cabinet({ getParams, edgeColor = SCENE_COLORS.line }: Props) {
	const { box: unitBox, edges: unitEdges } = getUnitGeometries()
	const parts = useRef<Record<string, THREE.Object3D | null>>({})
	const hingeLeft = useRef<THREE.Group>(null)
	const hingeRight = useRef<THREE.Group>(null)

	const materials = useMemo(
		() => ({
			body: new THREE.MeshStandardMaterial({ roughness: 0.65 }),
			back: new THREE.MeshStandardMaterial({ roughness: 0.8 }),
			metal: new THREE.MeshStandardMaterial({
				color: SCENE_COLORS.metal,
				roughness: 0.35,
				metalness: 0.6,
			}),
			edges: new THREE.LineBasicMaterial({ color: edgeColor, transparent: true }),
		}),
		[edgeColor],
	)

	useEffect(
		() => () => {
			for (const material of Object.values(materials)) material.dispose()
		},
		[materials],
	)

	const targetColor = useMemo(() => new THREE.Color(), [])
	const backTint = useMemo(() => new THREE.Color(SCENE_COLORS.backPanel), [])

	const place = (key: string, position: Vec3, scale: Vec3, visible = true) => {
		const part = parts.current[key]
		if (!part) return
		part.visible = visible
		part.position.set(...position)
		part.scale.set(...scale)
	}

	useFrame((_, delta) => {
		const {
			width: w,
			height: h,
			depth: d,
			shelves,
			doorOpen,
			material,
			solidOpacity,
			edgeOpacity,
		} = getParams()
		const t = PANEL_THICKNESS
		const p = PLINTH_HEIGHT
		const bodyHeight = h - p
		const bodyCenter = p + bodyHeight / 2
		const innerHeight = bodyHeight - 2 * t

		place('left', [-w / 2 + t / 2, bodyCenter, 0], [t, bodyHeight, d])
		place('right', [w / 2 - t / 2, bodyCenter, 0], [t, bodyHeight, d])
		place('top', [0, h - t / 2, 0], [w - 2 * t, t, d])
		place('bottom', [0, p + t / 2, 0], [w - 2 * t, t, d])
		place('back', [0, bodyCenter, -d / 2 + 0.002], [w - 2 * t, bodyHeight - 2 * t, 0.004])
		place('plinth', [0, p / 2, -0.02], [w - 0.04, p, d - 0.06])
		SHELF_KEYS.forEach((key, index) => {
			const y = p + t + (innerHeight * (index + 1)) / (shelves + 1)
			place(key, [0, y, -0.01], [w - 2 * t, t, d - 0.03], index < shelves)
		})

		const doorWidth = w / 2 - 0.003
		const doorHeight = bodyHeight - 0.006
		hingeLeft.current?.position.set(-w / 2, bodyCenter, d / 2)
		hingeRight.current?.position.set(w / 2, bodyCenter, d / 2)
		if (hingeLeft.current) hingeLeft.current.rotation.y = -doorOpen * DOOR_SWING
		if (hingeRight.current) hingeRight.current.rotation.y = doorOpen * DOOR_SWING
		place('doorLeft', [doorWidth / 2, 0, t / 2], [doorWidth, doorHeight, t])
		place('doorRight', [-doorWidth / 2, 0, t / 2], [doorWidth, doorHeight, t])
		place('handleLeft', [doorWidth - 0.05, 0, t + 0.012], [0.012, 0.2, 0.02])
		place('handleRight', [-doorWidth + 0.05, 0, t + 0.012], [0.012, 0.2, 0.02])

		const finish = MATERIALS[material]
		const blend = 1 - Math.exp(-8 * delta)
		materials.body.color.lerp(targetColor.set(finish.color), blend)
		materials.body.roughness = finish.roughness
		materials.back.color.copy(materials.body.color).lerp(backTint, 0.55)

		const isTransparent = solidOpacity < 0.999
		for (const solid of [materials.body, materials.back, materials.metal]) {
			if (solid.transparent !== isTransparent) {
				solid.transparent = isTransparent
				solid.needsUpdate = true
			}
			solid.opacity = solidOpacity
			solid.depthWrite = solidOpacity > 0.5
			solid.visible = solidOpacity > 0.01
		}
		materials.edges.opacity = edgeOpacity
		materials.edges.visible = edgeOpacity > 0.01
	})

	const panel = (key: string, material: THREE.Material) => (
		<group
			key={key}
			ref={(node) => {
				parts.current[key] = node
			}}
		>
			<mesh geometry={unitBox} material={material} castShadow receiveShadow />
			<lineSegments geometry={unitEdges} material={materials.edges} />
		</group>
	)

	const handle = (key: string) => (
		<mesh
			key={key}
			ref={(node) => {
				parts.current[key] = node
			}}
			geometry={unitBox}
			material={materials.metal}
			castShadow
		/>
	)

	return (
		<group>
			{CARCASS_KEYS.map((key) => panel(key, materials.body))}
			{panel('back', materials.back)}
			<group ref={hingeLeft}>
				{panel('doorLeft', materials.body)}
				{handle('handleLeft')}
			</group>
			<group ref={hingeRight}>
				{panel('doorRight', materials.body)}
				{handle('handleRight')}
			</group>
		</group>
	)
}
