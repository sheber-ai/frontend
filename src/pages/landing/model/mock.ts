// Illustrative data for landing demos, not real workshops or orders.
export const OFFERS = [
	{ workshop: 'Arman Furniture', rating: 4.9, price: 420000, days: 14 },
	{ workshop: 'Wood Lab', rating: 4.7, price: 389000, days: 18 },
	{ workshop: 'Shanyrak Studio', rating: 4.8, price: 455000, days: 12 },
] as const

export const ORDERS = [
	{ key: 'wardrobe', size: '1 800 × 2 100', budget: 450000 },
	{ key: 'kitchen', size: '2 400 × 900', budget: 1200000 },
	{ key: 'shelf', size: '1 200 × 2 000', budget: 180000 },
] as const
