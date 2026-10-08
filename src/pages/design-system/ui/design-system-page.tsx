import type * as React from 'react'
import { useState } from 'react'
import { DEFAULT_SKETCH, WardrobeDrawing } from '@/entities/furniture'
import {
	COLOR_TOKENS,
	ICON_GROUPS,
	Logo,
	LogoMark,
	MATERIALS,
	type MaterialName,
	Moon,
	RADII,
	Sun,
	TYPE_SCALE,
} from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Heading, Text } from '@/shared/ui/typography'

// Developer reference, intentionally not translated.
export function DesignSystemPage() {
	const [isDark, setIsDark] = useState(false)

	return (
		<div className={cn(isDark && 'dark')}>
			<main className="min-h-svh bg-background text-foreground">
				<div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-10">
					<header className="flex items-center justify-between gap-4">
						<div>
							<Heading as="h1" size="h1">
								Design system
							</Heading>
							<Text tone="muted">
								Tokens: src/shared/design. Never hardcode colors, fonts or icons.
							</Text>
						</div>
						<Button variant="outline" onClick={() => setIsDark((value) => !value)}>
							{isDark ? <Sun /> : <Moon />}
							{isDark ? 'Light' : 'Dark'}
						</Button>
					</header>

					<Section title="Logo">
						<div className="flex flex-wrap items-center gap-8">
							<Logo />
							<LogoMark className="size-16" />
							<LogoMark className="size-16 text-foreground" variant="mono" />
							<LogoMark className="size-6" />
						</div>
					</Section>

					<Section title="Colors">
						{Object.entries(COLOR_TOKENS).map(([group, tokens]) => (
							<div key={group} className="flex flex-col gap-3">
								<Text size="sm" tone="muted" className="capitalize">
									{group}
								</Text>
								<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
									{tokens.map((token) => (
										<div key={token} className="flex flex-col gap-1.5">
											<div
												className="h-14 rounded-lg border"
												style={{ background: `var(--${token})` }}
											/>
											<Text size="caption">{token}</Text>
										</div>
									))}
								</div>
							</div>
						))}
					</Section>

					<Section title="Furniture materials">
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
							{(Object.keys(MATERIALS) as MaterialName[]).map((name) => (
								<div
									key={name}
									className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-3"
								>
									<div className="aspect-[4/5] w-full">
										<WardrobeDrawing
											sketch={{ ...DEFAULT_SKETCH, material: name }}
											mode="model"
											fit
										/>
									</div>
									<Text size="caption">
										{name} · {MATERIALS[name].finish}
									</Text>
								</div>
							))}
						</div>
					</Section>

					<Section title="Typography · Onest">
						<div className="flex flex-col gap-4">
							{TYPE_SCALE.map((size) => (
								<div key={size} className="grid grid-cols-[8rem_1fr] items-baseline gap-4">
									<Text size="caption" tone="muted">
										{size}
									</Text>
									<p className={size}>Мебель по образцу · Өз үлгіңіз · Made to order</p>
								</div>
							))}
						</div>
					</Section>

					<Section title="Icons · lucide-react">
						{Object.entries(ICON_GROUPS).map(([group, icons]) => (
							<div key={group} className="flex flex-col gap-3">
								<Text size="sm" tone="muted" className="capitalize">
									{group}
								</Text>
								<div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-8">
									{Object.entries(icons).map(([name, Icon]) => (
										<div
											key={name}
											className="flex flex-col items-center gap-2 rounded-lg border p-3"
										>
											<Icon className="size-5" />
											<Text size="caption" tone="muted" className="truncate">
												{name}
											</Text>
										</div>
									))}
								</div>
							</div>
						))}
					</Section>

					<Section title="Components">
						<div className="flex flex-wrap gap-2">
							<Button>Primary</Button>
							<Button variant="secondary">Secondary</Button>
							<Button variant="outline">Outline</Button>
							<Button variant="ghost">Ghost</Button>
							<Button variant="destructive">Destructive</Button>
							<Button variant="link">Link</Button>
						</div>
						<div className="flex flex-wrap gap-2">
							<Badge>Default</Badge>
							<Badge variant="secondary">Secondary</Badge>
							<Badge variant="success">Success</Badge>
							<Badge variant="warning">Warning</Badge>
							<Badge variant="info">Info</Badge>
							<Badge variant="destructive">Destructive</Badge>
							<Badge variant="outline">Outline</Badge>
						</div>
						<Card className="max-w-sm">
							<CardHeader>
								<CardTitle>Шкаф-купе 2400 × 600</CardTitle>
								<CardDescription>Дуб, 3 секции · 12 откликов</CardDescription>
							</CardHeader>
							<CardContent>
								<Button className="w-full">Откликнуться</Button>
							</CardContent>
						</Card>
					</Section>

					<Section title="Radius">
						<div className="flex flex-wrap gap-4">
							{RADII.map((radius) => (
								<div key={radius} className="flex flex-col items-center gap-2">
									<div className={cn('size-16 border-2 border-primary bg-secondary', radius)} />
									<Text size="caption" tone="muted">
										{radius}
									</Text>
								</div>
							))}
						</div>
					</Section>
				</div>
			</main>
		</div>
	)
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="flex flex-col gap-6">
			<Heading size="h3">{title}</Heading>
			{children}
		</section>
	)
}
