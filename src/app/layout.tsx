import type { Metadata, Viewport } from 'next';
import { Roboto_Condensed } from 'next/font/google';

import { AppFeedbackProvider } from '@/components/ui/AppFeedback';

import '@/styles/globals.css';

const robotoCondensed = Roboto_Condensed({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-roboto-condensed',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'EBC APP — Ebenezer Baptist Church',
  description:
    'Church management hub for Ebenezer Baptist Church of Woodbridge, Virginia.',
  icons: {
    icon: '/branding/ebc-official-logo.png',
    apple: '/branding/ebc-official-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${robotoCondensed.variable} font-sans`}>
        <AppFeedbackProvider>{children}</AppFeedbackProvider>
      </body>
    </html>
  );
}

export const dynamic = 'force-dynamic';
