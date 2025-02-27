import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Chronos frontend',
    description: 'Chronos frontend app',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html suppressHydrationWarning>
            <body>{children}</body>
        </html>
    );
}
