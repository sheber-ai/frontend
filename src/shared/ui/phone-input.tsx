import type * as React from 'react'
import { useLayoutEffect, useReducer, useRef } from 'react'
import {
	caretAfter,
	formatPhone,
	nearestDigit,
	nextPhoneValue,
	PHONE_DEFAULT_PREFIX,
	significantBefore,
} from '@/shared/lib/phone'
import { cn } from '@/shared/lib/utils'
import { Input } from './input'

type Props = Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'type' | 'defaultValue'> & {
	/** "+" and digits: E.164 once complete, e.g. "+77011234567"; empty when not filled */
	value: string
	onChange: (value: string) => void
}

/**
 * Phone field for any country. Shows the number grouped while typing, keeps the caret on the same digit,
 * steps over spaces on Backspace/Delete, accepts pasted numbers in any spelling and refuses extra digits.
 * Without "+" input is read as Kazakhstani; an empty field starts with "+7" on focus.
 */
export function PhoneInput({
	value,
	onChange,
	onFocus,
	onBlur,
	className,
	ref: externalRef,
	...props
}: Props) {
	const inputRef = useRef<HTMLInputElement | null>(null)
	const caret = useRef<number | null>(null)
	const [, rerender] = useReducer((n: number) => n + 1, 0)
	const display = formatPhone(value)

	useLayoutEffect(() => {
		const input = inputRef.current
		if (caret.current === null || !input || document.activeElement !== input) return
		input.setSelectionRange(caret.current, caret.current)
		caret.current = null
	})

	const setRef = (node: HTMLInputElement | null) => {
		inputRef.current = node
		if (typeof externalRef === 'function') externalRef(node)
		else if (externalRef) externalRef.current = node
	}

	/** Applies edited text; `sigCaret` counts digits and "+" before the caret in `raw`. */
	const commit = (raw: string, sigCaret: number) => {
		const next = nextPhoneValue(value, raw)
		if (next === null) {
			caret.current = caretAfter(display, Math.max(sigCaret - 1, 0))
			rerender()
			return
		}
		// Normalising may insert "+7" in front: shift the caret by the same amount
		const shift = Math.max(next.length - significantBefore(raw, raw.length), 0)
		caret.current = caretAfter(formatPhone(next), sigCaret > 0 ? sigCaret + shift : 0)
		if (next === value) rerender()
		else onChange(next)
	}

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const raw = event.target.value
		const position = event.target.selectionStart ?? raw.length
		commit(raw, significantBefore(raw, position))
	}

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		props.onKeyDown?.(event)
		const input = event.currentTarget
		const start = input.selectionStart ?? 0
		if (event.defaultPrevented || start !== input.selectionEnd) return
		const backward = event.key === 'Backspace'
		if (!backward && event.key !== 'Delete') return
		const neighbour = backward ? display[start - 1] : display[start]
		if (neighbour === undefined || /[\d+]/.test(neighbour)) return
		// A separator next to the caret: remove the digit behind it instead of the space
		const index = nearestDigit(display, start, backward)
		if (index < 0) return
		event.preventDefault()
		commit(display.slice(0, index) + display.slice(index + 1), significantBefore(display, index))
	}

	const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
		const pasted = event.clipboardData.getData('text')
		if (!pasted) return
		event.preventDefault()
		const input = event.currentTarget
		const start = input.selectionStart ?? display.length
		const end = input.selectionEnd ?? display.length
		const onlyPrefix = value === '' || value === PHONE_DEFAULT_PREFIX
		const whole = onlyPrefix || (start === 0 && end === display.length)
		// A whole number replaces the field, so "+7" prefilled on focus does not double up
		const raw = whole ? pasted : display.slice(0, start) + pasted + display.slice(end)
		const sigCaret = whole
			? significantBefore(pasted, pasted.length)
			: significantBefore(display, start) + significantBefore(pasted, pasted.length)
		commit(raw, sigCaret)
	}

	return (
		<Input
			{...props}
			ref={setRef}
			type="tel"
			inputMode="tel"
			autoComplete={props.autoComplete ?? 'tel'}
			value={display}
			className={cn('tabular-nums', className)}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			onPaste={handlePaste}
			onFocus={(event) => {
				onFocus?.(event)
				if (value === '') {
					caret.current = PHONE_DEFAULT_PREFIX.length
					onChange(PHONE_DEFAULT_PREFIX)
				}
			}}
			onBlur={(event) => {
				if (value === PHONE_DEFAULT_PREFIX || value === '+') onChange('')
				onBlur?.(event)
			}}
		/>
	)
}
