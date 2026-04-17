'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PersonView from './_PersonView';

// Slug court → nom complet de l'île (même mapping que RegistreView)
const SLUG_TO_ILE: Record<string, string> = {
  ngazidja: 'Grande Comore (Ngazidja)',
  ndzuani:  'Anjouan (Ndzwani)',
  mwali:    'Mohéli (Mwali)',
  maore:    'Mayotte (Maore)',
};

const ILE_META: Record<string, { accent: string; nameComorian: string }> = {
  'Grande Comore (Ngazidja)': { accent: '#1a3d2e', nameComorian: 'Ngazidja' },
  'Anjouan (Ndzwani)':        { accent: '#3d1a1a', nameComorian: 'Ndzwani'  },
  'Mohéli (Mwali)':           { accent: '#1a2e3d', nameComorian: 'Mwali'    },
  'Mayotte (Maore)':          { accent: '#2e1a3d', nameComorian: 'Maore'    },
};

function slugify(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface LocaliteRow { region: string; localite: string }

function IleView({ ileSlug }: { ileSlug: string }) {
  const router  = useRouter();
  const ileName = SLUG_TO_ILE[ileSlug];
  const meta    = ILE_META[ileName] ?? { accent: '#2e2e2e', nameComorian: '' };

  const [rows, setRows]       = useState<LocaliteRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('@/lib/supabase').then(async ({ supabase }) => {
      const { data } = await supabase
        .from('localites')
        .select('region, localite')
        .eq('ile', ileName)
        .order('region', { ascending: true });
      setRows((data ?? []) as LocaliteRow[]);
      setLoading(false);
    });
  }, [ileName]);

  // Grouper par région pour compter les localités
  const byRegion: [string, number][] = Object.entries(
    rows.reduce<Record<string, number>>((acc, { region }) => {
      acc[region] = (acc[region] ?? 0) + 1;
      return acc;
    }, {})
  );

  return (
    <div style={{ position: 'relative', flex: 1, width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="view-section" style={{ flex: 1, background: 'transparent', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar / breadcrumb */}
        <div className="explorer-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1 }}>
            <span
              className="bc-item-v2"
              style={{ cursor: 'pointer' }}
              onClick={() => router.push('/registre')}
            >
              Registre
            </span>
            <span className="bc-sep-v2">›</span>
            <span className="bc-current-v2">{ileName.split(' (')[0]}</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--t3)', fontStyle: 'italic' }}>
            {meta.nameComorian}
          </span>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="folder-grid">
            <div className="empty-grid">
              <div className="spin" style={{ width: '24px', height: '24px', borderWidth: '2px' }} />
            </div>
          </div>
        ) : byRegion.length === 0 ? (
          <div className="empty-grid">Aucune région enregistrée pour cette île.</div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {byRegion.map(([reg, count]) => (
                <div
                  key={reg}
                  className="fadein"
                  onClick={() => router.push(`/registre/${ileSlug}/${slugify(reg)}`)}
                  style={{
                    background: 'rgba(255,255,255,0.75)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.6)',
                    borderRadius: '20px',
                    padding: '20px 16px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 4px 20px rgba(20,18,13,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 28px rgba(20,18,13,0.14)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(20,18,13,0.08)';
                  }}
                >
                  <span style={{ fontSize: '32px', lineHeight: 1 }}>📍</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: meta.accent, textAlign: 'center', lineHeight: 1.3 }}>
                    {reg}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--t3)' }}>
                    {count} localité{count > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ ile: string }> }) {
  const { ile } = use(params);

  // Slug connu → vue île
  if (SLUG_TO_ILE[ile]) return <IleView ileSlug={ile} />;

  // Sinon c'est un UUID de personne
  return <PersonView id={ile} />;
}
