'use client';

import type { Person } from '@/lib/types';

interface PersonCardProps {
  person: Person;
  onClick: (p: Person) => void;
  bulkMode?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

function ligneeStr(p: Person): string {
  return [[p.prefix_lignee, p.clan].filter(Boolean).join(' '), p.daho]
    .filter(Boolean).join(' · ');
}

function SilhouetteSVG({ genre, size = 34 }: { genre?: string | null; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#9E9589">
      <circle cx="12" cy="8" r="4" />
      <path d={genre === 'F'
        ? 'M5 21c0-3.866 3.134-7 7-7s7 3.134 7 7'
        : 'M4 21v-1a8 8 0 0 1 16 0v1'
      } />
    </svg>
  );
}

export default function PersonCard({ person, onClick, bulkMode, selected, onSelect }: PersonCardProps) {
  const p = person;
  const lig = ligneeStr(p);

  return (
    <div
      className={`person-card${p.deceased ? ' deceased' : ''}${bulkMode ? ' bulk-select' : ''}`}
      onClick={() => bulkMode ? onSelect?.(p.id) : onClick(p)}
    >
      {bulkMode && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect?.(p.id)}
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px' }}
          onClick={e => e.stopPropagation()}
        />
      )}

      {/* Avatar */}
      <div style={{
        width: 64, height: 64, borderRadius: 8, overflow: 'hidden',
        background: '#F0EDE6', display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 12px', flexShrink: 0,
      }}>
        {p.photo_url
          ? <img src={p.photo_url} alt={p.prenom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <SilhouetteSVG genre={p.genre} size={34} />
        }
      </div>

      <div className="pc-prenom">{p.prenom}</div>
      {p.nom && <div className="pc-nom">{p.nom}</div>}

      <div className="pc-tags">
        {lig && (
          <span style={{
            fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 'var(--r-sm)',
            background: 'transparent', border: '1px solid var(--gold-bd)', color: 'var(--gold)',
          }}>
            {lig}
          </span>
        )}
        {p.deceased
          ? <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: 'transparent', border: '1px solid #9E9589', color: '#9E9589' }}>Décédé·e</span>
          : <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: 'transparent', border: '1px solid #2D6A4F', color: '#2D6A4F' }}>En vie</span>
        }
        {p.masque && (
          <span className="pc-tag" style={{ background: 'var(--warm2)', color: 'var(--t3)', border: '1px solid var(--bd)' }}>
            Masqué
          </span>
        )}
      </div>
    </div>
  );
}
