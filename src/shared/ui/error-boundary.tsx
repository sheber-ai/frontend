import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
	/** Rendered instead of the children after an error; `retry` mounts them again */
	fallback: (retry: () => void) => ReactNode
	onError?: (error: unknown) => void
	children: ReactNode
}

type State = { failed: boolean }

/** Keeps a crashing part of the page (e.g. WebGL) from taking the whole page down. */
export class ErrorBoundary extends Component<Props, State> {
	state: State = { failed: false }

	static getDerivedStateFromError(): State {
		return { failed: true }
	}

	componentDidCatch(error: unknown, info: ErrorInfo) {
		console.error('Render error', error, info.componentStack)
		this.props.onError?.(error)
	}

	retry = () => this.setState({ failed: false })

	render() {
		return this.state.failed ? this.props.fallback(this.retry) : this.props.children
	}
}
