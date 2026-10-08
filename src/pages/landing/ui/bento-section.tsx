import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion/react'
import type * as React from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Camera, Image, Link, MapPin } from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import { Heading, Text } from '@/shared/ui/typography'
import { EASE_OUT, Reveal, SectionLabel } from './reveal'

export function BentoSection() {
	const { t } = useTranslation()

	return (
		<section id="why" className="border-t bg-muted/40">
			<div className="page-container py-16 sm:py-20 lg:py-28">
				<Reveal className="mb-12 flex max-w-2xl flex-col gap-4">
					<SectionLabel>{t('landing.bento.label')}</SectionLabel>
					<Heading size="h1">{t('landing.bento.title')}</Heading>
				</Reveal>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
					<Tile
						className="sm:col-span-2 lg:col-span-4"
						index={0}
						title={t('landing.bento.sources.title')}
						text={t('landing.bento.sources.text')}
					>
						<SourcesDemo />
					</Tile>
					<Tile
						className="lg:col-span-2"
						index={1}
						title={t('landing.bento.live.title')}
						text={t('landing.bento.live.text')}
					>
						<ResizeDemo />
					</Tile>
					<Tile
						className="lg:col-span-2"
						index={2}
						title={t('landing.bento.compare.title')}
						text={t('landing.bento.compare.text')}
					>
						<CompareDemo />
					</Tile>
					<Tile
						className="lg:col-span-2"
						index={3}
						title={t('landing.bento.local.title')}
						text={t('landing.bento.local.text')}
					>
						<LocalDemo />
					</Tile>
					<Tile
						className="lg:col-span-2"
						index={4}
						title={t('landing.bento.languages.title')}
						text={t('landing.bento.languages.text')}
					>
						<LanguagesDemo />
					</Tile>
					<Tile
						className="sm:col-span-2 lg:col-span-6"
						index={5}
						title={t('landing.bento.status.title')}
						text={t('landing.bento.status.text')}
					>
						<StatusDemo />
					</Tile>
				</div>
			</div>
		</section>
	)
}

type TileProps = {
	className?: string
	index: number
	title: string
	text: string
	children: React.ReactNode
}

function Tile({ className, index, title, text, children }: TileProps) {
	return (
		<motion.article
			className={cn('flex flex-col overflow-hidden rounded-3xl border bg-card', className)}
			initial={{ opacity: 0, y: 32, scale: 0.97 }}
			whileInView={{ opacity: 1, y: 0, scale: 1 }}
			viewport={{ once: true, margin: '0px 0px -10% 0px' }}
			transition={{ duration: 0.7, delay: (index % 3) * 0.1, ease: EASE_OUT }}
		>
			<div className="relative flex min-h-32 flex-1 items-center justify-center overflow-hidden bg-blueprint p-4 sm:min-h-40 sm:p-6">
				{children}
			</div>
			<div className="flex flex-col gap-1 border-t p-5 sm:p-6">
				<h3 className="text-h4">{title}</h3>
				<Text size="sm" tone="muted">
					{text}
				</Text>
			</div>
		</motion.article>
	)
}

function SourcesDemo() {
	const { t } = useTranslation()
	const sources = [
		{ icon: <Link />, label: t('landing.bento.sources.link') },
		{ icon: <Image />, label: t('landing.bento.sources.screenshot') },
		{ icon: <Camera />, label: t('landing.bento.sources.photo') },
	]

	return (
		<div className="flex w-full max-w-md items-center justify-between gap-4">
			<div className="flex flex-col gap-2.5">
				{sources.map((source) => (
					<span
						key={source.label}
						className="flex items-center gap-2 rounded-full border bg-card px-2.5 py-1 text-caption shadow-sm sm:px-3 sm:py-1.5 sm:text-body-sm [&_svg]:size-4 [&_svg]:text-primary"
					>
						{source.icon}
						{source.label}
					</span>
				))}
			</div>
			<svg
				viewBox="0 0 100 120"
				className="h-28 flex-1 fill-none stroke-primary"
				aria-hidden="true"
			>
				{[18, 60, 102].map((y) => (
					<path
						key={y}
						d={`M0 ${y} C 50 ${y}, 50 60, 100 60`}
						strokeWidth={1.5}
						strokeDasharray="4 4"
						className="animate-dash-flow"
					/>
				))}
			</svg>
			<span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
				<Box className="size-7" />
			</span>
		</div>
	)
}

