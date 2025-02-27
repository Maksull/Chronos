import { ThemeProvider } from '@/contexts/ThemeContext';
import { Footer, Header } from '@/components';
import { Locale } from '@/middleware';
import { getDictionary } from '@/lib/dictionary';
import { AuthProvider, DictionaryProvider } from '@/contexts';

export default async function LangLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { lang: Locale };
}) {
    const resolvedParams = await params;
    const dict = await getDictionary(resolvedParams.lang);

    return (
        <ThemeProvider>
            <DictionaryProvider dict={dict} lang={resolvedParams.lang}>
                <AuthProvider>
                    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-dark-bg">
                        <Header />
                        <main className="flex-grow">{children}</main>
                        <Footer />
                    </div>
                </AuthProvider>
            </DictionaryProvider>
        </ThemeProvider>
    );
}
