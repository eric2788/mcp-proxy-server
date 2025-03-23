"use client"

import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Center,
    Container,
    Heading,
    HStack,
    IconButton,
    Skeleton,
    Spinner,
    Stack,
    Text,
    useDisclosure
} from "@chakra-ui/react"
import { ServerDialog } from "@components/server-dialog"
import { ServerConfig } from "@servers/config"
import { useEffect, useState } from "react"
import { LuPen as LuEdit, LuPlus, LuTrash2 } from "react-icons/lu"
import { ConfirmDialog } from "./components/confirm-dialog"
import { toaster } from "./components/toaster"
import { ColorModeButton } from "./components/color-mode"
import { deleteServer, listServers, saveServer } from "./api/servers"
import { SyncStatus } from "./components/sync-status"

export default function Page() {
    const [servers, setServers] = useState<ServerConfig[]>([])
    const [editingServer, setEditingServer] = useState<ServerConfig | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [serverToDelete, setServerToDelete] = useState<ServerConfig | null>(null)
    const [syncTrigger, setSyncTrigger] = useState(0)
    const { open, onOpen, onClose } = useDisclosure()
    const {
        open: isConfirmOpen,
        onOpen: onConfirmOpen,
        onClose: onConfirmClose
    } = useDisclosure()

    const fetchServers = async () => {
        try {
            setIsLoading(true)
            setServers(await listServers())
        } catch (error) {
            toaster.create({
                title: "Error loading servers",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                type: "error",
                duration: 3000,
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchServers()
    }, [])

    const handleSaveServer = async (server: ServerConfig) => {
        try {
            setIsLoading(true)
            setServers(await saveServer(server))

            toaster.create({
                title: `Server ${editingServer ? "updated" : "added"}`,
                type: "success",
                duration: 2000,
            })
            onClose()
        } catch (error) {
            toaster.create({
                title: "Error saving server",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                type: "error",
                duration: 3000,
            })
        } finally {
            setIsLoading(false)
            setSyncTrigger((prev) => prev + 1) // Trigger sync status check
        }
    }

    const handleDeleteServer = async (server: ServerConfig) => {
        try {
            setIsLoading(true)
            setServers(await deleteServer(server))

            toaster.create({
                title: "Server deleted",
                type: "success",
                duration: 2000,
            })
        } catch (error) {
            toaster.create({
                title: "Error deleting server",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                type: "error",
                duration: 3000,
            })
        } finally {
            setIsLoading(false)
            setSyncTrigger((prev) => prev + 1) // Trigger sync status check
        }
    }

    const handleDeleteClick = (server: ServerConfig) => {
        setServerToDelete(server)
        onConfirmOpen()
    }

    const handleClose = () => {
        setEditingServer(null)
        onClose()
    }

    const handleConfirmDelete = async () => {
        if (!serverToDelete) return
        await handleDeleteServer(serverToDelete)
        onConfirmClose()
    }

    return (
        <Container maxW="container.lg" py={8}>
            <Stack spaceY={6} spaceX={6}>
                <HStack justify="space-between">
                    <HStack spaceX={2}>
                        <Heading size="lg">MCP Servers</Heading>
                        <SyncStatus triggers={syncTrigger} />
                    </HStack>
                    <HStack spaceX={2}>
                        <Button
                            colorPalette="blue"
                            onClick={() => {
                                setEditingServer(null)
                                onOpen()
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? <><Spinner size="sm" /> Loading...</> : <><LuPlus /> Add Server</>}
                        </Button>
                        <ColorModeButton />
                    </HStack>
                </HStack>

                <Stack spaceY={4}>
                    {isLoading && !servers.length ? (
                        // Loading skeletons when initially loading
                        [...Array(3)].map((_, i) => (
                            <Card.Root key={i}>
                                <CardHeader>
                                    <HStack justify="space-between">
                                        <Skeleton>
                                            <Heading size="md">Loading server name...</Heading>
                                        </Skeleton>
                                        <HStack>
                                            <Skeleton>
                                                <IconButton
                                                    aria-label="Edit server"
                                                    variant="ghost"
                                                >
                                                    <LuEdit />
                                                </IconButton>
                                            </Skeleton>
                                            <Skeleton>
                                                <IconButton
                                                    aria-label="Delete server"
                                                    variant="ghost"
                                                >
                                                    <LuTrash2 />
                                                </IconButton>
                                            </Skeleton>
                                        </HStack>
                                    </HStack>
                                </CardHeader>
                                <CardBody>
                                    <Stack spaceY={2}>
                                        <Skeleton>
                                            <Text>Transport: stdio</Text>
                                        </Skeleton>
                                        <Skeleton>
                                            <Text>Command: loading...</Text>
                                        </Skeleton>
                                    </Stack>
                                </CardBody>
                            </Card.Root>
                        ))
                    ) : servers.length ? (
                        // Actual server list
                        servers.map((server) => (
                            <Card.Root key={server.name}>
                                <CardHeader>
                                    <HStack justify="space-between">
                                        <Heading size="md">{server.name}</Heading>
                                        <HStack>
                                            <IconButton
                                                aria-label="Edit server"
                                                variant="ghost"
                                                onClick={() => {
                                                    setEditingServer(server)
                                                    onOpen()
                                                }}
                                                disabled={isLoading}
                                            >
                                                <LuEdit />
                                            </IconButton>
                                            <IconButton
                                                aria-label="Delete server"
                                                variant="ghost"
                                                colorPalette="red"
                                                onClick={() => handleDeleteClick(server)}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? <Spinner size="sm" /> : <LuTrash2 />}
                                            </IconButton>
                                        </HStack>
                                    </HStack>
                                </CardHeader>
                                <CardBody>
                                    <Stack spaceY={4}>
                                        <HStack wrap="wrap" gap={2}>
                                            <Badge colorPalette={server.transport.type === "sse" ? "purple" : "blue"}>
                                                {server.transport.type || "stdio"}
                                            </Badge>
                                            {server.transport.type !== 'sse' && server.transport.env && (
                                                <Badge colorPalette="cyan">
                                                    env: {
                                                        Array.isArray(server.transport.env)
                                                            ? server.transport.env.join(", ")
                                                            : Object.keys(server.transport.env).join(", ")
                                                    }
                                                </Badge>
                                            )}

                                        </HStack>
                                        <HStack wrap="wrap" gap={2}>
                                            {server.transport.type === "sse" ? (
                                                <Badge colorPalette="gray">{server.transport.url}</Badge>
                                            ) : (
                                                <>
                                                    <Badge colorPalette="green">{server.transport.command}</Badge>
                                                    {(server.transport.args?.length || 0) > 0 && (
                                                        <Badge colorPalette="orange">
                                                            args: {server.transport.args!.join(" ")}
                                                        </Badge>
                                                    )}
                                                </>
                                            )}
                                        </HStack>
                                    </Stack>
                                </CardBody>
                            </Card.Root>
                        ))
                    ) : (
                        // Empty state
                        <Center p={8}>
                            <Text color="gray.500">No servers configured yet</Text>
                        </Center>
                    )}
                </Stack>
            </Stack>

            <ServerDialog
                isOpen={open}
                onClose={handleClose}
                onSave={handleSaveServer}
                server={editingServer}
                isLoading={isLoading}
            />

            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={onConfirmClose}
                onConfirm={handleConfirmDelete}
                title="Delete Server"
                message={`Are you sure you want to delete server "${serverToDelete?.name}"? This action cannot be undone.`}
                isLoading={isLoading}
            />
        </Container>
    )
}