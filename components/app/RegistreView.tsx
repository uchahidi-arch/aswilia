'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PersonCard from '@/components/app/PersonCard';
import { useDB } from '@/hooks/useDB';
import { useAuth } from '@/hooks/useAuth';
import type { Person } from '@/lib/types';
import { useRegistreSearch } from '@/app/registre/layout';

type RegistreTab = 'iles' | 'hinya' | 'creators' | 'all';
type Step = 'iles' | 'localites' | 'persons';

interface RegistreViewProps {
  onShowPerson: (p: Person) => void;
  onOpenAuth: (tab: 'login' | 'signup') => void;
  onRelier?: (personId: string) => void;
}

const slugify = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const ILE_SLUG_MAP: Record<string, string> = {
  'Grande Comore (Ngazidja)': 'ngazidja',
  'Anjouan (Ndzwani)':        'ndzuani',
  'Mohéli (Mwali)':           'mwali',
  'Mayotte (Maore)':          'maore',
};

const ILE_CONFIG = [
  { name: 'Grande Comore (Ngazidja)', nameShort: 'Grande Comore', nameComorian: 'Ngazidja', accent: '#1a3d2e', imgColor: '#42a5f5', img: 'ngazidja.png' },
  { name: 'Anjouan (Ndzwani)',        nameShort: 'Anjouan',        nameComorian: 'Ndzwani',  accent: '#3d1a1a', imgColor: '#ef5350', img: 'anjouan.png'  },
  { name: 'Mohéli (Mwali)',           nameShort: 'Mohéli',         nameComorian: 'Mwali',    accent: '#1a2e3d', imgColor: '#ffeb3b', img: 'moheli.png'   },
  { name: 'Mayotte (Maore)',          nameShort: 'Mayotte',        nameComorian: 'Maore',    accent: '#2e1a3d', imgColor: '#e0e0e0', img: 'maore.png'    },
];

