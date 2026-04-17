'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface HeroProps {
  onNavigateToApp: () => void;
  onOpenAuth: (tab: 'login' | 'signup') => void;
}

export default function Hero({ onNavigateToApp, onOpenAuth }: HeroProps) {
  const router = useRouter();
  const { user } = useAuth();

  const scrollToFeatures = () => {
    document.getElementById('sect-features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="hero">
      <div className="hero-eyebrow">
        <div className="hero-dot" />
        Mémoire Généalogique Comorienne
      </div>

      <h1 className="hero-title">
        Votre famille,<br />
        Votre <em>mémoire</em>,<br />
        Votre <span className="gold">héritage</span>
      </h1>

      <p className="hero-sub">
        Créez votre arbre généalogique comorien et préservez votre Hinya.
      </p>

      {!user ? (
        <div className="hero-cta">
          <button className="btn-hero btn-hero-p" onClick={() => onOpenAuth('signup')}>
            🌿 Créer mon arbre
          </button>
          <button className="btn-hero btn-hero-s" onClick={onNavigateToApp}>
            🔍 Chercher ma famille
          </button>
        </div>
      ) : (
        <div className="hero-cta">
          <button className="btn-hero btn-hero-p" onClick={() => router.push('/monarbre')}>
            → Mon Arbre
          </button>
          <button className="btn-hero btn-hero-s" onClick={onNavigateToApp}>
            Explorer le registre
          </button>
        </div>
      )}

      <div className="hero-scroll" onClick={scrollToFeatures} style={{ cursor: 'pointer' }}>
        <div className="scroll-line" />
        Découvrir
      </div>
    </section>
  );
}
