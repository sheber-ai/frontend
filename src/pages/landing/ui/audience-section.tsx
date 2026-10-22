import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DEFAULT_SKETCH, WardrobeDrawing } from '@/entities/furniture'
import { ArrowRight, Check, ChevronRight, Hammer, Star, User } from '@/shared/design'
import { revealTop } from '@/shared/lib/scroll'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Heading, Text } from '@/shared/ui/typography'
import { OFFERS, ORDERS } from '../model/mock'
import { useGetStarted } from '../model/use-get-started'
import { EASE_OUT, Reveal, SectionLabel } from './reveal'

const AUDIENCES = ['clients', 'workshops'] as const
type Audience = (typeof AUDIENCES)[number]

export function AudienceSection() {
	const { t } = useTranslation()
	const [audience, setAudience] = useState<Audience>('clients')
	const switcher = useRef<HTMLDivElement>(null)
	const isWorkshops = audience === 'workshops'

	const select = (item: Audience) => {
		setAudience(item)
		// On phones the panel is long: return to its start instead of leaving the user mid-way
		revealTop(switcher.current)
	}

	return (
		<section id="audience" className="page-container py-16 sm:py-20 lg:py-28">
			<Reveal className="mb-6 flex max-w-3xl flex-col gap-4 lg:mb-10">
				<SectionLabel>{t('landing.audience.label')}</SectionLabel>
				<Heading size="h1" className="text-balance">
					{t('landing.audience.title')}
				</Heading>
			</Reveal>

			<div
				ref={switcher}
				role="tablist"
				className="sticky top-16 z-20 -mx-4 grid grid-cols-2 gap-1 border-y bg-background/90 px-4 py-2 backdrop-blur-md sm:mx-0 sm:inline-grid sm:rounded-full sm:border sm:bg-card sm:p-1 lg:static lg:mb-6"
			>
				{AUDIENCES.map((item) => (
					<button
						key={item}
						type="button"
						role="tab"
						aria-selected={audience === item}
						onClick={() => select(item)}
						className={cn(
							'relative flex h-10 items-center justify-center gap-2 rounded-full px-4 text-body-sm font-medium transition-colors sm:px-5 [&_svg]:size-4',
							audience === item
								? 'text-primary-foreground'
								: 'text-muted-foreground hover:text-foreground',
						)}
					>
						{audience === item && (
							<motion.span
								layoutId="audience-pill"
								className="absolute inset-0 rounded-full bg-primary"
								transition={{ type: 'spring', stiffness: 380, damping: 32 }}
							/>
						)}
						<span className="relative flex items-center gap-2">
							{item === 'clients' ? <User /> : <Hammer />}
							{t(`landing.audience.${item}.tab`)}
						</span>
					</button>
				))}
			</div>

			<div
				className={cn(
					'mt-4 overflow-hidden rounded-3xl border bg-card text-card-foreground transition-colors duration-500 sm:mt-6 lg:mt-0 lg:rounded-[2rem]',
					isWorkshops && 'dark',
				)}
			>
				{/* Desktop: both panels share one cell, so switching never changes the height. Phones show only the active one. */}
				<div className="grid grid-cols-1">
					{AUDIENCES.map((item) => (
						<motion.div
							key={item}
							aria-hidden={item !== audience}
							inert={item !== audience}
							className={cn(
								'col-start-1 row-start-1 grid min-w-0 grid-cols-1 gap-8 p-5 sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-14',
								item !== audience && 'max-lg:hidden',
							)}
							initial={false}
							animate={{ opacity: item === audience ? 1 : 0, y: item === audience ? 0 : 12 }}
							transition={{ duration: 0.45, ease: EASE_OUT }}
						>
							<AudienceText audience={item} />
							{item === 'workshops' ? <WorkshopsMock /> : <ClientsMock />}
						</motion.div>
					))}
				</div>
			</div>
		</section>
	)
}

function AudienceText({ audience }: { audience: Audience }) {
	const getStarted = useGetStarted()
	const { t } = useTranslation()
	const points = (['p1', 'p2', 'p3', 'p4'] as const).map((key) =>
		t(`landing.audience.${audience}.${key}`),
	)

	return (
		<div className="flex min-w-0 flex-col items-start gap-5 sm:gap-6">
			<div className="flex flex-col gap-3">
				<Heading size="h2" className="text-balance">
					{t(`landing.audience.${audience}.title`)}
				</Heading>
				<Text tone="muted" className="sm:text-body-lg">
					{t(`landing.audience.${audience}.text`)}
				</Text>
			</div>
			<ul className="flex flex-col gap-3">
				{points.map((point, index) => (
					<motion.li
						key={point}
						className="flex items-start gap-3"
						initial={{ opacity: 0, x: -12 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.15 + index * 0.07, duration: 0.4 }}
					>
						<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
							<Check className="size-3.5" />
						</span>
						<span className="min-w-0 pt-0.5">{point}</span>
					</motion.li>
				))}
			</ul>
			<Button size="lg" className="mt-1 w-full sm:w-auto" onClick={() => getStarted(audience)}>
				{t(`landing.audience.${audience}.cta`)}
				<ArrowRight />
			</Button>
		</div>
	)
}

