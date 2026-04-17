'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface HomeNavProps {
  onNavigateToApp: () => void;
  onOpenAuth: (tab: 'login' | 'signup') => void;
}

export default function HomeNav({ onNavigateToApp, onOpenAuth }: HomeNavProps) {
  const { user, profile, signOut } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const isHome   = pathname === '/';

  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);   // dropdown user (desktop)
  const [mobileOpen,  setMobileOpen]  = useState(false);   // menu burger (mobile)
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fermer dropdown user si clic extérieur
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.home-user-btn')) setMenuOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  // Bloquer le scroll body quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const displayName = profile
    ? [profile.prenom, profile.nom].filter(Boolean).join(' ')
    : user?.email?.split('@')[0] || '?';
  const initial   = displayName[0]?.toUpperCase() || '?';
  const firstName = displayName.split(' ')[0];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogoClick = () => {
    setMobileOpen(false);
    if (isHome) window.scrollTo({ top: 0, behavior: 'smooth' });
    else router.push('/');
  };

  const handleFeatures = () => {
    setMobileOpen(false);
    if (isHome) scrollTo('sect-features');
    else router.push('/#sect-features');
  };

  const handleHinya = () => {
    setMobileOpen(false);
    if (isHome) scrollTo('sect-hinya');
    else router.push('/#sect-hinya');
  };

  const handleApp = () => {
    setMobileOpen(false);
    onNavigateToApp();
  };

  return (
    <>
      <nav className={`home-nav${scrolled ? ' scrolled' : ''}`} id="home-nav">

        {/* ── Logo ── */}
        <div className="nav-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <Image
            src="/logo.png"
            alt="Aswilia"
            width={160}
            height={44}
            style={{ objectFit: 'contain', width: 'auto', height: '44px' }}
            priority
          />
        </div>

        {/* ── Liens desktop ── */}
        <div className="nav-links">
          <button className="nav-link" onClick={handleFeatures}>Fonctionnalités</button>
          <button className="nav-link" onClick={handleHinya}>Hinya &amp; Daho</button>
          <button className="nav-link" onClick={handleApp}>Registre</button>
          <Link href="/chroniques" className="nav-link no-underline">Chroniques</Link>
          <Link href="/about" className="nav-link no-underline">À propos</Link>
        </div>

        {/* ── Actions desktop ── */}
        <div className="nav-actions">
          {!user ? (
            <div className="nav-auth-btns">
              <button className="nav-btn-s" onClick={() => onOpenAuth('login')}>Se connecter</button>
              <button className="nav-btn-p" onClick={() => onOpenAuth('signup')}>🌿 Créer mon arbre</button>
            </div>
          ) : (
            <div className="home-user-btn">
              <div className="home-user-trigger" onClick={() => setMenuOpen(v => !v)}>
                <span>{initial}</span>
                <span>{firstName}</span>
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
              {menuOpen && (
                <div className="home-dropdown open">
                  <button className="home-dd-item" onClick={() => { handleApp(); setMenuOpen(false); }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    Mon Arbre
                  </button>
                  <button className="home-dd-item red" onClick={() => { signOut(); setMenuOpen(false); }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Burger mobile ── */}
          <button
            className="home-burger"
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {mobileOpen ? (
              /* X */
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              /* Hamburger */
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ── Menu mobile déroulant ── */}
      {mobileOpen && (
        <div className="home-mobile-menu" ref={mobileRef}>
          <button className="hm-link" onClick={handleFeatures}>Fonctionnalités</button>
          <button className="hm-link" onClick={handleHinya}>Hinya &amp; Daho</button>
          <button className="hm-link" onClick={handleApp}>Registre</button>
          <Link href="/chroniques" className="hm-link" onClick={() => setMobileOpen(false)}>Chroniques</Link>
          <Link href="/about"      className="hm-link" onClick={() => setMobileOpen(false)}>À propos</Link>

          <div className="hm-divider" />

          {!user ? (
            <div className="hm-auth">
              <button className="hm-btn-s" onClick={() => { setMobileOpen(false); onOpenAuth('login'); }}>
                Se connecter
              </button>
              <button className="hm-btn-p" onClick={() => { setMobileOpen(false); onOpenAuth('signup'); }}>
                🌿 Créer mon arbre
              </button>
            </div>
          ) : (
            <div className="hm-auth">
              <button className="hm-btn-s" onClick={handleApp}>Mon Arbre</button>
              <button className="hm-btn-red" onClick={() => { signOut(); setMobileOpen(false); }}>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
