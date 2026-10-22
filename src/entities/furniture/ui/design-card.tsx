import { Link } from '@tanstack/react-router'
import type * as React from 'react'
import { useTranslation } from 'react-i18next'
import type { DesignSchema } from '@/shared/api/generated/model'
import { Link as LinkIcon } from '@/shared/design'
import { formatDate } from '@/shared/lib/format'
import { DesignThumbnail } from './design-thumbnail'

type Props = { design: DesignSchema; actions?: React.ReactNode }

export function DesignCard({ design, actions }: Props) {
	const { t, i18n } = useTranslation()
	return (
		<article className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg hover:shadow-foreground/5">
			<Link
				to="/projects/$designId"
				params={{ designId: design.id }}
				className="flex flex-col outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
			>
				<div className="relative aspect-[4/3] bg-blueprint">
					<DesignThumbnail
						document={design.document}
						className="absolute inset-0 p-6 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
					/>
				</div>
				<div className="flex flex-col gap-1 border-t p-4 pr-24">
					<span className="truncate text-h4 group-hover:text-primary">{design.title}</span>
					<span className="flex items-center gap-1.5 text-body-sm text-muted-foreground">
						{t(`furnitureTypes.${design.furnitureType}`)} ·{' '}
						{formatDate(design.updatedAt, i18n.language)}
						{design.source === 'link' && (
							<LinkIcon className="size-3.5" aria-label={t('projects.fromLink')} />
						)}
					</span>
				</div>
			</Link>
			{actions && <div className="absolute right-3 bottom-3 flex gap-1">{actions}</div>}
		</article>
	)
}