// ── Normalisation : supprime accents + minuscules
function normalize(s: string) {
  return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// ── Joker SQL : remplace voyelles par _ pour tolérer les variantes
function toDbPattern(word: string) {
  return normalize(word).replace(/[aeiouy\s\-']/g, '_');
}

// ── Distance de Levenshtein
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

// ── Score de correspondance floue : 0 = parfait, +∞ = pas de match
function fuzzyScore(query: string, target: string): number {
  const q = normalize(query);
  const t = normalize(target);
  if (t.includes(q)) return 0;
  const words = q.split(/\s+/).filter(Boolean);
  const targetWords = t.split(/\s+/);
  let total = 0;
  for (const w of words) {
    const best = Math.min(...targetWords.map(tw => levenshtein(w, tw)));
    const threshold = w.length <= 5 ? 1 : 2;
    if (best > threshold) return Infinity;
    total += best;
  }
  return total;
}

// ── Temps relatif (ex: "il y a 3j")
function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "aujourd'hui";
  if (days === 1) return 'il y a 1j';
  return `il y a ${days}j`;
}

export default function RegistreView({ onShowPerson, onOpenAuth }: RegistreViewProps) {
  const router = useRouter();
  const { fetchByLocalite, fetchByClan, searchPersons } = useDB();
  const { user } = useAuth();
  const { searchQ } = useRegistreSearch();

  const [tab, setTab]   = useState<RegistreTab>('iles');
  const [step, setStep] = useState<Step>('iles');
  const [ile, setIle]   = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [localite, setLocalite] = useState<string | null>(null);

  const [persons, setPersons]   = useState<Person[]>([]);
  const [hinyaGroups, setHinyaGroups] = useState<{ label: string; count: number }[]>([]);
  const [loading, setLoading]   = useState(false);
  const [groupHinya, setGroupHinya] = useState(false);
  const [hasNullLoc, setHasNullLoc] = useState(false);
  const [ileLocalites, setIleLocalites] = useState<{ region: string; localite: string }[]>([]);

  // ── Filtre local (dans les listes par île/hinya)
  const [filterQ, setFilterQ] = useState('');

  // ── Recherche globale depuis le header
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ── Stats légères pour les cartes d'îles (chargées au montage)
  const [allPersonsLight, setAllPersonsLight] = useState<{
    ile: string | null;
    localite: string | null;
    clan: string | null;
    updated_at: string | null;
  }[]>([]);

  // ── Classement créateurs
  const [creators, setCreators] = useState<{ id: string; name: string; count: number }[]>([]);
  const [creatorLoading, setCreatorLoading] = useState(false);

  // ── Profil créateur sélectionné
  const [selectedCreator, setSelectedCreator] = useState<{ id: string; name: string; total: number } | null>(null);
  const [creatorPersons, setCreatorPersons] = useState<Person[]>([]);
  const [creatorPersonsLoading, setCreatorPersonsLoading] = useState(false);

  // Chargement des stats légères au montage (toutes les pages, sans limite Supabase)
  useEffect(() => {
    import('@/lib/supabase').then(async ({ supabase }) => {
      const pageSize = 1000;
      let page = 0;
      let all: typeof allPersonsLight = [];
      while (true) {
        const { data } = await supabase
          .from('persons')
          .select('ile, localite, clan, updated_at')
          .range(page * pageSize, (page + 1) * pageSize - 1);
        if (!data || data.length === 0) break;
        all = all.concat(data);
        if (data.length < pageSize) break;
        page++;
      }
      setAllPersonsLight(all);
    });
  }, []);

  const runSearch = useCallback(async (q: string) => {
    if (!q || q.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const words = q.trim().split(/\s+/).filter(w => w.length >= 2);
    const best  = words.reduce((a, b) => a.length > b.length ? a : b, words[0] || q.trim());
    const raw   = await searchPersons(toDbPattern(best));
    const scored = raw
      .map(p => ({ p, score: fuzzyScore(q.trim(), [p.prenom, p.nom, p.clan, p.localite, p.daho].filter(Boolean).join(' ')) }))
      .filter(x => x.score !== Infinity)
      .sort((a, b) => a.score - b.score);
    setSearchResults(scored.map(x => x.p));
    setSearching(false);
  }, [searchPersons]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!searchQ || searchQ.trim().length < 2) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(() => runSearch(searchQ), 300);
  }, [searchQ]);

  // ── NAVIGATION ──

  const pickIle = async (ileName: string) => {
    if (ileName === '__nr__') { pickLocalite('__nr__'); return; }
    setLoading(true); setIle(ileName); setRegion(null); setLocalite(null); setStep('localites');
    const { supabase } = await import('@/lib/supabase');
    const [{ data: personsData }, { data: localitesData }] = await Promise.all([
      supabase.from('persons').select('localite').eq('ile', ileName),
      supabase.from('localites').select('region, localite').eq('ile', ileName),
    ]);
    const hasNull = (personsData || []).some((p: any) => !p.localite);
    setHasNullLoc(hasNull);
    setIleLocalites((localitesData || []) as { region: string; localite: string }[]);
    setLoading(false);
  };

  const pickLocalite = async (loc: string) => {
    setLoading(true); setLocalite(loc); setStep('persons');
    const data = await fetchByLocalite(loc);
    setPersons(data); setFilterQ(''); setLoading(false);
  };

  const loadHinya = async () => {
    setTab('hinya'); setStep('iles'); setLoading(true);
    const { data } = await import('@/lib/supabase').then(m =>
      m.supabase.from('persons').select('clan, prefix_lignee').not('clan', 'is', null)
    );
    const groups: Record<string, number> = {};
    (data || []).forEach((p: any) => {
      const key = (p.prefix_lignee || 'Hinya') + ' ' + p.clan;
      groups[key] = (groups[key] || 0) + 1;
    });
    const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count }));
    setHinyaGroups(sorted);
    setLoading(false);
  };

  const pickHinya = async (label: string) => {
    setLoading(true); setStep('persons');
    const data = await fetchByClan(label);
    setPersons(data); setFilterQ(''); setLoading(false);
  };

  const loadAll = async () => {
    setTab('all'); setStep('persons'); setLoading(true);
    const { data } = await import('@/lib/supabase').then(m =>
      m.supabase.from('persons').select('*').order('prenom').limit(300)
    );
    setPersons(data || []); setFilterQ(''); setLoading(false);
  };

  const loadCreators = async () => {
    setTab('creators'); setStep('iles'); setCreatorLoading(true); setSelectedCreator(null);
    const { supabase } = await import('@/lib/supabase');
    const pageSize = 1000;
    let page = 0;
    let allRows: { created_by: string | null; created_by_name: string | null }[] = [];
    while (true) {
      const { data } = await supabase
        .from('persons')
        .select('created_by, created_by_name')
        .range(page * pageSize, (page + 1) * pageSize - 1);
      if (!data || data.length === 0) break;
      allRows = allRows.concat(data);
      if (data.length < pageSize) break;
      page++;
    }
    const acc: Record<string, { name: string; count: number }> = {};
    allRows.forEach((p: any) => {
      const id = p.created_by || '__anonyme__';
      const name = p.created_by_name || 'Anonyme';
      if (!acc[id]) acc[id] = { name, count: 0 };
      acc[id].count++;
    });
    const ranking = Object.entries(acc)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 20)
      .map(([id, { name, count }]) => ({ id, name, count }));
    setCreators(ranking);
    setCreatorLoading(false);
  };

  const loadCreatorProfile = async (creator: { id: string; name: string; total: number }) => {
    setSelectedCreator(creator);
    setCreatorPersonsLoading(true);
    const { data } = await import('@/lib/supabase').then(m =>
      m.supabase.from('persons')
        .select('*')
        .eq('created_by', creator.id)
        .order('prenom', { ascending: true })
        .limit(50)
    );
    setCreatorPersons((data || []) as Person[]);
    setCreatorPersonsLoading(false);
  };

  // ── Filtre local (dans les résultats par île/hinya/all)
  const filteredPersons = filterQ
    ? persons.filter(p => {
        const target = normalize([p.prenom, p.nom, p.clan, p.localite].filter(Boolean).join(' '));
        return fuzzyScore(filterQ.trim(), target) !== Infinity;
      })
    : persons;

  // Breadcrumb helper
  const breadcrumb = () => {
    const items: { label: string; onClick: () => void }[] = [];
    if (tab === 'iles') {
      if (ile) items.push({ label: ile.split(' (')[0], onClick: () => { setStep('localites'); setLocalite(null); setPersons([]); } });
      if (localite) items.push({ label: localite === '__nr__' ? 'Origine inconnue' : localite, onClick: () => {} });
    } else if (tab === 'hinya') {
      if (step === 'persons') items.push({ label: 'Par Hinya', onClick: () => { setStep('iles'); setPersons([]); } });
    } else if (tab === 'all') {
      items.push({ label: 'Tout le catalogue', onClick: () => {} });
    }
    return items;
  };

  const currentRegions: [string, string[]][] = ile
    ? Object.entries(
        ileLocalites.reduce<Record<string, string[]>>((acc, { region, localite }) => {
          if (!acc[region]) acc[region] = [];
          acc[region].push(localite);
          return acc;
        }, {})
      )
    : [];

  const medal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return String(rank);
  };

  // Mode recherche globale actif
  if (searchQ && searchQ.trim().length >= 2) {
    return (
      <div className="view-section">
        <div className="folder-grid">
          {searching ? (
            <div className="empty-grid"><div className="spin" style={{ width: 24, height: 24, borderWidth: 2 }} /></div>
          ) : searchResults.length === 0 ? (
            <div className="empty-grid" style={{ flexDirection: 'column', gap: '24px' }}>
              <span>Aucun résultat pour « {searchQ} ».</span>
              {!user && (
                <button
                  className="btn-hero btn-hero-p"
                  style={{ fontSize: '16px', padding: '14px 32px' }}
                  onClick={() => onOpenAuth('signup')}
                >
                  🌿 Créez votre famille
                </button>
              )}
            </div>
          ) : searchResults.map(p => (
            <PersonCard key={p.id} person={p} onClick={() => onShowPerson(p)} />
          ))}
        </div>
      </div>
    );
  }

  const maxCreators = creators[0]?.count || 1;

  return (
    <div style={{ position: 'relative', flex: 1, width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="view-section" style={{ position: 'relative', zIndex: 1, background: 'transparent', flex: 1 }}>

        {/* Tabs */}
        <div className="explorer-tabs-bar">
          <button className={`exp-tab${tab === 'iles' ? ' on' : ''}`} onClick={() => { setTab('iles'); setStep('iles'); setPersons([]); }}>Par Îles</button>
          <button className={`exp-tab${tab === 'hinya' ? ' on' : ''}`} onClick={() => router.push('/registre/hinya')}>⬡ Par Hinya</button>
          <button className={`exp-tab${tab === 'creators' ? ' on' : ''}`} onClick={() => router.push('/registre/createur')}>Par Créateur</button>
          <button className={`exp-tab${tab === 'all' ? ' on' : ''}`} onClick={loadAll}>Tout le catalogue</button>
        </div>

        {/* Topbar */}
        <div className="explorer-topbar">
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', flex: 1, gap: '2px' }}>
            {tab === 'iles' && step === 'iles' && (
              <span style={{ fontSize: '12px', color: 'var(--t3)' }}>Sélectionnez une île</span>
            )}
            {tab === 'creators' && !selectedCreator && (
              <span style={{ fontSize: '12px', color: 'var(--t3)' }}>Top 20 contributeurs</span>
            )}
            {tab === 'creators' && selectedCreator && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  className="bc-item-v2"
                  onClick={() => setSelectedCreator(null)}
                  style={{ cursor: 'pointer' }}
                >
                  Par Créateur
                </span>
                <span className="bc-sep-v2">›</span>
                <span className="bc-current-v2">{selectedCreator.name}</span>
              </span>
            )}
            {breadcrumb().map((item, i, arr) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
                {i < arr.length - 1
                  ? <><span className="bc-item-v2" onClick={item.onClick}>{item.label}</span><span className="bc-sep-v2">›</span></>
                  : <span className="bc-current-v2">{item.label}</span>
                }
              </span>
            ))}
          </div>

          {step === 'persons' && tab === 'iles' && localite && (
            <button className={`reg-sort-btn${groupHinya ? ' on' : ''}`} onClick={() => setGroupHinya(v => !v)}>
              ⬡ {groupHinya ? 'Groupé par Hinya' : 'Grouper par Hinya'}
            </button>
          )}

          {step === 'persons' && (
            <div className="exp-search">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                value={filterQ}
                onChange={e => setFilterQ(e.target.value)}
                placeholder="Filtrer…"
              />
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="folder-grid">
            <div className="empty-grid">
              <div className="spin" style={{ width: '24px', height: '24px', borderWidth: '2px' }} />
            </div>
          </div>
        ) : (
          <>
            {/* Cartes îles premium */}
            {tab === 'iles' && step === 'iles' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', padding: '24px', overflowY: 'auto', flex: 1, alignContent: 'start' }}>
                {ILE_CONFIG.map(({ name, nameShort, nameComorian, accent, imgColor, img }) => {
                  const ilePersons = allPersonsLight.filter(p => p.ile === name);
                  const personnes = ilePersons.length;
                  const localites = new Set(ilePersons.filter(p => p.localite).map(p => p.localite)).size;
                  const clans = new Set(ilePersons.filter(p => p.clan).map(p => p.clan)).size;
                  const lastDate = ilePersons.reduce((max: string | null, p) => {
                    if (!p.updated_at) return max;
                    return !max || p.updated_at > max ? p.updated_at : max;
                  }, null);
                  return (
                    <div
                      key={name}
                      onClick={() => router.push(`/registre/${ILE_SLUG_MAP[name]}`)}
                      className="fadein"
                      style={{
                        background: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.6)',
                        borderRadius: '20px',
                        padding: '24px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        boxShadow: '0 4px 20px rgba(20,18,13,0.08)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(20,18,13,0.15)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(20,18,13,0.08)';
                      }}
                    >
                      {/* Illustration île */}
                      <div style={{ textAlign: 'center', marginBottom: '16px', minHeight: '88px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={img}
                          alt={nameShort}
                          style={{ width: '80px', height: '80px', objectFit: 'contain', filter: `drop-shadow(0 0 14px ${imgColor}) drop-shadow(0 2px 6px ${imgColor}80)` }}
                          onError={e => {
                            const el = e.currentTarget as HTMLImageElement;
                            el.style.display = 'none';
                            const parent = el.parentElement;
                            if (parent) parent.innerHTML = '<span style="font-size:64px;line-height:1">🏝️</span>';
                          }}
                        />
                      </div>

                      {/* Noms */}
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: accent, lineHeight: 1.2 }}>
                          {nameShort}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '3px', letterSpacing: '0.03em' }}>
                          {nameComorian}
                        </div>
                      </div>

                      {/* Stats */}
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        {[
                          { val: clans,     label: 'clans'     },
                          { val: personnes, label: 'personnes' },
                          { val: localites, label: 'lieux'     },
                        ].map(({ val, label }) => (
                          <div key={label} style={{ flex: 1, background: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '8px 4px', textAlign: 'center' }}>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: accent }}>{val}</div>
                            <div style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '2px' }}>{label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', color: 'var(--t3)' }}>
                          {lastDate ? `Mis à jour ${timeAgo(lastDate)}` : 'Aucune donnée'}
                        </span>
                        <span style={{ fontSize: '18px', color: accent, fontWeight: 700 }}>→</span>
                      </div>
                    </div>
                  );
                })}

                {/* Carte Origine inconnue */}
                <div
                  onClick={() => pickIle('__nr__')}
                  className="fadein"
                  style={{
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.6)',
                    borderRadius: '20px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 4px 20px rgba(20,18,13,0.08)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(20,18,13,0.15)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(20,18,13,0.08)';
                  }}
                >
                  <div style={{ textAlign: 'center', marginBottom: '16px', minHeight: '88px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', lineHeight: 1 }}>
                    🔍
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: '#2e2e2e', lineHeight: 1.2 }}>
                      Origine inconnue
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '3px' }}>Île non renseignée</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '8px 4px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#2e2e2e' }}>
                        {allPersonsLight.filter(p => !p.ile).length}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '2px' }}>personnes</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '18px', color: '#2e2e2e', fontWeight: 700 }}>→</span>
                  </div>
                </div>
              </div>
            )}

            {tab === 'iles' && step === 'localites' && (
              <div style={{ overflowY: 'auto', flex: 1, padding: '0 24px 24px' }}>
                {currentRegions.map(([reg, locs]) => (
                  <div key={reg} style={{ marginBottom: '28px' }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 0 10px', borderBottom: '1px solid rgba(255,255,255,0.4)', marginBottom: '12px', cursor: 'pointer' }}
                      onClick={() => router.push(`/registre/${ILE_SLUG_MAP[ile!]}/${slugify(reg)}`)}
                    >
                      <span style={{ fontSize: '13px' }}>📍</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--t3)' }}>{reg}</span>
                      <span style={{ fontSize: '11px', color: 'var(--t3)', marginLeft: 'auto' }}>{locs.length} localité{locs.length > 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                      {locs.map(loc => (
                        <div
                          key={loc}
                          className="fadein"
                          onClick={() => router.push(`/registre/${ILE_SLUG_MAP[ile!]}/${slugify(reg)}/${slugify(loc)}`)}
                          style={{
                            background: 'rgba(255,255,255,0.75)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.6)',
                            borderRadius: '20px',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 20px rgba(20,18,13,0.08)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
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
                          <span style={{ fontSize: '28px', lineHeight: 1 }}>🏘️</span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', textAlign: 'center', lineHeight: 1.3 }}>{loc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {hasNullLoc && (
                  <div
                    className="fadein"
                    onClick={() => pickLocalite('__nr__')}
                    style={{
                      background: 'rgba(255,255,255,0.75)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.6)',
                      borderRadius: '20px',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 20px rgba(20,18,13,0.08)',
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>🔍</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)' }}>Localité inconnue</span>
                  </div>
                )}
              </div>
            )}

            {tab === 'hinya' && step === 'iles' && (
              <div className="folder-grid">
                {hinyaGroups.map(({ label, count }) => (
                  <div key={label} className="exp-card fadein" onClick={() => pickHinya(label)}>
                    <div className="exp-ico">
                      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="13,2 23,7.5 23,18.5 13,24 3,18.5 3,7.5" stroke="#2D5A3D" strokeWidth="2" strokeLinejoin="round" fill="none"/>
                      </svg>
                    </div>
                    <div className="exp-title">{label}</div>
                    <div className="exp-sub">{count} personne{count !== 1 ? 's' : ''}</div>
                  </div>
                ))}
                <div className="exp-card fadein" onClick={() => pickHinya('__sans__')}>
                  <div className="exp-ico">❓</div>
                  <div className="exp-title">Sans Hinya</div>
                </div>
              </div>
            )}

            {/* Classement Par Créateur */}
            {tab === 'creators' && !selectedCreator && (
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                {creatorLoading ? (
                  <div className="empty-grid"><div className="spin" style={{ width: 24, height: 24, borderWidth: 2 }} /></div>
                ) : creators.length === 0 ? (
                  <div className="empty-grid">Aucun contributeur trouvé.</div>
                ) : (
                  <div style={{
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.6)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(20,18,13,0.08)',
                  }}>
                    {creators.map(({ id, name, count }, idx) => {
                      const rank = idx + 1;
                      const pct = Math.round((count / maxCreators) * 100);
                      return (
                        <div
                          key={id}
                          onClick={() => loadCreatorProfile({ id, name, total: count })}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 20px',
                            borderBottom: idx < creators.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(45,106,79,0.05)'}
                          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                        >
                          <span style={{
                            fontSize: rank <= 3 ? '20px' : '13px',
                            fontWeight: 700,
                            width: '28px',
                            textAlign: 'center',
                            color: 'var(--t2)',
                            flexShrink: 0,
                          }}>
                            {medal(rank)}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {name}
                            </div>
                            <div style={{ marginTop: '5px', height: '4px', background: 'var(--bd)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green)', borderRadius: '2px' }} />
                            </div>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--green)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {count} pers.
                          </span>
                          <span style={{ fontSize: '16px', color: 'var(--t3)', flexShrink: 0 }}>›</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Profil créateur */}
            {tab === 'creators' && selectedCreator && (
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                {/* En-tête profil */}
                <div style={{
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.6)',
                  borderRadius: '20px',
                  padding: '20px 24px',
                  marginBottom: '20px',
                  boxShadow: '0 4px 20px rgba(20,18,13,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}>
                  <span style={{ fontSize: '32px' }}>{medal(creators.findIndex(c => c.id === selectedCreator.id) + 1)}</span>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--t1)', fontFamily: "'Cormorant Garamond', serif" }}>
                      {selectedCreator.name}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--t3)', marginTop: '3px' }}>
                      {selectedCreator.total} personne{selectedCreator.total !== 1 ? 's' : ''} ajoutée{selectedCreator.total !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Fiches du créateur */}
                {creatorPersonsLoading ? (
                  <div className="empty-grid"><div className="spin" style={{ width: 24, height: 24, borderWidth: 2 }} /></div>
                ) : creatorPersons.length === 0 ? (
                  <div className="empty-grid">Aucune fiche trouvée.</div>
                ) : (
                  <>
                    <div style={{ fontSize: '12px', color: 'var(--t3)', marginBottom: '12px' }}>
                      Ses fiches ({creatorPersons.length}{selectedCreator.total > 50 ? ` sur ${selectedCreator.total}` : ''}) :
                    </div>
                    <div className="folder-grid">
                      {creatorPersons.map(p => (
                        <PersonCard key={p.id} person={p} onClick={() => onShowPerson(p)} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 'persons' && (
              <>
                {filteredPersons.length === 0 ? (
                  <div className="folder-grid">
                    <div className="empty-grid">Aucune personne trouvée.</div>
                  </div>
                ) : groupHinya && tab === 'iles' && localite ? (
                  <div style={{ padding: '16px 0', flex: 1, overflowY: 'auto' }}>
                    {Object.entries(
                      filteredPersons.reduce((groups: Record<string, Person[]>, p) => {
                        const key = (p.prefix_lignee || 'Hinya') + ' ' + (p.clan || 'Sans clan');
                        if (!groups[key]) groups[key] = [];
                        groups[key].push(p);
                        return groups;
                      }, {})
                    )
                      .sort((a, b) => b[1].length - a[1].length)
                      .map(([label, grpPersons]) => (
                        <div key={label} style={{ marginBottom: '32px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px 12px 16px', borderBottom: '2px solid var(--green-bg)', marginBottom: '12px' }}>
                            <span style={{ fontSize: '16px' }}>⬡</span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green)' }}>{label}</span>
                            <span style={{ fontSize: '11px', color: 'var(--t3)', marginLeft: 'auto' }}>{grpPersons.length} personne{grpPersons.length !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="folder-grid" style={{ paddingTop: 0 }}>
                            {grpPersons.map(p => <PersonCard key={p.id} person={p} onClick={() => onShowPerson(p)} />)}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="folder-grid">
                    {filteredPersons.map(p => <PersonCard key={p.id} person={p} onClick={() => onShowPerson(p)} />)}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
