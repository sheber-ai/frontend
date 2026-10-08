import {
	animate,
	type MotionValue,
	motion,
	useMotionValue,
	useMotionValueEvent,
	useSpring,
	useTransform,
} from 'motion/react'
import type * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	DEFAULT_SKETCH,
	SKETCH_LIMITS,
	WardrobeDrawing,
	type WardrobeSketch,
} from '@/entities/furniture'
import { ChevronsLeftRight, MATERIALS, type MaterialName, Sparkles } from '@/shared/design'
import { cn } from '@/shared/lib/utils'

const DEMO: Omit<WardrobeSketch, 'depth'>[] = [
	{ width: 120, height: 200, sections: 2, material: 'oak' },
	{ width: 190, height: 220, sections: 3, material: 'walnut' },
	{ width: 80, height: 180, sections: 1, material: 'ivory' },
	{ width: 160, height: 210, sections: 4, material: 'sage' },
]
const DEMO_INTERVAL = 2800
const MATERIAL_NAMES = Object.keys(MATERIALS) as MaterialName[]

export function Configurator() {
	const { t } = useTranslation()
	const [sketch, setSketch] = useState<WardrobeSketch>(DEFAULT_SKETCH)
	const [touched, setTouched] = useState(false)
	const shown = useAnimatedSketch(sketch)
	const split = useSplitHint(touched)

	useEffect(() => {
		if (touched) return
		let index = 0
		const id = setInterval(() => {
			index = (index + 1) % DEMO.length
			setSketch((current) => ({ ...current, ...DEMO[index] }))
		}, DEMO_INTERVAL)
		return () => clearInterval(id)
	}, [touched])

	const update = (patch: Partial<WardrobeSketch>) => {
		setTouched(true)
		setSketch((current) => ({ ...current, ...patch }))
	}

	return (
		<div className="flex flex-col gap-3">
			<p className="flex items-center gap-2 text-body-sm text-muted-foreground [&_svg]:size-4 [&_svg]:text-primary">
				<Sparkles />
				{t('landing.configurator.tryIt')}
			</p>

			<div className="overflow-hidden rounded-3xl border bg-card shadow-xl shadow-foreground/5 sm:rounded-[2rem]">
				<SplitStage split={split} onTouch={() => setTouched(true)} showHint={!touched}>
					<WardrobeDrawing sketch={shown} mode="model" className="absolute inset-0" />
					<WardrobeDrawing sketch={shown} mode="blueprint" className="absolute inset-0" />
				</SplitStage>

				<div className="grid grid-cols-1 gap-x-8 gap-y-4 border-t p-4 sm:grid-cols-2 sm:gap-y-5 sm:p-6">
					<RangeControl
						label={t('landing.configurator.width')}
						value={sketch.width}
						limits={SKETCH_LIMITS.width}
						unit={t('landing.configurator.mm')}
						onChange={(width) => update({ width })}
					/>
					<RangeControl
						label={t('landing.configurator.height')}
						value={sketch.height}
						limits={SKETCH_LIMITS.height}
						unit={t('landing.configurator.mm')}
						onChange={(height) => update({ height })}
					/>
					<Field label={t('landing.configurator.sections')}>
						<div className="grid grid-cols-4 gap-1 rounded-lg bg-muted p-1">
							{[1, 2, 3, 4].map((sections) => (
								<button
									key={sections}
									type="button"
									aria-pressed={sketch.sections === sections}
									onClick={() => update({ sections })}
									className={cn(
										'h-8 rounded-md text-body-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
										sketch.sections === sections && 'bg-card text-foreground shadow-xs',
									)}
								>
									{sections}
								</button>
							))}
						</div>
					</Field>
					<Field
						label={t('landing.configurator.material')}
						value={t(`landing.materials.${sketch.material}`)}
					>
						<div className="flex flex-wrap gap-2">
							{MATERIAL_NAMES.map((material) => (
								<button
									key={material}
									type="button"
									aria-label={t(`landing.materials.${material}`)}
									aria-pressed={sketch.material === material}
									title={t(`landing.materials.${material}`)}
									onClick={() => update({ material })}
									className={cn(
										'size-8 rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-card transition-transform hover:scale-110',
										sketch.material === material && 'ring-primary',
									)}
									style={{ background: MATERIALS[material].color }}
								/>
							))}
						</div>
					</Field>
				</div>
			</div>
		</div>
	)
}

/** Springs width/height so the drawing morphs instead of jumping. */
function useAnimatedSketch(sketch: WardrobeSketch): WardrobeSketch {
	const width = useSpring(sketch.width, { stiffness: 160, damping: 22 })
	const height = useSpring(sketch.height, { stiffness: 160, damping: 22 })
	const [size, setSize] = useState({ width: sketch.width, height: sketch.height })

	useEffect(() => width.set(sketch.width), [width, sketch.width])
	useEffect(() => height.set(sketch.height), [height, sketch.height])
	useMotionValueEvent(width, 'change', (value) =>
		setSize((current) => ({ ...current, width: value })),
	)
	useMotionValueEvent(height, 'change', (value) =>
		setSize((current) => ({ ...current, height: value })),
	)

	return { ...sketch, ...size }
}

