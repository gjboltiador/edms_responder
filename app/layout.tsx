import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'EDMS Responder',
  description: 'The EDMS Responder Application is designed to efficiently track field responders and streamline the collection of incident and patient data.',
  generator: 'GF IT Solutions',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <main>
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  )
}
