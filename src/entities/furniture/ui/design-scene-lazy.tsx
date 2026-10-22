import { lazy, Suspense } from 'react'
import { Box } from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import type { DesignSceneProps } from './design-scene'

const Scene = lazy(() =>
	import('./design-scene').then((module) => ({ default: module.DesignScene })),
)

/** three.js stays out of the main bundle until a scene is shown. */
export function DesignScene(props: DesignSceneProps) {
	return (
		<Suspense
			fallback={
				<div className={cn('flex size-full items-center justify-center', props.className)}>
					<Box className="size-8 animate-pulse text-muted-foreground motion-reduce:animate-none" />
				</div>
			}
		>
			<Scene {...props} />
		</Suspense>
	)
}

export type { DesignSceneProps }
