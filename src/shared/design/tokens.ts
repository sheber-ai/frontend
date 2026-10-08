// Token names for the /design reference page. Values live in tokens.css.
export const COLOR_TOKENS = {
	surface: ['background', 'foreground', 'card', 'popover', 'muted', 'muted-foreground', 'border'],
	brand: [
		'primary',
		'primary-foreground',
		'secondary',
		'secondary-foreground',
		'accent',
		'brand-sage',
		'ring',
	],
	status: ['success', 'warning', 'info', 'destructive'],
	chart: ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'],
} as const

export const TYPE_SCALE = [
	'text-hero',
	'text-display',
	'text-h1',
	'text-h2',
	'text-h3',
	'text-h4',
	'text-body-lg',
	'text-body',
	'text-body-sm',
	'text-caption',
] as const

export const RADII = [
	'rounded-sm',
	'rounded-md',
	'rounded-lg',
	'rounded-xl',
	'rounded-full',
] as const
