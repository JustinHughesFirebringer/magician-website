import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '../components/navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Magic Directory - Find Professional Magicians',
  description: 'Discover and connect with professional magicians across the United States.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen bg-background">{children}</main>
      </body>
    </html>
  );
}
