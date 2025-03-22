import { ServerConfig } from "@servers/config"
import { API_URL } from "./base"


export async function listServers(): Promise<ServerConfig[]> {
    const response = await fetch(`${API_URL}/servers`)
    if (!response.ok) {
        throw new Error("Failed to fetch servers")
    }
    return await response.json()
}


export async function saveServer(server: ServerConfig): Promise<ServerConfig[]> {
    const response = await fetch(`${API_URL}/servers`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(server),
    })

    if (!response.ok) {
        throw new Error("Failed to save server")
    }

    return await response.json()
}

export async function deleteServer(server: ServerConfig): Promise<ServerConfig[]> {
    const response = await fetch(`${API_URL}/servers/${server.name}`, {
        method: "DELETE",
    })

    if (!response.ok) {
        throw new Error("Failed to delete server")
    }

    return await response.json()
}