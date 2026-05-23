'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PersonCard from '@/components/app/PersonCard';
import { useDB } from '@/hooks/useDB';
import { useAuth } from '@/hooks/useAuth';
import type { Person } from '@/lib/types';

const PAGE_SIZE = 20;

/* ── Charte Aswilia ── */
const C = {
  green:    '#1B4332',
  greenHov: '#2D6A4F',
  gold:     '#C9A84C',
  bg:       '#FAFAF7',
  t1:       '#1A1A1A',
  t2:       '#6B6B6B',
  bd:       '#E8E4DC',
};

function normalize(s: string) {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function SilhouetteSVG({ genre, size = 28 }: { genre?: string | null; size?: number }) {
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

function buildPageRange(cur: number, total: number): (number | -1)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  if (cur < 4)          return [0, 1, 2, 3, 4, -1, total - 1];
  if (cur >= total - 4) return [0, -1, total - 5, total - 4, total - 3, total - 2, total - 1];
  return [0, -1, cur - 1, cur, cur + 1, -1, total - 1];
}

function PaginationBar({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  if (total <= 1) return null;
  const base: React.CSSProperties = {
    borderRadius: 4, border: `1px solid ${C.bd}`, fontSize: 12,
    background: 'transparent', cursor: 'pointer', padding: '5px 10px', color: C.t2,
  };
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, padding: '20px 0 28px' }}>
      <button onClick={() => onPage(page - 1)} disabled={page === 0}
        style={{ ...base, color: page === 0 ? C.bd : C.t2, cursor: page === 0 ? 'not-allowed' : 'pointer' }}>
        ← Préc.
      </button>
      {buildPageRange(page, total).map((p, i) =>
        p === -1 ? (
          <span key={`e${i}`} style={{ fontSize: 12, color: C.bd, width: 28, textAlign: 'center' }}>…</span>
        ) : (
          <button key={p} onClick={() => onPage(p)}
            style={{
              ...base, width: 28, height: 28, padding: 0,
              background: p === page ? C.green : 'transparent',
              color: p === page ? 'white' : C.t2,
              fontWeight: p === page ? 700 : 400,
              border: `1px solid ${p === page ? C.green : C.bd}`,
            }}>
            {p + 1}
          </button>
        )
      )}
      <button onClick={() => onPage(page + 1)} disabled={page >= total - 1}
        style={{ ...base, color: page >= total - 1 ? C.bd : C.t2, cursor: page >= total - 1 ? 'not-allowed' : 'pointer' }}>
        Suiv. →
      </button>
    </div>
  );
}