function ResizeDemo() {
	const width = useMotionValue(1200)
	const scaleX = useTransform(width, [600, 2400], [0.35, 1])
	const label = useTransform(width, (value) => `${Math.round(value / 10) * 10}`)

	useEffect(() => {
		const controls = animate(width, [1200, 2000, 900, 1200], {
			duration: 6,
			repeat: Number.POSITIVE_INFINITY,
			ease: 'easeInOut',
		})
		return () => controls.stop()
	}, [width])

	return (
		<div className="flex w-full flex-col items-center gap-3">
			<motion.span className="text-caption text-primary tabular-nums">{label}</motion.span>
			<motion.div
				className="grid h-24 w-full max-w-48 grid-cols-2 gap-px rounded-sm border-2 border-primary bg-primary/30"
				style={{ scaleX }}
			>
				<span className="bg-card" />
				<span className="bg-card" />
			</motion.div>
		</div>
	)
}

const PRICES = [72, 58, 86]

function CompareDemo() {
	return (
		<div className="flex h-28 w-full max-w-48 items-end justify-center gap-4">
			{PRICES.map((height, index) => (
				<motion.span
					key={height}
					className={cn('w-10 rounded-t-lg', index === 1 ? 'bg-primary' : 'bg-secondary')}
					initial={{ height: 0 }}
					whileInView={{ height: `${height}%` }}
					viewport={{ once: true }}
					transition={{ duration: 0.8, delay: 0.2 + index * 0.15, ease: EASE_OUT }}
				/>
			))}
		</div>
	)
}

const DOTS = [
	{ left: '22%', top: '35%' },
	{ left: '62%', top: '25%' },
	{ left: '45%', top: '62%' },
	{ left: '78%', top: '58%' },
]

function LocalDemo() {
	return (
		<div className="relative h-32 w-full max-w-56">
			{DOTS.map((dot, index) => (
				<span key={dot.left} className="absolute" style={dot}>
					<span
						className="absolute inline-flex size-3 animate-ping-slow rounded-full bg-primary/50"
						style={{ animationDelay: `${index * 0.5}s` }}
					/>
					<span className="relative inline-flex size-3 rounded-full bg-primary ring-4 ring-card" />
				</span>
			))}
			<MapPin className="absolute top-[42%] left-[44%] size-8 -translate-x-1/2 -translate-y-full text-foreground" />
		</div>
	)
}

const GREETINGS = ['Сәлем', 'Привет']

function LanguagesDemo() {
	const [index, setIndex] = useState(0)

	useEffect(() => {
		const id = setInterval(() => setIndex((value) => (value + 1) % GREETINGS.length), 1800)
		return () => clearInterval(id)
	}, [])

	return (
		<div className="relative h-14 w-full overflow-hidden text-center">
			<AnimatePresence mode="popLayout">
				<motion.span
					key={GREETINGS[index]}
					className="absolute inset-x-0 text-h1 text-primary"
					initial={{ y: '100%', opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: '-100%', opacity: 0 }}
					transition={{ duration: 0.5, ease: EASE_OUT }}
				>
					{GREETINGS[index]}
				</motion.span>
			</AnimatePresence>
		</div>
	)
}

const STATUSES = ['accepted', 'inProgress', 'ready', 'delivered'] as const

function StatusDemo() {
	const { t } = useTranslation()
	const [active, setActive] = useState(0)

	useEffect(() => {
		const id = setInterval(() => setActive((value) => (value + 1) % STATUSES.length), 1400)
		return () => clearInterval(id)
	}, [])

	return (
		<ol className="flex w-full max-w-3xl items-center">
			{STATUSES.map((status, index) => {
				const reached = index <= active
				return (
					<li key={status} className="flex flex-1 items-center last:flex-none">
						<div className="flex flex-col items-center gap-2">
							<motion.span
								className={cn(
									'flex size-8 items-center justify-center rounded-full border-2 text-body-sm font-semibold sm:size-9',
									reached
										? 'border-primary bg-primary text-primary-foreground'
										: 'border-border bg-card text-muted-foreground',
								)}
								animate={{ scale: index === active ? 1.12 : 1 }}
							>
								{index + 1}
							</motion.span>
							<span
								className={cn(
									'max-w-16 text-center text-caption leading-tight sm:max-w-none sm:whitespace-nowrap',
									reached ? 'text-foreground' : 'text-muted-foreground',
								)}
							>
								{t(`landing.bento.status.${status}`)}
							</span>
						</div>
						{index < STATUSES.length - 1 && (
							<span className="mx-2 mb-6 h-0.5 flex-1 overflow-hidden rounded-full bg-border">
								<motion.span
									className="block h-full origin-left bg-primary"
									animate={{ scaleX: index < active ? 1 : 0 }}
									transition={{ duration: 0.5 }}
								/>
							</span>
						)}
					</li>
				)
			})}
		</ol>
	)
}
