import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { CircleCheck, CircleX, Info, LoaderCircle, TriangleAlert } from '@/shared/design'

function Toaster(props: ToasterProps) {
	return (
		<Sonner
			className="toaster group"
			icons={{
				success: <CircleCheck className="size-4 text-success" />,
				info: <Info className="size-4 text-info" />,
				warning: <TriangleAlert className="size-4 text-warning" />,
				error: <CircleX className="size-4 text-destructive" />,
				loading: <LoaderCircle className="size-4 animate-spin" />,
			}}
			style={
				{
					'--normal-bg': 'var(--popover)',
					'--normal-text': 'var(--popover-foreground)',
					'--normal-border': 'var(--border)',
					'--border-radius': 'var(--radius)',
				} as React.CSSProperties
			}
			{...props}
		/>
	)
}

export { toast } from 'sonner'
export { Toaster }
