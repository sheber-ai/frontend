import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import { Button } from './button'

type Props = {
	/** 1-based */
	page: number
	pageCount: number
	onChange: (page: number) => void
	disabled?: boolean
	className?: string
}

/** Previous / next with the current position; hidden when everything fits on one page. */
export function Pagination({ page, pageCount, onChange, disabled, className }: Props) {
	const { t } = useTranslation()
	if (pageCount <= 1) return null
	return (
		<nav
			aria-label={t('common.pagination.label')}
			className={cn('flex items-center justify-between gap-3 sm:justify-center', className)}
		>
			<Button
				variant="outline"
				disabled={disabled || page <= 1}
				onClick={() => onChange(page - 1)}
				aria-label={t('common.pagination.previous')}
			>
				<ChevronLeft />
				<span className="max-sm:sr-only">{t('common.pagination.previous')}</span>
			</Button>
			<p className="text-body-sm text-muted-foreground tabular-nums" aria-live="polite">
				{t('common.pagination.position', { page, count: pageCount })}
			</p>
			<Button
				variant="outline"
				disabled={disabled || page >= pageCount}
				onClick={() => onChange(page + 1)}
				aria-label={t('common.pagination.next')}
			>
				<span className="max-sm:sr-only">{t('common.pagination.next')}</span>
				<ChevronRight />
			</Button>
		</nav>
	)
}

export function countPages(total: number, pageSize: number): number {
	return Math.max(1, Math.ceil(total / pageSize))
}
