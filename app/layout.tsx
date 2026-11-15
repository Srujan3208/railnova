import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'RAILNOVA — Every journey, thoughtfully connected', description: 'Plan, manage and understand your rail journeys with RAILNOVA.', applicationName: 'RAILNOVA', manifest: '/manifest.json', icons: { icon: [{ url: '/railnova-mark.svg', type: 'image/svg+xml' }, { url: '/favicon.svg', type: 'image/svg+xml' }] } };
export const viewport: Viewport = { themeColor: '#103e70', width: 'device-width', initialScale: 1, maximumScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }