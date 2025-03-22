import { API_URL } from "./base";

type ErrorStatus = {
    status: 'error'
    error: string
}

type SyncStatus = {
    status: 'sync' | 'unsync'
}

export type HealthStatus = ErrorStatus | SyncStatus

export async function healthCheck(): Promise<HealthStatus> {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
        throw new Error("Failed to fetch health check");
    }
    return await response.json();
}