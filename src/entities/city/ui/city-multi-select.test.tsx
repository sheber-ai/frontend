import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CityMultiSelect } from './city-multi-select'

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, options?: { name?: string }) =>
			options?.name ? `${key}:${options.name}` : key,
	}),
}))
vi.mock('../model/use-cities', () => ({
	useCities: () => ({
		cities: [
			{ id: 'ala', name: 'Алматы', slug: 'almaty' },
			{ id: 'ast', name: 'Астана', slug: 'astana' },
			{ id: 'kon', name: 'Қонаев', slug: 'konaev' },
		],
		isPending: false,
	}),
}))

// cmdk measures its list; jsdom has no layout
globalThis.ResizeObserver ??= class {
	observe() {}
	unobserve() {}
	disconnect() {}
} as unknown as typeof ResizeObserver
Element.prototype.scrollIntoView ??= () => {}

describe('CityMultiSelect', () => {
	it('lists picked cities without the main one and removes them', async () => {
		const onChange = vi.fn()
		const user = userEvent.setup()
		render(<CityMultiSelect value={['ast', 'ala', 'kon']} onChange={onChange} exclude={['ala']} />)

		expect(screen.getByText('Астана')).toBeInTheDocument()
		expect(screen.getByText('Қонаев')).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'city.remove:Алматы' })).not.toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: 'city.remove:Астана' }))
		expect(onChange).toHaveBeenCalledWith(['ala', 'kon'])
	})

	it('adds a city from the list, offering only the ones not picked yet', async () => {
		const onChange = vi.fn()
		const user = userEvent.setup()
		render(<CityMultiSelect value={['ast']} onChange={onChange} exclude={['ala']} />)

		await user.click(screen.getByRole('combobox'))
		expect(screen.queryByRole('option', { name: 'Алматы' })).not.toBeInTheDocument()
		expect(screen.queryByRole('option', { name: 'Астана' })).not.toBeInTheDocument()
		await user.click(screen.getByRole('option', { name: 'Қонаев' }))
		expect(onChange).toHaveBeenCalledWith(['ast', 'kon'])
	})
})
