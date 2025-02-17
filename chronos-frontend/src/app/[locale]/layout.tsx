import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/contexts/ThemeContext';
import '../globals.css';
import { getMessages } from 'next-intl/server';

export const metadata: Metadata = {
    title: 'Chronos frontend',
    description: 'Chronos frontend app',
};

export default async function RootLayout({
    children,
    params: { locale },
}: Readonly<{
    children: React.ReactNode;
    params: { locale: string };
}>) {
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <script
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
                console.error('Could not access localStorage:', e);
              }
            `,
                    }}
                />
            </head>
            <body>
                <NextIntlClientProvider messages={messages}>
                    <ThemeProvider>{children}</ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
