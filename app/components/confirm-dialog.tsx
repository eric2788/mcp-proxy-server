import { ColorMode } from './color-mode';
"use client"

import {
    DialogContent,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Text,
    DialogRoot,
    DialogTrigger,
    DialogBackdrop,
    DialogPositioner
} from "@chakra-ui/react"

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    isLoading?: boolean
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isLoading
}: ConfirmDialogProps) {
    return (
        <DialogRoot
            open={isOpen}
            onExitComplete={onClose}
            size="sm"
            placement="center"
        >
            <DialogTrigger />
            <DialogBackdrop />
            <DialogPositioner>
                <DialogContent>
                    <DialogHeader>
                        {title}
                    </DialogHeader>
                    <DialogBody>
                        <Text>{message}</Text>
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
                            colorPalette="red"
                            onClick={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : "Confirm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </DialogPositioner>
        </DialogRoot>
    )
}