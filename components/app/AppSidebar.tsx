'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useSidebar } from '@/hooks/useSidebar';
import { useDB } from '@/hooks/useDB';

const NAV = [
  { href: '/monarbre',   label: 'Mon Arbre'  },
  { href: '/registre',   label: 'Registre'   },
  { href: '/chroniques', label: 'Chroniques' },
  { href: '/about',      label: 'À propos'   },
];

export default function AppSidebar() {
  const { isOpen, toggle } = useSidebar();
  const { state } = useDB();
  const router   = useRouter();
  const pathname = usePathname();

  const recentPersons = [...state.myPersons]
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 6);

  if (!isOpen) {
    return (
      <button
        onClick={toggle}
        title="Ouvrir le panneau"
        style={{
          position: 'fixed', left: 0, top: '50%', transform: 'translateY(-50%)',
          zIndex: 40, width: 22, height: 48, borderRadius: '0 8px 8px 0',
          background: 'var(--warm2)', border: '1px solid var(--bd)', borderLeft: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, color: 'var(--t3)',
        }}
      >
        ›
      </button>
    );
  }

  return (
    <div style={{
      width: 192, flexShrink: 0, height: '100%', overflowY: 'auto',
      borderRight: '1px solid var(--bd)', background: 'var(--warm1)',
      display: 'flex', flexDirection: 'column', padding: '16px 10px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Panneau
        </span>
        <button
          onClick={toggle}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--t3)', padding: '2px 6px', lineHeight: 1 }}
        >
          ‹
        </button>
      </div>

      {/* Récemment ajoutés */}
      {recentPersons.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, paddingLeft: 4 }}>
            Récemment ajoutés
          </div>
          {recentPersons.map(p => (
            <button
              key={p.id}
              onClick={() => router.push(`/monarbre/${p.id}`)}
              style={{
                width: '100%', textAlign: 'left', background: 'none', border: 'none',
                cursor: 'pointer', padding: '5px 6px', borderRadius: 6, marginBottom: 1,
                fontSize: 12, color: 'var(--t1)', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 7,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--warm2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: p.genre === 'M' ? 'rgba(45,122,84,0.15)' : 'rgba(200,80,80,0.12)',
                border: `1px solid ${p.genre === 'M' ? 'rgba(45,122,84,0.35)' : 'rgba(200,80,80,0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: p.genre === 'M' ? 'var(--green)' : '#c85050',
              }}>
                {p.genre === 'M' ? '♂' : '♀'}
              </span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {p.prenom} {p.nom || ''}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, paddingLeft: 4 }}>
          Navigation
        </div>
        {NAV.map(({ href, label }) => {
          const active = pathname === href || (pathname.startsWith(href) && href !== '/');
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              style={{
                width: '100%', textAlign: 'left',
                background: active ? 'var(--green-bg)' : 'none',
                border: 'none', cursor: 'pointer', padding: '7px 8px', borderRadius: 6, marginBottom: 1,
                fontSize: 12, color: active ? 'var(--green)' : 'var(--t2)', fontWeight: active ? 600 : 400,
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--warm2)'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
