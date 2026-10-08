import axios, { type AxiosRequestConfig, isAxiosError } from 'axios'
import { getAccessToken, isAuthenticated, login } from '@/shared/auth'
import { env } from '@/shared/config'

export const axiosInstance = axios.create({
	baseURL: env.VITE_API_URL,
})

axiosInstance.interceptors.request.use(async (config) => {
	const token = await getAccessToken()
	if (token) config.headers.Authorization = `Bearer ${token}`
	return config
})

axiosInstance.interceptors.response.use(undefined, (error: unknown) => {
	// Token rejected by the backend (session revoked)
	if (isAxiosError(error) && error.response?.status === 401 && isAuthenticated()) {
		void login(window.location.href)
	}
	return Promise.reject(error)
})

/** Orval mutator for all generated requests. */
export const httpClient = async <T>(
	config: AxiosRequestConfig,
	options?: AxiosRequestConfig,
): Promise<T> => {
	const response = await axiosInstance.request<T>({ ...config, ...options })
	return response.data
}

export type ErrorType<Error> = import('axios').AxiosError<Error>
export type BodyType<Body> = Body
