import { useTranslation } from 'react-i18next'
import type { WorkshopPublicSchema } from '@/shared/api/generated/model'
import { ExternalLink, Factory, MapPin } from '@/shared/design'

/** Workshop name, city and specialisation for offer lists and order pages. */
export function WorkshopSummary({ workshop }: { workshop: WorkshopPublicSchema }) {
	const { t } = useTranslation()
	return (
		<div className="flex min-w-0 items-start gap-3">
			<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
				<Factory className="size-5" />
			</span>
			<div className="min-w-0">
				<p className="truncate font-medium">{workshop.name}</p>
				<p className="flex flex-wrap items-center gap-x-2 text-body-sm text-muted-foreground">
					<span className="inline-flex items-center gap-1">
						<MapPin className="size-3.5" />
						{workshop.city.name}
					</span>
					<span>
						{workshop.furnitureTypes.map((type) => t(`furnitureTypes.${type}`)).join(', ')}
					</span>
					{workshop.website && (
						<a
							href={workshop.website}
							target="_blank"
							rel="noreferrer"
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
