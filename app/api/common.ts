import { API_URL, fetchWithAuth } from "./base";

type ErrorStatus = {
    status: 'error'
    error: string
}

type SyncStatus = {
    status: 'sync' | 'unsync'
}

export type HealthStatus = ErrorStatus | SyncStatus

export async function healthCheck(): Promise<HealthStatus> {
    const response = await fetchWithAuth(`${API_URL}/health`, {
        method: "GET",
    });
    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch health check")
    }
    return data
}

export async function authenticate(username: string, password: string): Promise<{ token: string }> {
    const response = await fetch(`${API_URL}/auth`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });
    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch authentication")
    }
    return data
}