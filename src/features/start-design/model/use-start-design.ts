import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { cloneWithNewIds, type DesignTemplate } from '@/entities/furniture'
import {
	getListDesignsQueryKey,
	useCreateDesign,
} from '@/shared/api/generated/endpoints/designs/designs'
import type { DesignSourceEnum } from '@/shared/api/generated/model'
import { useApiErrorToast } from '@/shared/lib/use-api-error'

type Options = { source?: DesignSourceEnum; sourceUrl?: string }

/** Creates a design from a template and opens it in the constructor. */
export function useStartDesign() {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const showError = useApiErrorToast()
	const { mutateAsync, isPending, variables } = useCreateDesign()

	const start = async (
		template: DesignTemplate,
		{ source = 'scratch', sourceUrl }: Options = {},
	) => {
		try {
			const design = await mutateAsync({
				data: {
					title: t(`templates.${template.id}.title`),
					furnitureType: template.furnitureType,
					source,
					sourceUrl: sourceUrl ?? null,
					document: cloneWithNewIds(template.build()),
				},
			})
			await queryClient.invalidateQueries({ queryKey: getListDesignsQueryKey() })
			await navigate({ to: '/projects/$designId', params: { designId: design.id } })
		} catch (error) {
			showError(error)
		}
	}

	return { start, isPending, pendingSource: isPending ? variables?.data.source : undefined }
}
