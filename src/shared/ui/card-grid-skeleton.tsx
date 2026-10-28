import { cn } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'

const KEYS = ['a', 'b', 'c', 'd', 'e', 'f']

export function CardGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
	return (
		<div
			className={cn(
				'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
				className,
			)}
		>
			{KEYS.slice(0, count).map((key) => (
				<div key={key} className="flex flex-col overflow-hidden rounded-xl border bg-card">
					<Skeleton className="aspect-[4/3] rounded-none" />
					<div className="flex flex-col gap-2 p-4">
						<Skeleton className="h-5 w-2/3" />
						<Skeleton className="h-4 w-1/3" />
					</div>
				</div>
			))}
		</div>
	)
}
