import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Box } from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import type { DesignSceneProps } from './design-scene'

const Scene = lazy(() =>
	import('./design-scene').then((module) => ({ default: module.DesignScene })),
)

/** three.js stays out of the main bundle until a scene is shown. */
export function DesignScene(props: DesignSceneProps) {
	const { t } = useTranslation()
	return (
		<Suspense
			fallback={
				<div
					role="status"
					className={cn(
						'flex size-full flex-col items-center justify-center gap-2 text-muted-foreground',
						props.className,
					)}
				>
					<Box className="size-8 animate-pulse motion-reduce:animate-none" />
					<span className="text-body-sm">{t('editor.view.loading')}</span>
				</div>
			}
		>
			<Scene {...props} />
		</Suspense>
	)
}

export type { DesignSceneProps }
