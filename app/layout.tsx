import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import ConditionalWhatsAppButton from '@/components/ConditionalWhatsAppButton';
import { Toaster } from '@/components/ui/toaster';
import SettingsProvider from '@/components/SettingsProvider';
import { getSettings } from '@/lib/supabase';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settings.site_name || 'ElegantShop';
  const siteDescription =
    settings.site_description ||
    'Discover premium fashion and lifestyle products with seamless shopping experience';
  const siteLogo = settings.site_logo;

  return {
    title: `${siteName} - Premium Fashion & Lifestyle`,
    description: siteDescription,
    keywords: 'fashion, lifestyle, premium, shopping, ecommerce, Nigeria',
    authors: [{ name: siteName }],
    icons: {
      icon: siteLogo || '/favicon.ico',
    },
    openGraph: {
      title: `${siteName} - Premium Fashion & Lifestyle`,
      description: siteDescription,
      type: 'website',
      locale: 'en_US',
      images: siteLogo ? [siteLogo] : [],
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SettingsProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <ConditionalWhatsAppButton />
          <Toaster />
        </SettingsProvider>
      </body>
    </html>
  );
}