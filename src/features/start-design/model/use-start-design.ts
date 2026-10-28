import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { cloneWithNewIds, type DesignDocument, type DesignTemplate } from '@/entities/furniture'
import {
	getListDesignsQueryKey,
	useCreateDesign,
} from '@/shared/api/generated/endpoints/designs/designs'
import type { DesignSourceEnum } from '@/shared/api/generated/model'
import { useApiErrorToast } from '@/shared/lib/use-api-error'

type Options = {
	source?: DesignSourceEnum
	sourceUrl?: string
	/** Instead of the template name */
	title?: string
	/** Adjusts the template before saving, e.g. imported sizes */
	customize?: (document: DesignDocument) => DesignDocument
	/** Runs after the design exists and before the editor opens; a failure does not stop opening it */
	afterCreate?: (designId: string) => Promise<void>
}

/** Creates a design from a template and opens it in the constructor. */
export function useStartDesign() {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const showError = useApiErrorToast()
	const { mutateAsync, isPending, variables } = useCreateDesign()

	const start = async (
		template: DesignTemplate,
		{ source = 'scratch', sourceUrl, title, customize, afterCreate }: Options = {},
	) => {
		try {
			const design = await mutateAsync({
				data: {
					title: title?.trim().slice(0, 128) || t(`templates.${template.id}.title`),
					furnitureType: template.furnitureType,
					source,
					sourceUrl: sourceUrl ?? null,
					document: cloneWithNewIds(customize ? customize(template.build()) : template.build()),
				},
			})
			if (afterCreate) await afterCreate(design.id).catch(showError)
			await queryClient.invalidateQueries({ queryKey: getListDesignsQueryKey() })
			await navigate({ to: '/projects/$designId', params: { designId: design.id } })
		} catch (error) {
			showError(error)
		}
	}

	return { start, isPending, pendingSource: isPending ? variables?.data.source : undefined }
}
