import { useNavigate } from '@tanstack/react-router'
import { isAuthenticated, register } from '@/shared/auth'

/** Guests register; signed-in users go straight to the constructor or the workshop form. */
export function useGetStarted() {
	const navigate = useNavigate()
	return (audience: 'clients' | 'workshops' = 'clients') => {
		if (!isAuthenticated()) {
			void register()
			return
		}
		void navigate({ to: audience === 'workshops' ? '/workshop' : '/projects/new' })
	}
}
