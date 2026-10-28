import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { WorkshopPublicSchema } from '@/shared/api/generated/model'
import { ExternalLink, MapPin } from '@/shared/design'
import { WorkshopAvatar } from './workshop-avatar'

/** Workshop name, city and specialisation for offer lists and order pages; the name opens its public page. */
export function WorkshopSummary({ workshop }: { workshop: WorkshopPublicSchema }) {
	const { t } = useTranslation()
	return (
		<div className="flex min-w-0 items-start gap-3">
			<WorkshopAvatar name={workshop.name} />
			<div className="min-w-0">
				<Link
					to="/workshops/$workshopId"
					params={{ workshopId: workshop.id }}
					className="block truncate font-medium underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
				>
					{workshop.name}
				</Link>
				<p className="flex flex-wrap items-center gap-x-2 text-body-sm text-muted-foreground">
					<span
						className="inline-flex items-center gap-1"
						title={[workshop.city, ...workshop.serviceCities].map((city) => city.name).join(', ')}
					>
						<MapPin className="size-3.5" />
						{workshop.city.name}
						{workshop.serviceCities.length > 0 && ` +${workshop.serviceCities.length}`}
					</span>
					<span>
						{workshop.furnitureTypes.map((type) => t(`furnitureTypes.${type}`)).join(', ')}
					</span>
					{workshop.website && (
						<a
							href={workshop.website}
							target="_blank"
							rel="noreferrer noopener"
							className="inline-flex items-center gap-1 text-primary hover:underline"
						>
							{t('workshop.website')}
							<ExternalLink className="size-3.5" />
						</a>
					)}
				</p>
			</div>
		</div>
	)
}
