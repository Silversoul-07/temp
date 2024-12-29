import '@/styles/globals.css';
import React from 'react';
import { ThemeProvider } from "@/components/Themes"
import { Toaster } from "@/components/ui/sonner"

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: {
    template: '%s - My App',
  },
  description: 'Store and view media from the internet',
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className='h-screen'>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-right" richColors expand={false} />
        </ThemeProvider>
        </body>
      </html>
    </>
  )
}
