import { api } from './client'
import type { Cart, CreateCartRequest, BorrowCartRequest, ReturnCartRequest } from '../types'

export async function listCarts(): Promise<Cart[]> {
	const { data } = await api.get<Cart[]>('/api/carts')
	return data
}

export async function createCart(body: CreateCartRequest): Promise<Cart> {
	const { data } = await api.post<Cart>('/api/carts', body)
	return data
}

export async function deleteCart(id: number): Promise<void> {
	await api.delete(`/api/carts/${id}`)
}

export async function borrowCart(id: number, body: BorrowCartRequest): Promise<Cart> {
	const { data } = await api.post<Cart>(`/api/carts/${id}/borrow`, body)
	return data
}

export async function returnCart(id: number, body: ReturnCartRequest): Promise<Cart> {
	const { data } = await api.post<Cart>(`/api/carts/${id}/return`, body)
	return data
}

export async function updateCart(id: number, body: Partial<Cart>): Promise<Cart> {
	const { data } = await api.put<Cart>(`/api/carts/${id}`, body)
	return data
}

export async function transferCart(id: number, to_return_point: string) : Promise<Cart> {
	const { data } = await api.post<Cart>(`/api/carts/${id}/transfer`, { to_return_point })
	return data
}

export interface ActionLog {
	id: number
	cart_id: number
	cart_code: string
	type: 'borrow' | 'return' | 'transfer'
	borrower_name?: string | null
	borrower_phone?: string | null
	borrower_destination?: string | null
	from_point?: string | null
	to_point?: string | null
	created_at: string
}

export async function listLogs(): Promise<ActionLog[]> {
	const { data } = await api.get<ActionLog[]>(`/api/logs`)
	return data
} 