/** Divider position in percent; sways once to hint that it can be dragged. */
function useSplitHint(touched: boolean) {
	const split = useMotionValue(50)

	useEffect(() => {
		if (touched) return
		const controls = animate(split, [50, 28, 72, 50], {
			duration: 3.2,
			delay: 1.2,
			ease: 'easeInOut',
		})
		return () => controls.stop()
	}, [split, touched])

	return split
}

type StageProps = {
	split: MotionValue<number>
	onTouch: () => void
	showHint: boolean
	children: [React.ReactNode, React.ReactNode]
}

function SplitStage({ split, onTouch, showHint, children }: StageProps) {
	const { t } = useTranslation()
	const stage = useRef<HTMLDivElement>(null)
	const clipPath = useTransform(split, (value) => `inset(0 0 0 ${value}%)`)
	const left = useTransform(split, (value) => `${value}%`)
	const [model, blueprint] = children
	const [splitValue, setSplitValue] = useState(50)
	useMotionValueEvent(split, 'change', (value) => setSplitValue(Math.round(value)))

	const moveTo = (clientX: number) => {
		const rect = stage.current?.getBoundingClientRect()
		if (!rect) return
		split.set(Math.min(95, Math.max(5, ((clientX - rect.left) / rect.width) * 100)))
	}

	const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		onTouch()
		event.currentTarget.setPointerCapture(event.pointerId)
		moveTo(event.clientX)
	}

	const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		const step = event.key === 'ArrowLeft' ? -5 : event.key === 'ArrowRight' ? 5 : 0
		if (!step) return
		event.preventDefault()
		onTouch()
		split.set(Math.min(95, Math.max(5, split.get() + step)))
	}

	return (
		<div
			ref={stage}
			className="relative aspect-[4/5] cursor-ew-resize touch-pan-y bg-blueprint select-none sm:aspect-square lg:aspect-[5/4]"
			onPointerDown={onPointerDown}
			onPointerMove={(event) => event.buttons > 0 && moveTo(event.clientX)}
		>
			{model}
			<motion.div className="absolute inset-0 bg-card/70 backdrop-blur-[1px]" style={{ clipPath }}>
				{blueprint}
			</motion.div>

			{showHint && (
				<motion.span
					className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-caption whitespace-nowrap text-background shadow-lg [&_svg]:size-3.5"
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.8 }}
				>
					<ChevronsLeftRight />
					{t('landing.configurator.dragHint')}
				</motion.span>
			)}
			<StageLabel className="left-3 sm:left-4">{t('landing.configurator.model')}</StageLabel>
			<StageLabel className="right-3 sm:right-4">{t('landing.configurator.blueprint')}</StageLabel>

			<motion.div className="absolute inset-y-0 w-px bg-primary" style={{ left }}>
				<div
					role="slider"
					tabIndex={0}
					aria-label={t('landing.configurator.split')}
					aria-valuemin={5}
					aria-valuemax={95}
					aria-valuenow={splitValue}
					onKeyDown={onKeyDown}
					className="absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-card outline-none focus-visible:ring-ring"
				>
					<ChevronsLeftRight className="size-5" />
				</div>
			</motion.div>
		</div>
	)
}

function StageLabel({ className, children }: { className: string; children: React.ReactNode }) {
	return (
		<span
			className={cn(
				'pointer-events-none absolute top-3 rounded-full border bg-card/90 px-2.5 py-1 text-caption tracking-wider text-muted-foreground uppercase backdrop-blur sm:top-4 sm:px-3 sm:tracking-widest',
				className,
			)}
		>
			{children}
		</span>
	)
}

function Field({
	label,
	value,
	children,
}: {
	label: string
	value?: string
	children: React.ReactNode
}) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-baseline justify-between gap-2 text-body-sm">
				<span className="text-muted-foreground">{label}</span>
				{value && <span className="font-medium">{value}</span>}
			</div>
			{children}
		</div>
	)
}

type RangeProps = {
	label: string
	value: number
	limits: { min: number; max: number; step: number }
	unit: string
	onChange: (value: number) => void
}

function RangeControl({ label, value, limits, unit, onChange }: RangeProps) {
	const { i18n } = useTranslation()
	return (
		<Field label={label} value={`${(value * 10).toLocaleString(i18n.language)} ${unit}`}>
			<input
				type="range"
				aria-label={label}
				min={limits.min}
				max={limits.max}
				step={limits.step}
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
				className="h-8 w-full cursor-pointer accent-primary"
			/>
		</Field>
	)
}
