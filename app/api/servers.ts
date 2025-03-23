import { ServerConfig } from "@servers/config"
import { API_URL, fetchWithAuth } from "./base"

export async function listServers(): Promise<ServerConfig[]> {
    const response = await fetchWithAuth(`${API_URL}/servers`)
    
    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch servers")
    }
    return data
}

export async function saveServer(server: ServerConfig): Promise<ServerConfig[]> {
    const response = await fetchWithAuth(`${API_URL}/servers`, {
        method: "POST",
        body: JSON.stringify(server),
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.error || "Failed to save server")
    }

    return data
}

export async function deleteServer(server: ServerConfig): Promise<ServerConfig[]> {
    const response = await fetchWithAuth(`${API_URL}/servers/${server.name}`, {
        method: "DELETE",
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.error || "Failed to delete server")
    }

    return data
}