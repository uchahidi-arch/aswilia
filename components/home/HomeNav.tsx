'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDB } from '@/hooks/useDB';

interface HomeNavProps {
  onOpenAuth: (tab: 'login' | 'signup') => void;
  notifCount?: number;
  onToggleNotifs?: () => void;
}

const SEARCH_CATS = ['Famille', 'Personne', 'Hinya', 'Localité'];

export default function HomeNav({ onOpenAuth, notifCount = 0, onToggleNotifs }: HomeNavProps) {
  const { user, profile, signOut } = useAuth();
  const { exportJSON, exportGEDCOM, importGEDCOM, importJSON } = useDB();
  const router   = useRouter();
  const pathname = usePathname();
  const isArbre  = pathname.startsWith('/monarbre');

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);
  const [arbreOpen,  setArbreOpen]  = useState(false);
  const [searchQ,    setSearchQ]    = useState('');
  const [activeCat,  setActiveCat]  = useState('Famille');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const arbreRef = useRef<HTMLDivElement>(null);
  const userRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = (mobileOpen || searchOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setUserOpen(false); setArbreOpen(false); }
    };
    const onClickOutside = (e: MouseEvent) => {
      if (arbreRef.current && !arbreRef.current.contains(e.target as Node)) setArbreOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target as Node))  setUserOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  const displayName = profile
    ? [profile.prenom, profile.nom].filter(Boolean).join(' ')
    : user?.email?.split('@')[0] || '?';
  const initial   = displayName[0]?.toUpperCase() || '?';
  const firstName = displayName.split(' ')[0];

  const goHome = () => {
    setMobileOpen(false);
    if (pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' });
    else router.push('/');
  };

  const closeAll = () => {
    setMobileOpen(false);
    setUserOpen(false);
    setArbreOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      setSearchOpen(false);
      router.push(`/registre?q=${encodeURIComponent(searchQ)}&cat=${activeCat}`);
    }
  };

  const goMonArbre = () => {
    closeAll();
    if (!user) { onOpenAuth('login'); return; }
    router.push('/monarbre');
  };

  return (
    <>
      {/* Inputs fichiers cachés */}
      <input type="file" id="nav-ged-in"  style={{ display: 'none' }} accept=".ged,.gedcom" onChange={importGEDCOM} />
      <input type="file" id="nav-json-in" style={{ display: 'none' }} accept=".json"        onChange={importJSON} />

      <nav className="ln-nav">

        {/* Logo */}
        <button className="ln-logo" onClick={goHome} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Image src="/logo.png" alt="Aswilia" width={120} height={44} style={{ objectFit: 'contain', height: '40px', width: 'auto' }} priority />
        </button>

        {/* Desktop links */}
        <div className="ln-nav-center">

          {/* Dropdown Arbre */}
          <div ref={arbreRef} className="ln-link-wrap" style={{ position: 'relative' }}>
            <button
              className="ln-link"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setArbreOpen(v => !v)}
            >
              Arbre
              <svg
                width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5"
                viewBox="0 0 24 24"
                style={{ transition: 'transform 0.2s', transform: arbreOpen ? 'rotate(180deg)' : 'none' }}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            <div className={`ln-user-dd${arbreOpen ? ' open' : ''}`} style={{ minWidth: '180px' }}>
              {/* Navigation */}
              <button className="ln-dd-item" onClick={() => { closeAll(); router.push('/registre'); }}>Registre</button>
              <button className="ln-dd-item" onClick={goMonArbre}>Mon Arbre</button>

              {/* Actions — toujours visibles si connecté */}
              {user && (
                <>
                  <div className="ln-dd-sep" />
                  <button
                    className="ln-dd-item"
                    onClick={() => { closeAll(); router.push('/monarbre/nouveau'); }}
                  >
                    + Ajouter une personne
                  </button>
                  <button
                    className="ln-dd-item"
                    onClick={() => { closeAll(); router.push('/monarbre/union/nouvelle'); }}
                  >
                    + Nouveau mariage
                  </button>
                </>
              )}

              {/* Import / Export — uniquement sur /monarbre */}
              {user && isArbre && (
                <>
                  <div className="ln-dd-sep" />
                  <button
                    className="ln-dd-item"
                    onClick={() => { setArbreOpen(false); document.getElementById('nav-ged-in')?.click(); }}
                  >
                    Importer GEDCOM
                  </button>
                  <button
                    className="ln-dd-item"
                    onClick={() => { setArbreOpen(false); document.getElementById('nav-json-in')?.click(); }}
                  >
                    Importer JSON
                  </button>
                  <button className="ln-dd-item" onClick={() => { setArbreOpen(false); exportJSON(); }}>
                    Exporter JSON
                  </button>
                  <button className="ln-dd-item" onClick={() => { setArbreOpen(false); exportGEDCOM(); }}>
                    Exporter GEDCOM
                  </button>
                </>
              )}
            </div>
          </div>

          <Link href="/chroniques" className="ln-link">Chroniques</Link>
          <Link href="/about"      className="ln-link">À propos</Link>
          <button className="ln-link" onClick={() => setSearchOpen(true)}>Rechercher</button>
        </div>

        {/* Right actions */}
        <div className="ln-actions">
          {!user ? (
            <>
              <button className="ln-btn-login"     onClick={() => onOpenAuth('login')}>Se connecter</button>
              <button className="ln-btn-subscribe" onClick={() => onOpenAuth('signup')}>Créer mon arbre</button>
            </>
          ) : (
            <>
              {/* Cloche notifications */}
              {onToggleNotifs && (
                <button className="notif-btn" onClick={onToggleNotifs} title="Notifications" style={{ position: 'relative' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}
                </button>
              )}

              {/* User chip avec dropdown */}
              <div ref={userRef} className="ln-link-wrap" style={{ position: 'relative' }}>
                <div className="ln-user-chip" onClick={() => setUserOpen(v => !v)}>
                  <span>{initial}</span>
                  <span>{firstName}</span>
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                <div className={`ln-user-dd${userOpen ? ' open' : ''}`}>
                  <button className="ln-dd-item" onClick={() => { setUserOpen(false); router.push('/monarbre'); }}>Mon Arbre</button>
                  <button className="ln-dd-item" onClick={() => { setUserOpen(false); router.push('/registre'); }}>Registre</button>
                  <button className="ln-dd-item" onClick={() => { setUserOpen(false); router.push('/profil'); }}>Mon profil</button>
                  <div className="ln-dd-sep" />
                  <button className="ln-dd-item" style={{ color: '#c0392b' }} onClick={() => { signOut(); setUserOpen(false); }}>Déconnexion</button>
                </div>
              </div>
            </>
          )}

          {/* Burger mobile */}
          <button className="ln-burger" onClick={() => setMobileOpen(v => !v)} aria-label="Menu">
            {mobileOpen
              ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="ln-mobile-menu">
          <button className="ln-mm-link" onClick={() => { closeAll(); router.push('/registre'); }}>Registre</button>
          <button className="ln-mm-link" onClick={goMonArbre}>Mon Arbre</button>
          <Link href="/chroniques" className="ln-mm-link" onClick={closeAll}>Chroniques</Link>
          <Link href="/about"      className="ln-mm-link" onClick={closeAll}>À propos</Link>
          <button className="ln-mm-link" onClick={() => { setMobileOpen(false); setSearchOpen(true); }}>Rechercher</button>

          {user && (
            <>
              <div className="ln-mm-divider" />
              <button className="ln-mm-link" onClick={() => { closeAll(); router.push('/monarbre/nouveau'); }}>+ Ajouter une personne</button>
              <button className="ln-mm-link" onClick={() => { closeAll(); router.push('/monarbre/union/nouvelle'); }}>+ Nouveau mariage</button>
            </>
          )}

          {user && isArbre && (
            <>
              <div className="ln-mm-divider" />
              <button className="ln-mm-link" onClick={() => { setMobileOpen(false); document.getElementById('nav-ged-in')?.click(); }}>Importer GEDCOM</button>
              <button className="ln-mm-link" onClick={() => { setMobileOpen(false); exportJSON(); }}>Exporter JSON</button>
              <button className="ln-mm-link" onClick={() => { setMobileOpen(false); exportGEDCOM(); }}>Exporter GEDCOM</button>
            </>
          )}

          <div className="ln-mm-divider" />
          <div className="ln-mm-auth">
            {!user ? (
              <>
                <button className="ln-mm-btn-s" onClick={() => { closeAll(); onOpenAuth('login'); }}>Se connecter</button>
                <button className="ln-mm-btn-p" onClick={() => { closeAll(); onOpenAuth('signup'); }}>Créer mon arbre</button>
              </>
            ) : (
              <>
                <button className="ln-mm-btn-s" onClick={() => { closeAll(); router.push('/profil'); }}>Mon profil</button>
                <button className="ln-mm-btn-red" onClick={() => { signOut(); closeAll(); }}>Déconnexion</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Search overlay */}
      <div className={`ln-search-overlay${searchOpen ? ' open' : ''}`}>
        <button className="ln-so-close" onClick={() => setSearchOpen(false)}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <p className="ln-so-label">Que cherchez-vous ?</p>
        <form onSubmit={handleSearch} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="ln-so-bar">
            <input
              ref={searchInputRef}
              className="ln-so-input"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder={`Chercher une ${activeCat.toLowerCase()}…`}
            />
            <button type="submit" className="ln-so-submit">Chercher</button>
          </div>
          <div className="ln-so-cats">
            {SEARCH_CATS.map(cat => (
              <button
                key={cat}
                type="button"
                className={`ln-so-cat${activeCat === cat ? ' on' : ''}`}
                onClick={() => setActiveCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </form>
      </div>
    </>
  );
}
