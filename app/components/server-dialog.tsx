"use client"

import {
    Button,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    FieldLabel,
    FieldRoot,
    Input,
    NativeSelect,
    Stack,
    VStack,
    Spinner,
    Skeleton,
    DialogTrigger,
    DialogBackdrop,
    DialogPositioner,
    HStack,
    IconButton
} from "@chakra-ui/react"
import { ServerConfig, TransportConfig } from "@servers/config"
import { useEffect, useState } from "react"
import { LuPlus, LuTrash2 } from "react-icons/lu"

interface ServerDialogProps {
    isOpen: boolean
    onClose: () => void
    onSave: (server: ServerConfig) => void
    server?: ServerConfig | null
    isLoading?: boolean
}

interface EnvVar {
    key: string
    value: string
}

export function ServerDialog({ isOpen, onClose, onSave, server, isLoading }: ServerDialogProps) {
    const [name, setName] = useState("")
    const [transportType, setTransportType] = useState<"stdio" | "sse">("stdio")
    const [command, setCommand] = useState("")
    const [args, setArgs] = useState("")
    const [url, setUrl] = useState("")
    const [envVars, setEnvVars] = useState<EnvVar[]>([{ key: '', value: '' }])

    useEffect(() => {
        if (server) {
            setName(server.name)
            setTransportType(server.transport.type || "stdio")
            if (server.transport.type === "sse") {
                setUrl(server.transport.url)
            } else {
                setCommand(server.transport.command)
                setArgs(server.transport.args?.join(" ") || "")
                if (Array.isArray(server.transport.env)) {
                    setEnvVars(server.transport.env.map(env => {
                        const [key, value] = env.split('=')
                        return { key, value: value || '' }
                    }))
                } else if (typeof server.transport.env === "object") {
                    setEnvVars(
                        Object.entries(server.transport.env || {}).map(([key, value]) => ({
                            key,
                            value: value as string
                        }))
                    )
                }
            }
        } else {
            // Reset form when adding new server
            setName("")
            setTransportType("stdio")
            setCommand("")
            setArgs("")
            setEnvVars([{ key: '', value: '' }])
            setUrl("")
        }
    }, [server])

    const handleAddEnvVar = () => {
        setEnvVars([...envVars, { key: '', value: '' }])
    }

    const handleRemoveEnvVar = (index: number) => {
        setEnvVars(envVars.filter((_, i) => i !== index))
    }

    const handleEnvVarChange = (index: number, field: 'key' | 'value', value: string) => {
        const newEnvVars = [...envVars]
        newEnvVars[index][field] = value
        setEnvVars(newEnvVars)
    }

    const handleSubmit = () => {
        const transport: TransportConfig = transportType === "sse"
            ? {
                type: "sse",
                url
            }
            : {
                command,
                args: args ? args.split(" ") : undefined,
                env: envVars.length > 0 ? envVars.reduce((acc, { key, value }) => {
                    if (key && value) {
                        return { ...acc, [key]: value }
                    }
                    return acc
                }, {}) : undefined
            }

        onSave({
            name,
            transport
        })
    }

    return (
        <DialogRoot open={isOpen} onExitComplete={onClose} size="lg">
            <DialogTrigger />
            <DialogBackdrop />
            <DialogPositioner>
            <DialogContent>
                <DialogHeader>
                    {server ? "Edit Server" : "Add Server"}
                </DialogHeader>
                <DialogBody>
                    <Stack spaceY={4}>
                        <FieldRoot required>
                            <FieldLabel>Server Name</FieldLabel>
                            {isLoading ? (
                                <Skeleton height="40px" />
                            ) : (
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="My MCP Server"
                                    disabled={isLoading || !!server}
                                />
                            )}
                        </FieldRoot>

                        <FieldRoot required>
                            <FieldLabel>Transport Type</FieldLabel>
                            {isLoading ? (
                                <Skeleton height="40px" />
                            ) : (
                                <NativeSelect.Root>
                                    <NativeSelect.Field
                                        value={transportType}
                                        onChange={(e) => setTransportType(e.currentTarget.value as 'stdio' | 'sse')}
                                    >
                                        <option value="stdio">stdio</option>
                                        <option value="sse">sse</option>
                                    </NativeSelect.Field>
                                    <NativeSelect.Indicator />
                                </NativeSelect.Root>
                            )}
                        </FieldRoot>

                        {transportType === "sse" ? (
                            <FieldRoot required>
                                <FieldLabel>URL</FieldLabel>
                                {isLoading ? (
                                    <Skeleton height="40px" />
                                ) : (
                                    <Input
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="http://localhost:3006/sse"
                                        disabled={isLoading}
                                    />
                                )}
                            </FieldRoot>
                        ) : (
                            <VStack align="stretch" spaceY={4}>
                                <FieldRoot required>
                                    <FieldLabel>Command</FieldLabel>
                                    {isLoading ? (
                                        <Skeleton height="40px" />
                                    ) : (
                                        <Input
                                            value={command}
                                            onChange={(e) => setCommand(e.target.value)}
                                            placeholder="npx or path to server"
                                            disabled={isLoading}
                                        />
                                    )}
                                </FieldRoot>

                                <FieldRoot>
                                    <FieldLabel>Arguments (space-separated)</FieldLabel>
                                    {isLoading ? (
                                        <Skeleton height="40px" />
                                    ) : (
                                        <Input
                                            value={args}
                                            onChange={(e) => setArgs(e.target.value)}
                                            placeholder="-y mcp-server-name"
                                            disabled={isLoading}
                                        />
                                    )}
                                </FieldRoot>

                                <FieldRoot>
                                    <FieldLabel>Environment Variables</FieldLabel>
                                    <Stack align="stretch" spaceY={2} width={'100%'}>
                                        {envVars.map((envVar, index) => (
                                            <HStack key={index} spaceX={2}>
                                                <Input
                                                    placeholder="KEY"
                                                    value={envVar.key}
                                                    onChange={(e) => handleEnvVarChange(index, 'key', e.target.value)}
                                                    disabled={isLoading}
                                                    flex={1}
                                                />
                                                <Input
                                                    placeholder="VALUE"
                                                    value={envVar.value}
                                                    onChange={(e) => handleEnvVarChange(index, 'value', e.target.value)}
                                                    disabled={isLoading}
                                                    flex={2}
                                                />
                                                {envVars.length > 0 && (
                                                    <IconButton
                                                        aria-label="Remove environment variable"
                                                        variant="ghost"
                                                        colorPalette="red"
                                                        onClick={() => handleRemoveEnvVar(index)}
                                                        disabled={isLoading}
                                                    >
                                                        <LuTrash2 />
                                                    </IconButton>
                                                )}
                                            </HStack>
                                        ))}
                                        <Button
                                            onClick={handleAddEnvVar}
                                            size="sm"
                                            variant="outline"
                                            disabled={isLoading}
                                        >
                                            <LuPlus /> Add Environment Variable
                                        </Button>
                                    </Stack>
                                </FieldRoot>
                            </VStack>
                        )}
                    </Stack>
                </DialogBody>
                <DialogFooter>
                    <Button 
                        variant="ghost" 
                        mr={3} 
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        colorPalette="blue"
                        onClick={handleSubmit}
                        disabled={!name || (transportType === "stdio" ? !command : !url) || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Spinner size="sm" mr={2} />
                                Saving...
                            </>
                        ) : (
                            'Save'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
            </DialogPositioner>
        </DialogRoot>
    )
}