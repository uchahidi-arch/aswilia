'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function HomeFooter() {
  return (
    <footer className="ln-footer">
      <div className="ln-footer-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="ln-footer-logo">
            <Image src="/logo.png" alt="Aswilia" width={120} height={52} style={{ objectFit: 'contain', height: '52px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
          </div>
          <p className="ln-footer-tagline">
            Mémoire généalogique comorienne.<br />
            Archipel des Comores.
          </p>
        </div>
        <div className="ln-footer-links">
          <Link href="/chroniques" className="ln-footer-link">Chroniques</Link>
          <Link href="/about" className="ln-footer-link">À propos</Link>
          <Link href="/confidentialite" className="ln-footer-link">Confidentialité</Link>
        </div>
      </div>
      <div className="ln-footer-bottom">
        <span>© {new Date().getFullYear()} Aswilia · Développé par U-Data</span>
      </div>
    </footer>
  );
}
