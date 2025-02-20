// src/app/[locale]/layout.tsx
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Header, Footer } from '@/components';
import Script from 'next/script';
import '../globals.css';

export const metadata: Metadata = {
    title: 'Chronos frontend',
    description: 'Chronos frontend app',
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
    params: { locale: string };
}>) {
    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <Script
                    id="theme-script"
                    strategy="beforeInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            try {
                                let savedTheme = localStorage.getItem('theme');
                                if (!savedTheme) {
                                    savedTheme = 'dark';
                                    localStorage.setItem('theme', savedTheme);
                                }
                                if (savedTheme === 'dark') {
                                    document.documentElement.classList.add('dark');
                                }
                            } catch (e) {
                                console.error('could not access localStorage:', e);
                            }
                        `,
                    }}
                />
            </head>
            <body className="min-h-screen bg-gray-50 dark:bg-dark-bg">
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <ThemeProvider>
                        <div className="flex flex-col min-h-screen">
                            <Header />
                            <main className="flex-grow">{children}</main>
                            <Footer />
                        </div>
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
