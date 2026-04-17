'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function HomeFooter() {

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Image
            src="/logo.png"
            alt="Aswilia"
            width={160}
            height={44}
            style={{ objectFit: 'contain', width: 'auto', height: '40px' }}
          />
          <div style={{ fontSize: '13px', color: 'var(--t2)', whiteSpace: 'nowrap' }}>
            Mémoire généalogique comorienne · Archipel des Comores
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <Link
            href="/confidentialite"
            style={{ fontSize: '12px', color: 'var(--t3)', textDecoration: 'none', transition: 'color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--t3)')}
          >
            Confidentialité
          </Link>
          <div style={{ fontSize: '13px', color: 'var(--t2)', whiteSpace: 'nowrap' }}>
            Développé par U-Data
          </div>
        </div>
      </div>
    </footer>
  );
}
