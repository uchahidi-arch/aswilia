import type { Metadata } from 'next';
import { Cormorant_Garamond, Outfit } from 'next/font/google';
import { AuthProvider } from '@/hooks/useAuth';
import { AppStateProvider } from '@/hooks/useAppState';
import ParticlesBackground from '@/components/ParticlesBackground';
import SplashScreen from '@/components/SplashScreen';
import PageTransition from '@/components/PageTransition';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Aswilia · Mémoire Généalogique Comorienne',
  description: 'Tissez l\'arbre généalogique qui relie les cœurs comoriens.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${outfit.variable}`}>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 30% 40%, #e8e0d0 0%, #d4c9b0 50%, #c8bda0 100%)',
        position: 'relative',
      }}>
        <ParticlesBackground />
        <SplashScreen />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <AppStateProvider>
            <AuthProvider>
              <PageTransition>
                {children}
              </PageTransition>
            </AuthProvider>
          </AppStateProvider>
        </div>
      </body>
    </html>
  );
}
