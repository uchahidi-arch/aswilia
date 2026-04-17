'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PersonCard from '@/components/app/PersonCard';
import { slugify } from '@/lib/slugify';
import type { Person } from '@/lib/types';

// Nom complet → slug court pour le lien breadcrumb vers /registre/[ile]
const ILE_SHORT_SLUG: Record<string, string> = {
  'Grande Comore (Ngazidja)': 'ngazidja',
  'Anjouan (Ndzwani)':        'ndzuani',
  'Mohéli (Mwali)':           'mwali',
  'Mayotte (Maore)':          'maore',
};

interface LocaliteRow {
  ile: string;
  region: string;
  localite: string;
}

export default function LocalitePage({
  params,
}: {
  params: Promise<{ ile: string; region: string; localite: string }>;
}) {
  const { ile: ileSlug, region: regionSlug, localite: localiteSlug } = use(params);
  const router = useRouter();

  const [found, setFound]     = useState<LocaliteRow | null>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [hinya, setHinya]     = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    import('@/lib/supabase').then(async ({ supabase }) => {
      // 1. Résoudre les slugs → valeurs brutes
      const { data: localites } = await supabase
        .from('localites')
        .select('ile, region, localite');

      const rows = (localites ?? []) as LocaliteRow[];
      const match = rows.find(
        r =>
          slugify(r.ile) === ileSlug &&
          slugify(r.region) === regionSlug &&
          slugify(r.localite) === localiteSlug
      );

      if (!match) { setNotFound(true); setLoading(false); return; }
      setFound(match);

      // 2. Charger les personnes
      const { data: pData } = await supabase
        .from('persons')
        .select('*')
        .eq('ile', match.ile)
        .eq('localite', match.localite)
        .order('nom', { ascending: true });

      const list = (pData ?? []) as Person[];
      setPersons(list);
      setHinya([...new Set(list.map(p => p.clan ? (p.prefix_lignee || 'Hinya') + ' ' + p.clan : null).filter((c): c is string => Boolean(c)))].sort());
      setLoading(false);
    });
  }, [ileSlug, regionSlug, localiteSlug]);

  if (loading) {
    return (
      <div style={{ position: 'relative', flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="view-section" style={{ flex: 1, background: 'transparent', display: 'flex', flexDirection: 'column' }}>
          <div className="folder-grid">
            <div className="empty-grid">
              <div className="spin" style={{ width: '24px', height: '24px', borderWidth: '2px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !found) {
    return (
      <div className="view-section">
        <div className="empty-grid">Localité introuvable.</div>
      </div>
    );
  }

  const ileShort = ILE_SHORT_SLUG[found.ile] ?? ileSlug;

  return (
    <div style={{ position: 'relative', flex: 1, width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="view-section" style={{ flex: 1, background: 'transparent', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Breadcrumb */}
        <div className="explorer-topbar">
          <Link href="/registre" className="bc-item-v2" style={{ textDecoration: 'none' }}>Registre</Link>
          <span className="bc-sep-v2">›</span>
          <Link href={`/registre/${ileShort}`} className="bc-item-v2" style={{ textDecoration: 'none' }}>
            {found.ile.split(' (')[0]}
          </Link>
          <span className="bc-sep-v2">›</span>
          <Link href={`/registre/${ileShort}/${regionSlug}`} className="bc-item-v2" style={{ textDecoration: 'none' }}>
            {found.region}
          </Link>
          <span className="bc-sep-v2">›</span>
          <span className="bc-current-v2">{found.localite}</span>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {/* En-tête */}
          <div style={{ padding: '20px 24px 0' }}>
            <div style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.6)',
              borderRadius: '20px',
              padding: '20px 24px',
              marginBottom: '8px',
              boxShadow: '0 4px 20px rgba(20,18,13,0.08)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: 'var(--t1)' }}>
                  🏘️ {found.localite}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '4px' }}>
                  {found.region} · {found.ile}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[
                  { val: persons.length, label: 'personnes' },
                  { val: hinya.length,   label: 'hinya'     },
                ].map(({ val, label }) => (
                  <div key={label} style={{
                    background: 'rgba(255,255,255,0.6)', borderRadius: '12px',
                    padding: '8px 14px', textAlign: 'center', minWidth: '66px',
                  }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green)' }}>{val}</div>
                    <div style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '2px' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hinya représentés */}
            {hinya.length > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.6)',
                borderRadius: '20px',
                padding: '16px 20px',
                marginBottom: '8px',
                boxShadow: '0 4px 20px rgba(20,18,13,0.08)',
              }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--t3)', marginBottom: '10px' }}>
                  Hinya représentés
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {hinya.map(clan => (
                    <Link
                      key={clan}
                      href={`/registre/hinya/${slugify(clan)}`}
                      style={{
                        display: 'inline-block', padding: '4px 12px',
                        borderRadius: '100px',
                        background: 'var(--green-bg)', border: '1px solid var(--green-bd)',
                        color: 'var(--green)', fontSize: '12px', fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      ⬡ {clan}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grille PersonCard */}
          {persons.length === 0 ? (
            <div className="empty-grid">Aucune personne enregistrée pour cette localité.</div>
          ) : (
            <div className="folder-grid">
              {persons.map(p => (
                <PersonCard
                  key={p.id}
                  person={p}
                  onClick={() => router.push(`/registre/${p.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
