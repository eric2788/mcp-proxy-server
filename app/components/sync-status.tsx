"use client"

import { healthCheck, HealthStatus } from "@/api/health"
import { Badge, Button, HStack, Spinner } from "@chakra-ui/react"
import { Tooltip } from "@components/tooltip"
import { useEffect, useState } from "react"
import { LuRefreshCw } from "react-icons/lu"

const statusConfig = {
    sync: { color: "green", text: "In Sync" },
    unsync: { color: "orange", text: "Restart Required" },
    error: { color: "red", text: "Connection Error" }
}

export function SyncStatus({ triggers = 0 }) {
    const [health, setHealth] = useState<HealthStatus | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const checkHealth = async () => {
        try {
            setIsLoading(true)
            setHealth(await healthCheck())
        } catch (error) {
            setHealth({
                status: "error",
                error: error instanceof Error ? error.message : "Unknown error"
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        checkHealth()
    }, [triggers])

    if (isLoading) {
        return (
            <HStack>
                <Spinner size="sm" />
                <Badge>Checking...</Badge>
            </HStack>
        )
    }

    if (!health) return null

    const config = statusConfig[health.status]

    return (
        <HStack spaceX={2}>
            <Tooltip
                content={health.status === "error"
                    ? health.error
                    : health.status === "unsync"
                        ? "Configuration changes detected. Restart the MCP proxy server to apply changes."
                        : "All servers are properly configured and running"
                }
            >
                <Badge colorPalette={config.color} variant="subtle">
                    {config.text}
                </Badge>
            </Tooltip>
            <Button
                size="sm"
                variant="ghost"
                onClick={checkHealth}
                loading={isLoading}
            >
                <LuRefreshCw />
            </Button>
        </HStack>
    )
}