const MOCK_CARD =
	'min-w-0 rounded-2xl border bg-background p-3 shadow-xl shadow-foreground/5 sm:p-5'

function ClientsMock() {
	const { t, i18n } = useTranslation()
	const price = new Intl.NumberFormat(i18n.language)

	return (
		<div className={cn(MOCK_CARD, 'flex flex-col gap-4 self-center')}>
			<div className="flex items-center gap-3 sm:gap-4">
				<span className="size-14 shrink-0 rounded-xl bg-secondary p-1.5 sm:size-16">
					<WardrobeDrawing sketch={DEFAULT_SKETCH} mode="model" fit />
				</span>
				<div className="min-w-0">
					<p className="text-caption text-muted-foreground">
						{t('landing.audience.clients.mockTitle')}
					</p>
					<p className="truncate text-h4">{t('landing.how.orderTitle')}</p>
					<p className="text-caption text-muted-foreground tabular-nums">1 200 × 2 000 × 600</p>
				</div>
			</div>
			<p className="border-t pt-4 text-caption tracking-widest text-muted-foreground uppercase">
				{t('landing.audience.clients.mockOffers')}
			</p>
			<ul className="flex flex-col gap-2">
				{OFFERS.map((offer, index) => (
					<motion.li
						key={offer.workshop}
						className={cn(
							'flex items-center gap-2.5 rounded-xl border p-2.5 sm:gap-3 sm:p-3',
							index === 0 && 'border-primary bg-primary/5',
						)}
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2 + index * 0.1, duration: 0.4, ease: EASE_OUT }}
					>
						<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-body-sm font-semibold sm:size-9">
							{offer.workshop[0]}
						</span>
						<div className="min-w-0 flex-1">
							<p className="truncate text-body-sm font-medium">{offer.workshop}</p>
							<p className="flex items-center gap-1 text-caption text-muted-foreground">
								<Star className="size-3 fill-warning text-warning" />
								{offer.rating} · {t('landing.how.days', { count: offer.days })}
							</p>
						</div>
						<div className="flex shrink-0 flex-col items-end gap-1">
							<span className="text-body-sm font-semibold whitespace-nowrap tabular-nums">
								{price.format(offer.price)} ₸
							</span>
							{index === 0 && <Badge>{t('landing.audience.clients.mockChosen')}</Badge>}
						</div>
					</motion.li>
				))}
			</ul>
		</div>
	)
}

function WorkshopsMock() {
	const { t, i18n } = useTranslation()
	const price = new Intl.NumberFormat(i18n.language)

	return (
		<div className={cn(MOCK_CARD, 'flex flex-col gap-3 self-center')}>
			<p className="text-caption tracking-widest text-muted-foreground uppercase">
				{t('landing.audience.workshops.mockTitle')}
			</p>
			<ul className="flex flex-col gap-2">
				{ORDERS.map((order, index) => (
					<motion.li
						key={order.key}
						className="flex items-center gap-2.5 rounded-xl border p-2.5 sm:gap-3 sm:p-3"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2 + index * 0.1, duration: 0.4, ease: EASE_OUT }}
					>
						<span className="size-10 shrink-0 rounded-lg bg-secondary p-1 sm:size-12">
							<WardrobeDrawing
								sketch={{
									...DEFAULT_SKETCH,
									sections: index + 2,
									material: index === 1 ? 'ivory' : 'walnut',
								}}
								mode="blueprint"
								showDimensions={false}
								fit
							/>
						</span>
						<div className="min-w-0 flex-1">
							<p className="truncate text-body-sm font-medium">
								{t(`landing.audience.workshops.orders.${order.key}`)}
							</p>
							<p className="text-caption text-muted-foreground tabular-nums">
								{order.size} ·{' '}
								{t('landing.audience.workshops.mockBudget', { value: price.format(order.budget) })}
							</p>
						</div>
						<Button size="sm" variant="outline" tabIndex={-1} className="max-sm:hidden">
							{t('landing.audience.workshops.mockRespond')}
						</Button>
						<ChevronRight className="size-4 shrink-0 text-muted-foreground sm:hidden" />
					</motion.li>
				))}
			</ul>
		</div>
	)
}
