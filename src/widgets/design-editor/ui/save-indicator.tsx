import { useTranslation } from 'react-i18next'
import { CircleCheck, CircleX, LoaderCircle } from '@/shared/design'
import type { SaveStatus } from '../model/use-autosave'

export function SaveIndicator({ status, onRetry }: { status: SaveStatus; onRetry: () => void }) {
	const { t } = useTranslation()
	if (status === 'error') {
		return (
			<button
				type="button"
				onClick={onRetry}
				className="inline-flex items-center gap-1.5 text-body-sm text-destructive hover:underline"
			>
				<CircleX className="size-4" />
				{t('editor.save.error')}
			</button>
		)
	}
	return (
		<span
			role="status"
			className="inline-flex items-center gap-1.5 text-body-sm text-muted-foreground"
		>
			{status === 'saved' ? (
				<CircleCheck className="size-4 text-success" />
			) : (
				<LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
			)}
			<span className="max-sm:sr-only">{t(`editor.save.${status}`)}</span>
		</span>
	)
}
