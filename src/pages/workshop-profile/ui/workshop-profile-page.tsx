import { Link, useCanGoBack, useRouter } from '@tanstack/react-router'
import type * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useViewer } from '@/entities/viewer'
import { WorkshopAvatar } from '@/entities/workshop'
import { AttachmentGallery } from '@/features/manage-attachments'
import { useListAttachments } from '@/shared/api/generated/endpoints/attachments/attachments'
import {
	useGetMyWorkshop,
	useGetWorkshop,
} from '@/shared/api/generated/endpoints/workshops/workshops'
import type { WorkshopProfileSchema } from '@/shared/api/generated/model'
import {
	ArrowLeft,
	BadgeCheck,
	Calendar,
	ClipboardList,
	ExternalLink,
	Factory,
	Hammer,
	Image,
	MapPin,
	MessageCircle,
	Pencil,
	Plus,
	ShieldCheck,
	Star,
	TriangleAlert,
} from '@/shared/design'
import { formatDate } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { Skeleton } from '@/shared/ui/skeleton'
import { WorkshopReviews } from './workshop-reviews'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="flex flex-col gap-3">
			<h2 className="text-h4">{title}</h2>
			{children}
		</section>
	)
}

function Tags({ items, empty }: { items: string[]; empty: string }) {
	if (items.length === 0) return <p className="text-body-sm text-muted-foreground">{empty}</p>
	return (
		<ul className="flex flex-wrap gap-2">
			{items.map((item) => (
				<li
					key={item}
					className="rounded-full bg-secondary px-3 py-1.5 text-body-sm text-secondary-foreground"
				>
					{item}
				</li>
			))}
		</ul>
	)
}

function Facts({ workshop }: { workshop: WorkshopProfileSchema }) {
	const { t, i18n } = useTranslation()
	const facts: { icon: React.ReactNode; text: string; muted?: boolean }[] = [
		{
			icon: <ClipboardList />,
			text:
				workshop.completedOrders > 0
					? t('workshopProfile.completed', { count: workshop.completedOrders })
					: t('workshopProfile.completedNone'),
			muted: workshop.completedOrders === 0,
		},
		{
			icon: <ShieldCheck />,
			text:
				workshop.warrantyMonths !== null && workshop.warrantyMonths > 0
					? t('workshopProfile.warranty', { count: workshop.warrantyMonths })
					: t('workshopProfile.noWarranty'),
			muted: !workshop.warrantyMonths,
		},
	]
	if (workshop.ratingAverage !== null && workshop.reviewsCount > 0)
		facts.unshift({
			icon: <Star />,
			text: `${t('reviews.average', {
				value: workshop.ratingAverage.toLocaleString(i18n.language, { maximumFractionDigits: 1 }),
			})} · ${t('reviews.count', { count: workshop.reviewsCount })}`,
		})
	if (workshop.foundedYear)
		facts.push({
			icon: <Hammer />,
			text: t('workshopProfile.founded', { year: workshop.foundedYear }),
		})
	if (workshop.verifiedAt)
		facts.push({
			icon: <BadgeCheck />,
			text: t('workshopProfile.verifiedOn', {
				date: formatDate(workshop.verifiedAt, i18n.language),
			}),
		})
	return (
		<ul className="flex flex-col gap-3">
			{facts.map((fact) => (
				<li
					key={fact.text}
					className={cn(
						'flex items-start gap-3 text-body-sm [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0',
						fact.muted && 'text-muted-foreground',
					)}
				>
					{fact.icon}
					{fact.text}
				</li>
			))}
		</ul>
	)
}

