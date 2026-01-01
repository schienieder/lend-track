import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = 'LendTrack';
const siteDescription = 'Welcome to LendTrack - LendTrack is a web application system that tracks lended amounts, due dates, interest rates, and other financial details. The application features secure user authentication, automated reminders, and comprehensive reporting tools to help manage personal and business loans efficiently.';

export const metadata: Metadata = {
  title: {
    template: `%s | ${siteTitle}`,
    default: siteTitle,
  },
  description: siteDescription,
  icons: {
    icon: '/favicon.ico',
    shortcut: '/images/favicon-16x16.ico',
    apple: '/images/lend-track-logo.png',
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    images: ['/images/lend-track-logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/images/lend-track-logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
