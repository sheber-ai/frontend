import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type * as React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { OrderSchema } from '@/shared/api/generated/model'
import { OrdersPage } from './orders-page'

const order = (id: string, status: OrderSchema['status'], offersCount = 0): OrderSchema => ({
	id,
	title: `Order ${id}`,
	furnitureType: 'wardrobe',
	document: {},
	sourceUrl: null,
	city: { id: 'c1', name: 'Алматы' },
	description: '',
	budget: null,
	deadline: null,
	status,
	offersCount,
	createdAt: '2026-10-01T00:00:00Z',
})

const ORDERS = [
	order('a', 'published', 2),
	order('b', 'in_progress', 1),
	order('c', 'completed', 1),
]

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, options?: { count?: number }) =>
			options?.count === undefined ? key : `${key}:${options.count}`,
		i18n: { language: 'ru' },
	}),
}))
vi.mock('@tanstack/react-router', () => ({
	Link: ({ children, className }: { children: React.ReactNode; className?: string }) => (
		<a href="/" className={className}>
			{children}
		</a>
	),
	useNavigate: () => navigate,
}))
const navigate = vi.fn()
const listMyOrders = vi.fn()
vi.mock('@/shared/api/generated/endpoints/orders/orders', () => ({
	useListMyOrders: (params: { group: string; offset: number; limit: number }) =>
		listMyOrders(params),
}))

// The server filters by tab and pages; the mock does the same over ORDERS
function serve(
	orders: OrderSchema[],
	counts = { active: 2, completed: 1, cancelled: 0 },
	total?: number,
) {
	listMyOrders.mockImplementation(({ group }: { group: string }) => {
		const items = orders.filter((item) =>
			group === 'active'
				? !['completed', 'cancelled'].includes(item.status)
				: item.status === group,
		)
		return {
			data: { items, total: total ?? items.length, counts },
			isPending: false,
			isFetching: false,
			isPlaceholderData: false,
		}
	})
}
vi.mock('@/entities/furniture', () => ({ DesignThumbnail: () => null }))

describe('OrdersPage', () => {
	beforeEach(() => {
		navigate.mockReset()
		serve(ORDERS)
	})

	it('shows unfinished orders with what to do next', () => {
		render(<OrdersPage tab="active" page={1} />)
		expect(screen.getByText('Order a')).toBeInTheDocument()
		expect(screen.getByText('Order b')).toBeInTheDocument()
		expect(screen.queryByText('Order c')).not.toBeInTheDocument()
		expect(screen.getByText('orderNextStep.chooseWorkshop:2')).toBeInTheDocument()
		expect(screen.getByText('orderNextStep.confirmDone:1')).toBeInTheDocument()
	})

	it('counts orders per tab and lists finished ones separately', () => {
		render(<OrdersPage tab="completed" page={1} />)
		const tabs = screen.getByRole('group', { name: 'orders.tabs' })
		expect(within(tabs).getByRole('button', { name: /orders.active\s*2/ })).toBeInTheDocument()
		expect(within(tabs).getByRole('button', { name: /orders.completed\s*1/ })).toHaveAttribute(
			'aria-pressed',
			'true',
		)
		expect(screen.getByText('Order c')).toBeInTheDocument()
		expect(screen.queryByText('Order a')).not.toBeInTheDocument()
	})

	it('asks the server for the page and moves between pages', async () => {
		serve(ORDERS, { active: 30, completed: 1, cancelled: 0 }, 30)
		const user = userEvent.setup()
		render(<OrdersPage tab="active" page={2} />)
		expect(listMyOrders).toHaveBeenLastCalledWith({ group: 'active', offset: 12, limit: 12 })
		expect(screen.getByText('common.pagination.position:3')).toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: 'common.pagination.next' }))
		expect(navigate).toHaveBeenLastCalledWith({ to: '/orders', search: { page: 3 }, replace: true })
		await user.click(screen.getByRole('button', { name: 'common.pagination.previous' }))
		expect(navigate).toHaveBeenLastCalledWith({ to: '/orders', search: {}, replace: true })
	})

	it('resets to the first page when switching tabs and hides paging for one page', async () => {
		const user = userEvent.setup()
		render(<OrdersPage tab="active" page={1} />)
		expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: /orders.completed/ }))
		expect(navigate).toHaveBeenLastCalledWith({
			to: '/orders',
			search: { tab: 'completed' },
			replace: true,
		})
	})

	it('goes back to the last page when the current one emptied out', () => {
		serve([], { active: 3, completed: 0, cancelled: 0 }, 3)
		render(<OrdersPage tab="active" page={4} />)
		expect(navigate).toHaveBeenCalledWith({ to: '/orders', search: {}, replace: true })
	})

	it('offers to create a project when there are no orders at all', () => {
		serve([], { active: 0, completed: 0, cancelled: 0 })
		render(<OrdersPage tab="active" page={1} />)
		expect(screen.getByText('orders.emptyTitle')).toBeInTheDocument()
	})
})
