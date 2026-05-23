'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HomeNav from '@/components/home/HomeNav';
import Hero from '@/components/home/Hero';
import Contribution from '@/components/home/Contribution';
import HomeFooter from '@/components/home/HomeFooter';
import DemoTree from '@/components/home/DemoTree';
import AuthModal from '@/components/auth/AuthModal';
import Toast from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');

  const openAuth = (tab: 'login' | 'signup') => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  const goToApp = () => router.push('/registre');

  return (
    <>
      <HomeNav onOpenAuth={openAuth} />

      <main>
        <Hero onNavigateToApp={goToApp} onOpenAuth={openAuth} />
        <DemoTree />
        <Contribution
          onOpenAuth={openAuth}
          isLoggedIn={!!user}
          onGoToTree={() => router.push('/monarbre')}
        />
      </main>

      <HomeFooter />

      <AuthModal
        open={authOpen}
        initialTab={authTab}
        onClose={() => setAuthOpen(false)}
      />
      <Toast />
    </>
  );
}
