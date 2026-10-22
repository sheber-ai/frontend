import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { logout } from '@/shared/auth'
import { ChevronDown, Factory, LogOut, User } from '@/shared/design'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

export function AccountMenu({ name, className }: { name: string; className?: string }) {
	const { t } = useTranslation()
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className={cn('max-w-48', className)}>
					<User />
					<span className="truncate">{name}</span>
					<ChevronDown className="text-muted-foreground" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link to="/profile">
						<User />
						{t('nav.profile')}
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link to="/workshop">
						<Factory />
						{t('nav.workshop')}
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={() => void logout()}>
					<LogOut />
					{t('header.logout')}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
