import type { Metadata } from 'next';
import { AuthProvider } from '@/hooks/useAuth';
import { AppStateProvider } from '@/hooks/useAppState';
import SplashScreen from '@/components/SplashScreen';
import PageTransition from '@/components/PageTransition';
import './globals.css';

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
    <html lang="fr">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body>
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
