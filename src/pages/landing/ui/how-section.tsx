import { AnimatePresence, motion, useInView } from 'motion/react'
import type * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DEFAULT_SKETCH, WardrobeDrawing } from '@/entities/furniture'
import { BadgeCheck, Eye, Link, Star } from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import { Heading, Text } from '@/shared/ui/typography'
import { OFFERS } from '../model/mock'
import { EASE_OUT, Reveal, SectionLabel } from './reveal'

const STEPS = ['link', 'model', 'publish', 'offers'] as const
type Step = (typeof STEPS)[number]

export function HowSection() {
	const { t } = useTranslation()

	return (
		<section id="how" className="page-container py-16 sm:py-20 lg:py-28">
			<Reveal className="mb-10 flex max-w-3xl flex-col gap-4 lg:mb-14">
				<SectionLabel>{t('landing.how.label')}</SectionLabel>
				<Heading size="h1" className="text-balance">
					{t('landing.how.title')}
				</Heading>
			</Reveal>

			{/* Phones: swipeable row with the next card peeking in; larger screens: grid */}
			<ol className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4">
				{STEPS.map((step, index) => (
					<StepCard key={step} step={step} index={index} />
				))}
			</ol>
		</section>
	)
}

const DEMOS: Record<Step, React.FC<{ active: boolean }>> = {
	link: LinkDemo,
	model: ModelDemo,
	publish: PublishDemo,
	offers: OffersDemo,
}

function StepCard({ step, index }: { step: Step; index: number }) {
	const { t } = useTranslation()
	const ref = useRef<HTMLLIElement>(null)
	const active = useInView(ref, { amount: 0.4 })
	const Demo = DEMOS[step]

	return (
		<motion.li
			ref={ref}
			className="group flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border bg-card sm:w-auto"
			initial={{ opacity: 0, y: 32 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '0px 0px -10% 0px' }}
			transition={{ duration: 0.7, delay: index * 0.1, ease: EASE_OUT }}
		>
			<div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-blueprint p-5">
				<Demo active={active} />
			</div>
			<div className="flex flex-1 flex-col gap-2 border-t p-5 sm:p-6">
				<span className="text-caption text-primary tabular-nums">0{index + 1}</span>
				<h3 className="text-h3">{t(`landing.how.steps.${step}.title`)}</h3>
				<Text size="sm" tone="muted">
					{t(`landing.how.steps.${step}.text`)}
				</Text>
			</div>
		</motion.li>
	)
}

/** Ticks while `active`, so demos only run on screen. */
function useLoop(active: boolean, length: number, interval: number) {
	const [index, setIndex] = useState(0)
	useEffect(() => {
		if (!active) return
		const id = setInterval(() => setIndex((value) => (value + 1) % length), interval)
		return () => clearInterval(id)
	}, [active, length, interval])
	return index
}

const SOURCE_URL = 'kaspi.kz/shop/p/shkaf-1200'

function LinkDemo({ active }: { active: boolean }) {
	// Type the url, hold, then restart
	const tick = useLoop(active, SOURCE_URL.length + 12, 70)
	const typed = SOURCE_URL.slice(0, Math.min(tick, SOURCE_URL.length))

	return (
		<div className="w-full max-w-72 rounded-xl border bg-card p-2 shadow-lg">
			<div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-body-sm">
				<Link className="size-4 shrink-0 text-primary" />
				<span className="truncate">
					{typed}
					<span className="ml-px inline-block h-4 w-px translate-y-0.5 animate-pulse bg-foreground" />
				</span>
			</div>
		</div>
	)
}

function ModelDemo({ active }: { active: boolean }) {
	const blueprint = useLoop(active, 2, 1800) === 1

	return (
		<div className="relative size-full">
			<AnimatePresence initial={false}>
				<motion.div
					key={blueprint ? 'blueprint' : 'model'}
					className="absolute inset-0"
					initial={{ opacity: 0, scale: 0.96 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.6 }}
				>
					<WardrobeDrawing sketch={DEFAULT_SKETCH} mode={blueprint ? 'blueprint' : 'model'} fit />
				</motion.div>
			</AnimatePresence>
		</div>
	)
}

function PublishDemo({ active }: { active: boolean }) {
	const { t } = useTranslation()
	const tick = useLoop(active, 6, 700)
	const published = tick >= 2

	return (
		<div className="w-full max-w-72 rounded-xl border bg-card p-3 shadow-lg">
			<div className="flex items-center gap-3">
				<span className="size-12 shrink-0 rounded-lg bg-secondary p-1">
					<WardrobeDrawing sketch={DEFAULT_SKETCH} mode="model" fit />
				</span>
				<div className="min-w-0 flex-1">
					<p className="truncate text-body-sm font-medium">{t('landing.how.orderTitle')}</p>
					<p className="text-caption text-muted-foreground tabular-nums">1 200 × 2 000 × 600</p>
				</div>
			</div>
			<div className="mt-3 flex h-6 items-center justify-between border-t pt-3">
				<AnimatePresence>
					{published && (
						<motion.span
							className="flex items-center gap-1 text-caption font-medium text-success"
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0 }}
						>
							<BadgeCheck className="size-4" />
							{t('landing.how.published')}
						</motion.span>
					)}
				</AnimatePresence>
				<span className="ml-auto flex items-center gap-1 text-caption text-muted-foreground tabular-nums">
					<Eye className="size-3.5" />
					{published ? tick * 2 : 0}
				</span>
			</div>
		</div>
	)
}

function OffersDemo({ active }: { active: boolean }) {
	const { t, i18n } = useTranslation()
	const tick = useLoop(active, 6, 700)
	const price = new Intl.NumberFormat(i18n.language)

	return (
		<ul className="flex w-full max-w-72 flex-col gap-1.5">
			{OFFERS.map((offer, index) => (
				<motion.li
					key={offer.workshop}
					className={cn(
						'flex items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-sm transition-colors',
						tick >= 4 && index === 0 && 'border-primary ring-2 ring-primary/20',
					)}
					animate={{ opacity: tick > index ? 1 : 0, x: tick > index ? 0 : 16 }}
					transition={{ duration: 0.4, ease: EASE_OUT }}
				>
					<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-caption font-semibold">
						{offer.workshop[0]}
					</span>
					<span className="min-w-0 flex-1 truncate text-caption">{offer.workshop}</span>
					<span className="flex items-center gap-0.5 text-caption text-muted-foreground">
						<Star className="size-3 fill-warning text-warning" />
						{offer.rating}
					</span>
					<span className="text-caption font-semibold tabular-nums">
						{price.format(offer.price)} ₸
					</span>
				</motion.li>
			))}
			<li className="px-1 text-caption text-muted-foreground">
				{t('landing.how.offers')}: {Math.min(tick, OFFERS.length)}
			</li>
		</ul>
	)
}