export function WorkshopProfilePage({ workshopId }: { workshopId: string }) {
	const { t } = useTranslation()
	const router = useRouter()
	const canGoBack = useCanGoBack()
	const { isAuthenticated, viewer } = useViewer()
	const { data: workshop, isPending, isError } = useGetWorkshop(workshopId)
	const { data: media } = useListAttachments(
		{ workshopId },
		{ query: { enabled: Boolean(workshop) } },
	)
	const logo = media?.items.find((item) => item.purpose === 'workshop_logo')
	const portfolio = media?.items.filter((item) => item.purpose === 'workshop_portfolio') ?? []
	const { data: mine } = useGetMyWorkshop({ query: { enabled: Boolean(viewer?.workshopStatus) } })
	const isMine = mine?.id === workshopId

	const back = canGoBack ? (
		<button
			type="button"
			onClick={() => router.history.back()}
			className="inline-flex w-fit items-center gap-1.5 text-body-sm text-muted-foreground hover:text-foreground"
		>
			<ArrowLeft className="size-4" />
			{t('workshopProfile.back')}
		</button>
	) : null

	if (isPending) {
		return (
			<main className="page-container flex flex-col gap-6 py-8">
				<Skeleton className="h-20 w-2/3" />
				<Skeleton className="h-64" />
			</main>
		)
	}

	if (isError || !workshop) {
		return (
			<main className="page-container flex flex-col gap-6 py-12">
				{back}
				<EmptyState
					icon={<TriangleAlert />}
					title={t('workshopProfile.notFound')}
					text={t('workshopProfile.notFoundText')}
				/>
			</main>
		)
	}

	return (
		<main className="page-container flex flex-col gap-8 py-6 sm:py-10">
			<div className="flex flex-col gap-4">
				{back}
				<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
					<div className="flex min-w-0 items-center gap-4">
						<WorkshopAvatar
							name={workshop.name}
							src={logo?.url}
							className="size-16 rounded-2xl text-h3 sm:size-20"
						/>
						<div className="flex min-w-0 flex-col gap-1.5">
							<h1 className="text-h2 text-balance sm:text-h1">{workshop.name}</h1>
							<p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-muted-foreground">
								<span className="inline-flex items-center gap-1.5">
									<MapPin className="size-4" />
									{workshop.city.name}
								</span>
								{workshop.serviceCities.length > 0 && (
									<span>
										{t('workshopProfile.alsoServes', {
											cities: workshop.serviceCities.map((city) => city.name).join(', '),
										})}
									</span>
								)}
								<span className="inline-flex items-center gap-1.5 text-success">
									<BadgeCheck className="size-4" />
									{t('workshopProfile.verified')}
								</span>
							</p>
						</div>
					</div>
					<div className="flex flex-col gap-2 sm:flex-row">
						{isMine && (
							<Button asChild variant="outline">
								<Link to="/workshop">
									<Pencil />
									{t('offer.edit')}
								</Link>
							</Button>
						)}
						{workshop.website && (
							<Button asChild variant="outline">
								<a href={workshop.website} target="_blank" rel="noreferrer noopener">
									{t('workshopProfile.website')}
									<ExternalLink />
								</a>
							</Button>
						)}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
				<div className="flex min-w-0 flex-col gap-8">
					<Section title={t('workshopProfile.about')}>
						{workshop.description ? (
							<p className="max-w-3xl text-body whitespace-pre-line">{workshop.description}</p>
						) : (
							<p className="text-body-sm text-muted-foreground">{t('workshopProfile.noAbout')}</p>
						)}
					</Section>
					<Section title={t('workshopProfile.makes')}>
						<Tags
							items={workshop.furnitureTypes.map((type) => t(`furnitureTypes.${type}`))}
							empty={t('workshopProfile.noData')}
						/>
					</Section>
					<div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
						<Section title={t('workshopProfile.services')}>
							<Tags
								items={workshop.services.map((service) => t(`workshopServices.${service}`))}
								empty={t('workshopProfile.noData')}
							/>
						</Section>
						<Section title={t('workshopProfile.materials')}>
							<Tags
								items={workshop.materials.map((material) => t(`workshopMaterials.${material}`))}
								empty={t('workshopProfile.noData')}
							/>
						</Section>
					</div>
					<Section
						title={
							portfolio.length > 0
								? `${t('workshopProfile.portfolio')} · ${t('workshopProfile.portfolioCount', { count: portfolio.length })}`
								: t('workshopProfile.portfolio')
						}
					>
						{portfolio.length > 0 ? (
							<AttachmentGallery
								purpose="workshop_portfolio"
								target={{ workshopId }}
								editable={false}
								captions
								ordered
								bare
							/>
						) : (
							<EmptyState
								icon={<Image />}
								title={t('workshopProfile.portfolioEmptyTitle')}
								text={t('workshopProfile.portfolioEmpty')}
								className="py-10"
							/>
						)}
					</Section>
					<WorkshopReviews workshop={workshop} />
				</div>

				<aside className="flex min-w-0 flex-col gap-6">
					<section className="flex flex-col gap-4 rounded-xl border bg-card p-5">
						<h2 className="text-h4">{t('workshopProfile.facts')}</h2>
						<Facts workshop={workshop} />
					</section>
					{!isMine && (
						<section className="flex flex-col gap-4 rounded-xl bg-secondary p-5 text-secondary-foreground">
							<h2 className="flex items-center gap-2 text-h4">
								<MessageCircle className="size-5" />
								{t('workshopProfile.contactTitle')}
							</h2>
							<p className="text-body-sm">{t('workshopProfile.contactText')}</p>
							<div className="flex flex-col gap-2">
								<Button asChild>
									<Link to="/projects/new">
										<Plus />
										{t('workshopProfile.createOrder')}
									</Link>
								</Button>
								{isAuthenticated && (
									<Button asChild variant="outline">
										<Link to="/orders">
											<Factory />
											{t('workshopProfile.myOrders')}
										</Link>
									</Button>
								)}
							</div>
						</section>
					)}
					<p className="flex items-start gap-2 text-caption text-muted-foreground">
						<Calendar className="mt-0.5 size-3.5 shrink-0" />
						{t('workshopProfile.dataNote')}
					</p>
				</aside>
			</div>
		</main>
	)
}
