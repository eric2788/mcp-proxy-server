import { env } from "next-runtime-env"

export const API_URL = env('NEXT_PUBLIC_API_URL') || "http://localhost:3006/api"

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token')

    const response = await fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    })

    if (response.status === 401) {
        localStorage.removeItem('auth_token')
        window.location.reload()
        throw new Error('Authentication required')
    }

    return response
}