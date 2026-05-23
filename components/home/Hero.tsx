'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface HeroProps {
  onNavigateToApp: () => void;
  onOpenAuth?: (tab: 'login' | 'signup') => void;
}

const ACCENT = '#1A5C3E';
const CHIPS = ['Said', 'Moussa', 'Fatima', 'Anrabe', 'Moroni', 'Mutsamudu'];


export default function Hero({ onNavigateToApp }: HeroProps) {
  const router = useRouter();
  const [nom,  setNom]  = useState('');
  const [lieu, setLieu] = useState('');
  const [type, setType] = useState('Famille');

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const q = nom.trim() || lieu.trim();
    if (q) {
      router.push(`/registre?q=${encodeURIComponent(q)}&lieu=${encodeURIComponent(lieu)}&cat=${type}`);
    } else {
      onNavigateToApp();
    }
  };

  return (
    <section
      id="hero"
      style={{
        backgroundColor: 'var(--bg)',
        padding: '108px 24px 80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Carte Comores en fond */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '-60px',
        transform: 'translateY(-50%)',
        width: '520px',
        height: '520px',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <Image
          src="/carte_comores.png"
          alt=""
          fill
          style={{ objectFit: 'contain', opacity: 0.07 }}
        />
      </div>

      {/* Contenu au-dessus de la carte */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

      {/* Eyebrow */}
      <p style={{
        color: ACCENT,
        fontSize: '11px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        marginBottom: '20px',
        textAlign: 'center',
        fontFamily: "'Satoshi', sans-serif",
        fontWeight: 600,
      }}>
        Mémoire généalogique comorienne
      </p>

      {/* Headline */}
      <h1 style={{
        fontFamily: "'Satoshi', sans-serif",
        fontWeight: 700,
        fontSize: 'clamp(30px, 5.5vw, 54px)',
        color: '#0D1410',
        textAlign: 'center',
        lineHeight: 1.15,
        maxWidth: '700px',
        marginBottom: '18px',
        letterSpacing: '-0.01em',
      }}>
        Votre famille,<br />
        Votre mémoire,<br />
        Votre héritage.
      </h1>

      {/* Search block */}
      <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '740px' }}>

        {/* Fields row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          border: '1px solid #D5CFC4',
          background: '#fff',
        }}>

          {/* Champ nom */}
          <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #D5CFC4' }}>
            <label style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9590', padding: '10px 14px 4px', fontFamily: "'Satoshi', sans-serif" }}>
              Nom / Lignée
            </label>
            <input
              type="text"
              value={nom}
              onChange={e => setNom(e.target.value)}
              placeholder="ex. Moussa, Anrabe…"
              autoComplete="off"
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#0D1410', fontSize: '14px', padding: '0 14px 10px', width: '100%', fontFamily: "'Satoshi', sans-serif" }}
            />
          </div>

          {/* Champ lieu */}
          <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #D5CFC4' }}>
            <label style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9590', padding: '10px 14px 4px', fontFamily: "'Satoshi', sans-serif" }}>
              Île ou localité
            </label>
            <input
              type="text"
              value={lieu}
              onChange={e => setLieu(e.target.value)}
              placeholder="ex. Moroni, Ngazidja…"
              autoComplete="off"
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#0D1410', fontSize: '14px', padding: '0 14px 10px', width: '100%', fontFamily: "'Satoshi', sans-serif" }}
            />
          </div>

          {/* Select type */}
          <div style={{ flex: '0 1 130px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <label style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9590', padding: '10px 14px 4px', fontFamily: "'Satoshi', sans-serif" }}>
              Type
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#0D1410', fontSize: '14px', padding: '0 30px 10px 14px', appearance: 'none', cursor: 'pointer', width: '100%', fontFamily: "'Satoshi', sans-serif" }}
            >
              {['Famille', 'Personne', 'Localité', 'Hinya'].map(o => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <svg style={{ position: 'absolute', right: '12px', bottom: '14px', pointerEvents: 'none', color: '#9A9590' }} width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </div>

        </div>

        {/* Search button */}
        <button
          type="submit"
          style={{
            width: '100%',
            backgroundColor: ACCENT,
            color: '#fff',
            border: 'none',
            padding: '14px',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            fontFamily: "'Satoshi', sans-serif",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Trouver une famille
        </button>

        {/* Suggestions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0 20px', marginTop: '20px', justifyContent: 'center' }}>
          <span style={{ color: '#9A9590', fontSize: '12px', letterSpacing: '0.08em', fontFamily: "'Satoshi', sans-serif" }}>Fréquents —</span>
          {CHIPS.map(chip => (
            <button
              key={chip}
              type="button"
              onClick={() => setNom(chip)}
              style={{
                background: 'none', border: 'none', borderBottom: '1px solid transparent',
                color: ACCENT, fontSize: '14px', cursor: 'pointer', padding: '2px 0',
                transition: 'border-color 0.15s', fontFamily: "'Satoshi', sans-serif",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderBottomColor = ACCENT)}
              onMouseLeave={e => (e.currentTarget.style.borderBottomColor = 'transparent')}
            >
              {chip}
            </button>
          ))}
        </div>

      </form>

      </div>
    </section>
  );
}
