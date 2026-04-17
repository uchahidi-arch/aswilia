'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HomeNav from '@/components/home/HomeNav';
import Hero from '@/components/home/Hero';
import StatsBar from '@/components/home/StatsBar';
import Features from '@/components/home/Features';
import HinyaSection from '@/components/home/HinyaSection';
import CTABand from '@/components/home/CTABand';
import HomeFooter from '@/components/home/HomeFooter';
import DemoTree from '@/components/home/DemoTree';
import AuthModal from '@/components/auth/AuthModal';
import Toast from '@/components/ui/Toast';

export default function HomePage() {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');

  const openAuth = (tab: 'login' | 'signup') => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  const goToApp = () => router.push('/registre');

  return (
    <>
      <HomeNav onNavigateToApp={goToApp} onOpenAuth={openAuth} />

      <main>
        <Hero onNavigateToApp={goToApp} onOpenAuth={openAuth} />
        <StatsBar />
        <DemoTree />
        <Features />
        <HinyaSection />
        <CTABand onOpenAuth={openAuth} onNavigateToApp={goToApp} />
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
