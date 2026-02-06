import { Book, CheckoutResponse, ApiError } from './types';

// In development, Vite proxies /api to the backend
// In production, configure VITE_API_URL accordingly
const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const url = endpoint.startsWith('/')
        ? `${API_BASE}${endpoint}`
        : `${API_BASE}/${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).error || 'Произошла ошибка');
    }

    return data as T;
}

/**
 * Get all published books
 */
export async function getBooks(): Promise<Book[]> {
    return fetchApi<Book[]>('/books');
}

/**
 * Get a single book by ID
 */
export async function getBook(id: string): Promise<Book> {
    return fetchApi<Book>(`/books/${id}`);
}

/**
 * Initiate PDF checkout
 * Returns Robokassa redirect URL
 */
export async function checkoutPdf(
    bookId: string,
    email: string
): Promise<CheckoutResponse> {
    return fetchApi<CheckoutResponse>('/checkout/pdf', {
        method: 'POST',
        body: JSON.stringify({ bookId, email }),
    });
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string; testMode: boolean }> {
    return fetchApi('/health');
}

export default {
    getBooks,
    getBook,
    checkoutPdf,
    healthCheck,
};
