import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type * as React from 'react'
import { cn } from '@/shared/lib/utils'

const headingVariants = cva('text-foreground', {
	variants: {
		size: {
			display: 'text-display',
			h1: 'text-h1',
			h2: 'text-h2',
			h3: 'text-h3',
			h4: 'text-h4',
		},
	},
	defaultVariants: { size: 'h2' },
})

type HeadingProps = React.ComponentProps<'h2'> &
	VariantProps<typeof headingVariants> & {
		as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p'
	}

export function Heading({ as: Tag = 'h2', size, className, ...props }: HeadingProps) {
	return <Tag className={cn(headingVariants({ size }), className)} {...props} />
}

const textVariants = cva('', {
	variants: {
		size: {
			lg: 'text-body-lg',
			md: 'text-body',
			sm: 'text-body-sm',
			caption: 'text-caption',
		},
		tone: {
			default: 'text-foreground',
			muted: 'text-muted-foreground',
			primary: 'text-primary',
			destructive: 'text-destructive',
		},
	},
	defaultVariants: { size: 'md', tone: 'default' },
})

type TextProps = React.ComponentProps<'p'> &
	VariantProps<typeof textVariants> & {
		asChild?: boolean
	}

export function Text({ asChild, size, tone, className, ...props }: TextProps) {
	const Comp = asChild ? Slot.Root : 'p'
	return <Comp className={cn(textVariants({ size, tone }), className)} {...props} />
}