export default function MonArbreView() {
  const { user } = useAuth();
  const { state, updatePerson, deletePerson, toggleMasque, loadMyData, importGEDCOM } = useDB();
  const router = useRouter();
  const gedcomRef = useRef<HTMLInputElement>(null);

  const [searchQ, setSearchQ]           = useState('');
  const [aliveOnly, setAliveOnly]       = useState(false);
  const [genderFilter, setGenderFilter] = useState<'M' | 'F' | null>(null);
  const [hinyaFilter, setHinyaFilter]   = useState<string | null>(null);
  const [bulkMode, setBulkMode]         = useState(false);
  const [selectedIds, setSelectedIds]   = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>(() => {
    if (typeof window === 'undefined') return 'list';
    return (localStorage.getItem('arbre-view') as 'cards' | 'list') ?? 'list';
  });
  const [page, setPage] = useState(0);

  const handleViewChange = (mode: 'cards' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('arbre-view', mode);
  };

  const myPersons = state.myPersons;
  const alive = myPersons.filter(p => !p.deceased).length;
  const dead  = myPersons.length - alive;

  const generations = useMemo(() => {
    const years = myPersons
      .map(p => parseInt((p.naiss_date || '').replace(/\D.*/, '')))
      .filter(y => !isNaN(y) && y > 1000 && y < 2200);
    if (years.length < 2) return years.length;
    return Math.ceil((Math.max(...years) - Math.min(...years)) / 25) + 1;
  }, [myPersons]);

  const hinyas = useMemo(() => {
    const set = new Set(myPersons.map(p => p.clan).filter(Boolean) as string[]);
    return [...set].sort();
  }, [myPersons]);

  const filtered = useMemo(() => {
    let list = myPersons;
    if (aliveOnly)    list = list.filter(p => !p.deceased);
    if (genderFilter) list = list.filter(p => p.genre === genderFilter);
    if (hinyaFilter)  list = list.filter(p => p.clan === hinyaFilter);
    if (searchQ) {
      const q = normalize(searchQ);
      list = list.filter(p => {
        const target = normalize([p.prenom, p.nom, p.clan, p.localite].filter(Boolean).join(' '));
        return q.split(/\s+/).every(t => target.includes(t));
      });
    }
    return list;
  }, [myPersons, aliveOnly, genderFilter, hinyaFilter, searchQ]);

  const sorted = useMemo(() =>
    [...filtered].sort((a, b) =>
      ((a.prenom || '') + (a.nom || '')).toLowerCase()
        .localeCompare(((b.prenom || '') + (b.nom || '')).toLowerCase())
    )
  , [filtered]);

  useEffect(() => { setPage(0); }, [filtered]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems  = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleDeleteTree = async () => {
    if (!myPersons.length) return;
    if (!confirm(`Supprimer les ${myPersons.length} personnes de votre arbre ? Cette action est irréversible.`)) return;
    try {
      for (const p of myPersons) await deletePerson(p.id);
      await loadMyData();
    } catch (e) { console.error('Erreur suppression arbre:', e); }
  };

  /* styles réutilisables */
  const pillActive: React.CSSProperties = {
    background: C.green, borderColor: C.green, color: 'white',
  };
  const toggleActive: React.CSSProperties = {
    background: `rgba(27,67,50,0.10)`, border: `1px solid ${C.green}`, color: C.green,
  };
  const toggleInactive: React.CSSProperties = {
    background: 'transparent', border: `1px solid ${C.bd}`, color: C.t2,
  };

  return (
    <div className="view-section">

      {/* ── Header ── */}
      {user && (
        <div style={{
          padding: '28px 28px 22px', borderBottom: `1px solid ${C.bd}`,
          background: C.bg, flexShrink: 0,
        }}>
          <h1 style={{ fontFamily: "'Satoshi', sans-serif", fontSize: 28, fontWeight: 700, color: C.t1, lineHeight: 1.2, marginBottom: 18 }}>
            Mon Arbre
          </h1>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, fontSize: 13, color: C.t2, marginBottom: 20, flexWrap: 'wrap' }}>
            <span>
              <strong style={{ fontSize: 21, fontWeight: 800, color: C.t1, marginRight: 4 }}>{myPersons.length}</strong>
              personne{myPersons.length !== 1 ? 's' : ''}
            </span>
            {generations > 0 && (<>
              <span style={{ color: C.bd, fontSize: 16 }}>·</span>
              <span>
                <strong style={{ fontSize: 21, fontWeight: 800, color: C.t1, marginRight: 4 }}>{generations}</strong>
                génération{generations !== 1 ? 's' : ''}
              </span>
            </>)}
            {state.myUnions.length > 0 && (<>
              <span style={{ color: C.bd, fontSize: 16 }}>·</span>
              <span>
                <strong style={{ fontSize: 21, fontWeight: 800, color: C.t1, marginRight: 4 }}>{state.myUnions.length}</strong>
                famille{state.myUnions.length !== 1 ? 's' : ''} connectée{state.myUnions.length !== 1 ? 's' : ''}
              </span>
            </>)}
          </div>

          {/* Boutons d'action */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button className="btn btn-pri" style={{ fontSize: 13, background: C.green, borderColor: C.green }} onClick={() => router.push('/monarbre/nouveau')}>
              + Ajouter une personne
            </button>
            <button className="btn btn-sec" style={{ fontSize: 13 }} onClick={() => router.push('/monarbre/union/nouvelle')}>
              + Ajouter un mariage
            </button>
            <button className="btn btn-sec" style={{ fontSize: 13 }} onClick={() => gedcomRef.current?.click()}>
              ↑ Importer GEDCOM
            </button>
            <input ref={gedcomRef} type="file" accept=".ged,.gedcom" style={{ display: 'none' }} onChange={importGEDCOM} />
            {myPersons.length > 0 && (
              <button className="btn btn-danger" style={{ fontSize: 13 }} onClick={handleDeleteTree}>
                🗑 Supprimer mon arbre
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Barre de filtres (3 lignes) ── */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 8,
        padding: '10px 16px', borderBottom: `1px solid ${C.bd}`,
        flexShrink: 0, background: 'white',
      }}>

        {/* Ligne 1 : recherche · vivants · genre · toggle · compteur */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
          {/* Recherche */}
          <div className="exp-search" style={{ flex: '0 1 220px' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Rechercher…" />
          </div>

          {/* Vivants */}
          <label style={{ fontSize: 12, color: C.t2, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <input type="checkbox" checked={aliveOnly} onChange={e => setAliveOnly(e.target.checked)} />
            Vivants seulement
          </label>

          {/* Genre */}
          <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
            <button
              className="f-pill"
              style={genderFilter === 'M' ? pillActive : {}}
              onClick={() => setGenderFilter(g => g === 'M' ? null : 'M')}
            >Hommes</button>
            <button
              className="f-pill"
              style={genderFilter === 'F' ? pillActive : {}}
              onClick={() => setGenderFilter(g => g === 'F' ? null : 'F')}
            >Femmes</button>
          </div>

          {/* Toggle grille / liste */}
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            <button title="Vue grille" onClick={() => handleViewChange('cards')}
              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s', ...(viewMode === 'cards' ? toggleActive : toggleInactive) }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
                <rect x="0" y="0" width="5.5" height="5.5" rx="1"/><rect x="7.5" y="0" width="5.5" height="5.5" rx="1"/>
                <rect x="0" y="7.5" width="5.5" height="5.5" rx="1"/><rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1"/>
              </svg>
            </button>
            <button title="Vue liste" onClick={() => handleViewChange('list')}
              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s', ...(viewMode === 'list' ? toggleActive : toggleInactive) }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
                <rect x="0" y="0" width="13" height="2.5" rx="1"/><rect x="0" y="5" width="13" height="2.5" rx="1"/>
                <rect x="0" y="10" width="13" height="2.5" rx="1"/>
              </svg>
            </button>
          </div>

          {/* Compteur — poussé à droite */}
          <span style={{ marginLeft: 'auto', fontSize: 11, color: C.t2, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {filtered.length} / {myPersons.length}
          </span>
        </div>

        {/* Ligne 2 : filtres Hinya / clans */}
        {hinyas.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {hinyas.map(h => (
              <button
                key={h}
                onClick={() => setHinyaFilter(x => x === h ? null : h)}
                style={{
                  padding: '3px 10px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.12s',
                  background: hinyaFilter === h ? C.gold : 'transparent',
                  border: `1px solid ${C.gold}`,
                  color: hinyaFilter === h ? 'white' : C.gold,
                }}
              >
                ⬡ {h}
              </button>
            ))}
          </div>
        )}

        {/* Ligne 3 : stats · sélection multiple */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 400, color: C.t2 }}>
            {alive} en vie · {dead} décédé·s
          </span>
          {user && (
            <button
              onClick={() => { setBulkMode(v => !v); setSelectedIds([]); }}
              style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 4, cursor: 'pointer',
                background: 'transparent', border: `1px solid ${C.bd}`, color: C.t2,
              }}
            >
              {bulkMode ? 'Désactiver sélection' : 'Sélection multiple'}
            </button>
          )}
          {bulkMode && (<>
            <button
              onClick={() => setSelectedIds(filtered.map(p => p.id))}
              style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, cursor: 'pointer', background: 'transparent', border: `1px solid ${C.bd}`, color: C.t2 }}
            >Tout</button>
            <button
              onClick={() => setSelectedIds([])}
              style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, cursor: 'pointer', background: 'transparent', border: `1px solid ${C.bd}`, color: C.t2 }}
            >Aucun</button>
          </>)}
        </div>
      </div>

      {/* ── Bulk Actions Bar ── */}
      {selectedIds.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
          background: `rgba(27,67,50,0.07)`, borderBottom: `1px solid ${C.bd}`, flexShrink: 0,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>
            {selectedIds.length} sélectionné{selectedIds.length !== 1 ? 's' : ''}
          </span>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button className="btn btn-sec" style={{ fontSize: 11 }} onClick={() => {
              (async () => {
                try { await Promise.all(selectedIds.map(id => updatePerson(id, { deceased: false }))); await loadMyData(); setSelectedIds([]); }
                catch (e) { console.error(e); }
              })();
            }}>🟢 Vivant</button>
            <button className="btn btn-sec" style={{ fontSize: 11 }} onClick={() => {
              (async () => {
                try { await Promise.all(selectedIds.map(id => updatePerson(id, { deceased: true }))); await loadMyData(); setSelectedIds([]); }
                catch (e) { console.error(e); }
              })();
            }}>🕊️ Décédé</button>
            <button className="btn btn-sec" style={{ fontSize: 11 }} onClick={() => {
              const living = selectedIds.filter(id => !myPersons.find(x => x.id === id)?.deceased);
              if (!living.length) return;
              (async () => {
                try {
                  for (const id of living) { const p = myPersons.find(x => x.id === id); if (p && !p.masque) await toggleMasque(p); }
                  await loadMyData(); setSelectedIds([]);
                } catch (e) { console.error(e); }
              })();
            }}>🔒 Masquer</button>
            <button className="btn btn-danger" style={{ fontSize: 11 }} onClick={() => {
              if (confirm(`Supprimer ${selectedIds.length} personne${selectedIds.length !== 1 ? 's' : ''} ? Cette action est irréversible.`)) {
                (async () => {
                  try { await Promise.all(selectedIds.map(id => deletePerson(id))); await loadMyData(); setSelectedIds([]); }
                  catch (e) { console.error(e); }
                })();
              }
            }}>🗑 Supprimer</button>
          </div>
        </div>
      )}

      {/* ── Contenu ── */}
      {!user ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', textAlign: 'center', gap: 12 }}>
          <div style={{ fontFamily: "'Satoshi', sans-serif", fontSize: 20, fontWeight: 600, color: C.t2 }}>Mon Arbre</div>
          <div style={{ fontSize: 12, color: C.t2 }}>Connectez-vous pour créer votre arbre.</div>
        </div>
      ) : myPersons.length === 0 ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 28px', textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.t1, marginBottom: 28 }}>
            Votre arbre est vide — commencez dès maintenant !
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 680, margin: '0 auto 32px' }}>
            {[
              { n: '1', titre: 'Ajoutez vos proches', desc: 'Commencez par vous-même, puis vos parents, enfants et conjoints.' },
              { n: '2', titre: 'Visualisez votre arbre', desc: 'Naviguez dans votre arbre interactif et découvrez vos liens familiaux.' },
              { n: '3', titre: 'Partagez votre histoire', desc: 'Préservez et partagez la mémoire de votre famille comorienne.' },
            ].map(({ n, titre, desc }) => (
              <div key={n} style={{ flex: '1', minWidth: 180, background: C.bg, border: `1px solid ${C.bd}`, borderRadius: 12, padding: '20px 16px', textAlign: 'left' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: C.green, marginBottom: 8 }}>{n}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 6 }}>{titre}</div>
                <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-pri" style={{ background: C.green, borderColor: C.green }} onClick={() => router.push('/monarbre/nouveau')}>
            + Ajouter une première personne
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
          <div style={{ fontSize: 12, color: C.t2 }}>Aucun résultat pour cette recherche.</div>
        </div>
      ) : viewMode === 'cards' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div className="folder-grid">
              {pageItems.map(p => (
                <PersonCard
                  key={p.id}
                  person={p}
                  onClick={() => !bulkMode && selectedIds.length === 0 ? router.push(`/monarbre/${p.id}`) : null}
                  bulkMode={bulkMode || selectedIds.length > 0}
                  selected={selectedIds.includes(p.id)}
                  onSelect={toggleSelect}
                />
              ))}
            </div>
          </div>
          {totalPages > 1 && (
            <div style={{ flexShrink: 0, borderTop: `1px solid ${C.bd}`, background: 'white' }}>
              <PaginationBar page={page} total={totalPages} onPage={setPage} />
            </div>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {pageItems.map((p: Person) => (
              <div
                key={p.id}
                onClick={() => bulkMode ? toggleSelect(p.id) : router.push(`/monarbre/${p.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 20px',
                  borderBottom: `1px solid ${C.bd}`,
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                  background: selectedIds.includes(p.id) ? 'rgba(27,67,50,0.06)' : 'transparent',
                }}
                onMouseEnter={e => { if (!selectedIds.includes(p.id)) (e.currentTarget as HTMLDivElement).style.background = '#F5F2EC'; }}
                onMouseLeave={e => { if (!selectedIds.includes(p.id)) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                {bulkMode && (
                  <input type="checkbox" checked={selectedIds.includes(p.id)}
                    onChange={() => toggleSelect(p.id)} onClick={e => e.stopPropagation()}
                    style={{ flexShrink: 0 }} />
                )}

                {/* Avatar 48×48 */}
                <div style={{
                  width: 48, height: 48, borderRadius: 8, overflow: 'hidden',
                  background: '#F0EDE6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {p.photo_url
                    ? <img src={p.photo_url} alt={p.prenom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <SilhouetteSVG genre={p.genre} size={26} />
                  }
                </div>

                {/* Prénom NOM */}
                <span style={{
                  flex: 1, minWidth: 0,
                  fontFamily: "'Satoshi', sans-serif", fontWeight: 500, fontSize: 15, color: C.t1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {p.prenom}{p.nom ? <strong style={{ fontWeight: 700 }}> {p.nom.toUpperCase()}</strong> : null}
                </span>

                {/* Hinya badge */}
                {p.clan && (
                  <span style={{
                    flexShrink: 0, fontFamily: "'Satoshi', sans-serif", fontWeight: 400, fontSize: 12,
                    padding: '2px 8px', borderRadius: 4,
                    background: 'transparent', border: `1px solid ${C.gold}`, color: C.gold,
                  }}>
                    {[p.prefix_lignee, p.clan].filter(Boolean).join(' ')}
                  </span>
                )}

                {/* Statut */}
                <span style={{ flexShrink: 0, fontSize: 12, color: '#6B6B6B', whiteSpace: 'nowrap' }}>
                  {p.deceased ? 'Décédé·e' : 'En vie'}
                </span>

                {/* Chevron */}
                <span style={{ flexShrink: 0, fontSize: 18, color: C.gold, lineHeight: 1, marginLeft: 2 }}>›</span>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div style={{ flexShrink: 0, borderTop: `1px solid ${C.bd}`, background: 'white' }}>
              <PaginationBar page={page} total={totalPages} onPage={setPage} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
