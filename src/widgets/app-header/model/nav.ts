import { hasRole, isWorkshop, type Viewer } from '@/entities/viewer'
import { Box, ClipboardList, Factory, type Icon, Inbox, ShieldCheck, Store } from '@/shared/design'

export type NavItem = {
	to: '/projects' | '/orders' | '/market' | '/market/offers' | '/workshop' | '/admin/workshops'
	label: 'projects' | 'orders' | 'market' | 'offers' | 'workshop' | 'moderation'
	icon: Icon
}

/** Sections the viewer can use: everyone orders, approved workshops respond, admins moderate. */
export function navItems(viewer: Viewer | undefined): NavItem[] {
	const items: NavItem[] = [
		{ to: '/projects', label: 'projects', icon: Box },
		{ to: '/orders', label: 'orders', icon: ClipboardList },
	]
	if (isWorkshop(viewer)) {
		items.push(
			{ to: '/market', label: 'market', icon: Store },
			{ to: '/market/offers', label: 'offers', icon: Inbox },
		)
	} else if (viewer?.workshopStatus) {
		items.push({ to: '/workshop', label: 'workshop', icon: Factory })
	}
	if (hasRole(viewer, 'admin'))
		items.push({ to: '/admin/workshops', label: 'moderation', icon: ShieldCheck })
	return items
}
