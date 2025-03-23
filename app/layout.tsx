import { Provider } from '@/components/provider'
import { Toaster } from "./components/toaster"
import { AuthProvider } from "./components/auth-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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