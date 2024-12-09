import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '../components/Header';
import { cn } from '../lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Find a Magician United States',
  description: 'Find professional magicians in your area across the United States',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(
        inter.className,
        'min-h-screen bg-background font-sans antialiased'
      )}>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t bg-card">
            <div className="container flex h-16 items-center justify-center text-sm text-muted-foreground">
              &copy; 2024 Find a Magician United States. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
