import { Provider } from '@/components/provider'
import { Toaster } from "./components/toaster"
import { AuthProvider } from "./components/auth-provider"
import { PublicEnvScript } from "next-runtime-env"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <PublicEnvScript />
      </head>
      <body>
        <Provider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </Provider>
      </body>
    </html>
  )
}