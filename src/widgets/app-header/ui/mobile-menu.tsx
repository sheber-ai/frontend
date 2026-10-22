import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { logout } from '@/shared/auth'
import { Factory, LogOut, Menu, User } from '@/shared/design'
import { Button } from '@/shared/ui/button'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/shared/ui/sheet'
import type { NavItem } from '../model/nav'

const LINK =
	'flex h-12 items-center gap-3 rounded-lg px-3 text-body transition-colors hover:bg-accent data-[status=active]:bg-secondary data-[status=active]:font-medium [&_svg]:size-5 [&_svg]:text-muted-foreground'

export function MobileMenu({ items, name }: { items: NavItem[]; name: string }) {
	const { t } = useTranslation()
	const [open, setOpen] = useState(false)
	const close = () => setOpen(false)

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" aria-label={t('nav.menu')} className="lg:hidden">
					<Menu />
				</Button>
			</SheetTrigger>
			<SheetContent side="right" className="w-[min(20rem,88vw)] gap-0 p-0">
				<SheetHeader className="border-b p-4">
					<SheetTitle className="truncate">{name || t('nav.menu')}</SheetTitle>
					<SheetDescription className="sr-only">{t('nav.menu')}</SheetDescription>
				</SheetHeader>
				<nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
					{items.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							activeOptions={{ exact: item.to === '/market' }}
							onClick={close}
							className={LINK}
						>
							<item.icon />
							{t(`nav.${item.label}`)}
						</Link>
					))}
					<div className="my-2 border-t" />
					<Link to="/profile" onClick={close} className={LINK}>
						<User />
						{t('nav.profile')}
					</Link>
					<Link to="/workshop" onClick={close} className={LINK}>
						<Factory />
						{t('nav.workshop')}
					</Link>
					<button type="button" onClick={() => void logout()} className={`${LINK} text-left`}>
						<LogOut />
						{t('header.logout')}
					</button>
				</nav>
			</SheetContent>
		</Sheet>
	)
}
