function scrollIntoViewRespectingMotion(element: Element) {
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
	element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
}

/** Smoothly scrolls to a section by id; returns false if it is not on the page. */
export function scrollToSection(id: string): boolean {
	const element = document.getElementById(id)
	if (!element) return false
	scrollIntoViewRespectingMotion(element)
	return true
}

/** Brings the element's top back into view if the user has scrolled past it. */
export function revealTop(element: Element | null, offset = 64) {
	if (element && element.getBoundingClientRect().top < offset)
		scrollIntoViewRespectingMotion(element)
}
