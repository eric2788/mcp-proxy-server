import { authenticate } from "@/api/common";
import {
    DialogContent,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    DialogRoot,
    DialogTrigger,
    DialogBackdrop,
    DialogPositioner,
    Stack,
    FieldRoot,
    FieldLabel,
    AlertDescription,
    AlertRoot,
    AlertTitle
} from "@chakra-ui/react"
import { useState } from "react"

interface LoginDialogProps {
    isOpen: boolean;
    onLogin: (token: string) => void;
}

export function LoginDialog({ isOpen, onLogin }: LoginDialogProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setIsLoading(true);
            setError("");
            const data = await authenticate(username, password);
            // Store token and notify parent
            localStorage.setItem("auth_token", data.token);
            onLogin(data.token);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DialogRoot
            open={isOpen}
            size="sm"
            placement="center"
        >
            <DialogTrigger />
            <DialogBackdrop />
            <DialogPositioner>
                <DialogContent>
                    <DialogHeader>Login Required</DialogHeader>
                    <DialogBody>
                        <Stack spaceY={4}>
                            {error && (
                                <AlertRoot status="error">
                                    <AlertTitle>Login Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </AlertRoot>
                            )}
                            <FieldRoot>
                                <FieldLabel>Username</FieldLabel>
                                <Input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username"
                                />
                            </FieldRoot>
                            <FieldRoot>
                                <FieldLabel>Password</FieldLabel>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                />
                            </FieldRoot>
                        </Stack>
                    </DialogBody>
                    <DialogFooter>
                        <Button
                            colorPalette="blue"
                            onClick={handleLogin}
                            loading={isLoading}
                        >
                            Login
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </DialogPositioner>
        </DialogRoot>
    );
}