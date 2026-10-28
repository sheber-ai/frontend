import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { PhoneInput } from './phone-input'

function Harness({ initial = '' }: { initial?: string }) {
	const [value, setValue] = useState(initial)
	return (
		<>
			<label htmlFor="phone">Phone</label>
			<PhoneInput id="phone" value={value} onChange={setValue} />
			<output data-testid="value">{value}</output>
		</>
	)
}

const field = () => screen.getByLabelText<HTMLInputElement>('Phone')
const stored = () => screen.getByTestId('value').textContent

describe('PhoneInput', () => {
	it('prefills +7 on focus and formats while typing', async () => {
		const user = userEvent.setup()
		render(<Harness />)
		await user.click(field())
		expect(field().value).toBe('+7')
		await user.keyboard('7011234567')
		expect(field().value).toBe('+7 701 123 45 67')
		expect(stored()).toBe('+77011234567')
	})

	it('treats the habitual leading 8 as +7', async () => {
		const user = userEvent.setup()
		render(<Harness />)
		await user.click(field())
		await user.keyboard('87011234567')
		expect(stored()).toBe('+77011234567')
	})

	it('refuses digits after a complete number', async () => {
		const user = userEvent.setup()
		render(<Harness initial="+77011234567" />)
		await user.click(field())
		await user.keyboard('9')
		expect(stored()).toBe('+77011234567')
	})

	it('replaces the prefilled prefix with a pasted number in any spelling', async () => {
		const user = userEvent.setup()
		render(<Harness />)
		await user.click(field())
		await user.paste('8 (701) 123-45-67')
		expect(field().value).toBe('+7 701 123 45 67')
		expect(stored()).toBe('+77011234567')
	})

	it('accepts numbers of other countries', async () => {
		const user = userEvent.setup()
		render(<Harness />)
		await user.click(field())
		await user.paste('+996 555 123 456')
		expect(field().value).toBe('+996 555 123 456')
		expect(stored()).toBe('+996555123456')
	})

	it('deletes the digit behind a space on Backspace and keeps the caret there', async () => {
		const user = userEvent.setup()
		render(<Harness initial="+77011234567" />)
		const input = field()
		await user.click(input)
		// Caret right after "+7 701 " (before "123")
		input.setSelectionRange(7, 7)
		await user.keyboard('{Backspace}')
		expect(stored()).toBe('+7701234567')
		expect(input.value).toBe('+7 701 234 56 7')
		expect(input.selectionStart).toBe(5)
	})

	it('edits in the middle without jumping to the end', async () => {
		const user = userEvent.setup()
		render(<Harness initial="+7701234567" />)
		const input = field()
		await user.click(input)
		input.setSelectionRange(6, 6)
		await user.keyboard('1')
		expect(stored()).toBe('+77011234567')
		expect(input.selectionStart).toBe(8)
	})

	it('replaces a selected number with a longer foreign one', async () => {
		const user = userEvent.setup()
		render(<Harness initial="+77011234567" />)
		const input = field()
		await user.click(input)
		input.setSelectionRange(0, input.value.length)
		await user.paste('+996 555 123 456')
		expect(stored()).toBe('+996555123456')
	})

	it('clears a lone prefix on blur', async () => {
		const user = userEvent.setup()
		render(<Harness />)
		await user.click(field())
		await user.tab()
		expect(stored()).toBe('')
	})
})
