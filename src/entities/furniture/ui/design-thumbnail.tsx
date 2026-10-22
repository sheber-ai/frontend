import { Box } from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import { isDesignDocument } from '../model/document'
import { DesignDrawing } from './design-drawing'

/** Coloured front view of a stored document; tolerates documents that fail validation. */
export function DesignThumbnail({
	document,
	className,
}: {
	document: unknown
	className?: string
}) {
	if (!isDesignDocument(document)) {
		return (
			<div
				className={cn(
					'flex size-full items-center justify-center text-muted-foreground',
					className,
				)}
			>
				<Box className="size-8" />
			</div>
		)
	}
	return <DesignDrawing document={document} variant="facade" className={className} />
}
