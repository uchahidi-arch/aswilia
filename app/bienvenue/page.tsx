'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

export default function BienvenuePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading) setReady(true);
  }, [loading]);

  const pseudo = profile?.username
    || profile?.prenom
    || user?.email?.split('@')[0]
    || 'vous';

  if (!ready) {
    return (
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="spin" />
      </div>
    );
  }

  // Pas encore connecté (email non confirmé)
  if (!user) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, fontFamily: "'Satoshi', sans-serif", color: 'var(--t1)', marginBottom: '12px' }}>
          Vérifiez votre email
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--t2)', maxWidth: '400px', lineHeight: 1.7, marginBottom: '24px' }}>
          Un lien de confirmation vous a été envoyé. Cliquez sur ce lien pour activer votre compte et rejoindre Aswilia.
        </p>
        <button className="btn btn-sec" onClick={() => router.push('/')}>
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>

      {/* Logo */}
      <div style={{ marginBottom: '40px' }}>
        <Image src="/logo.png" alt="Aswilia" width={140} height={39} style={{ objectFit: 'contain', width: 'auto', height: '39px' }} />
      </div>

      {/* Carte principale */}
      <div style={{
        background: 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.85)',
        borderRadius: 'var(--r-lg)',
        padding: '48px 40px',
        maxWidth: '520px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 8px 40px rgba(20,18,13,0.12)',
      }}>
        {/* Titre */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          fontFamily: "'Satoshi', sans-serif",
          color: 'var(--t1)',
          margin: '0 0 8px',
          lineHeight: 1.2,
        }}>
          Bienvenue, {pseudo} !
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--green)', fontWeight: 600, marginBottom: '28px' }}>
          Votre compte Aswilia est prêt.
        </p>

        {/* Étapes */}
        <div style={{ textAlign: 'left', marginBottom: '36px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { title: 'Ajoutez votre premier membre', desc: 'Commencez par vous-même ou un ancêtre — chaque arbre commence par une racine.' },
            { title: 'Tissez les liens familiaux', desc: 'Reliez parents, enfants et unions pour faire grandir votre arbre.' },
            { title: 'Explorez le registre', desc: 'Retrouvez des familles comoriennes et connectez vos lignées.' },
          ].map(({ title, desc }) => (
            <div key={title} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', marginBottom: '2px' }}>{title}</div>
                <div style={{ fontSize: '12px', color: 'var(--t3)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA principal */}
        <button
          className="btn btn-pri"
          style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '14px', borderRadius: 'var(--r-sm)' }}
          onClick={() => router.push('/monarbre/nouveau')}
        >
          Créer mon premier membre →
        </button>

        {/* Lien secondaire */}
        <div style={{ marginTop: '16px' }}>
          <span
            style={{ fontSize: '12px', color: 'var(--t3)', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => router.push('/registre')}
          >
            Explorer le registre d'abord
          </span>
        </div>
      </div>
    </div>
  );
}
