import axios, { type AxiosRequestConfig } from 'axios'
import { env } from '@/shared/config'

export const axiosInstance = axios.create({
	baseURL: env.VITE_API_URL,
})

// Сюда добавится Bearer-токен Keycloak (request interceptor) и обработка 401.

/** Мутатор Orval: все сгенерированные запросы идут через него. */
export const httpClient = async <T>(
	config: AxiosRequestConfig,
	options?: AxiosRequestConfig,
): Promise<T> => {
	const response = await axiosInstance.request<T>({ ...config, ...options })
	return response.data
}

export type ErrorType<Error> = import('axios').AxiosError<Error>
export type BodyType<Body> = Body
