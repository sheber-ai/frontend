import { Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { isDesignDocument } from '@/entities/furniture'
import { useGetDesign } from '@/shared/api/generated/endpoints/designs/designs'
import { Box, TriangleAlert } from '@/shared/design'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { DesignEditor } from '@/widgets/design-editor'

export function ProjectEditorPage({ designId }: { designId: string }) {
	const { t } = useTranslation()
	// Server state seeds the editor once; later edits live in the editor and autosave back
	const { data, isPending, isError } = useGetDesign(designId, { query: { staleTime: Infinity } })
	const document = useMemo(
		() => (data && isDesignDocument(data.document) ? data.document : null),
		[data],
	)

	if (isPending) {
		return (
			<div className="flex h-[calc(100dvh-4rem)] items-center justify-center">
				<Box className="size-10 animate-pulse text-muted-foreground motion-reduce:animate-none" />
			</div>
		)
	}

	if (isError || !data || !document) {
		return (
			<main className="page-container py-12">
				<EmptyState
					icon={<TriangleAlert />}
					title={t('editor.notFound')}
					text={t('editor.notFoundText')}
					action={
						<Button asChild>
							<Link to="/projects">{t('editor.back')}</Link>
						</Button>
					}
				/>
			</main>
		)
	}

	return <DesignEditor key={data.id} design={data} document={document} />
}
