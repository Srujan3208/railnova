import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'RAILNOVA — Every journey, thoughtfully connected', description: 'Plan, manage and understand your rail journeys with RAILNOVA.', applicationName: 'RAILNOVA', manifest: '/manifest.json', icons: { icon: '/favicon.svg' } };
export const viewport: Viewport = { themeColor: '#102e4a', width: 'device-width', initialScale: 1, maximumScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }