'use client';

import { Inter } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { RootLayout } from '@/components/layout/root-layout';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function Layout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <html lang="zh-CN" className={inter.className}>
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <RootLayout>{children}</RootLayout>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
} 