export type CartStatus = 'available' | 'borrowed'

export interface Cart {
	id: number
	code: string
	status: CartStatus
	borrower_name?: string | null
	borrower_phone?: string | null
	borrower_destination?: string | null
	return_point?: string | null
	created_at: string
	updated_at: string
}

export interface CreateCartRequest {
	code: string
	return_point?: string
}

export interface BorrowCartRequest {
	borrower_name: string
	borrower_phone: string
	borrower_destination: string
}

export interface ReturnCartRequest {
	return_point: string
} 