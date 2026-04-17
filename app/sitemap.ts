import { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase-server'
import { slugify } from '@/lib/slugify'

const BASE = 'https://aswilia.com'

// Mapping nom complet DB → slug court utilisé dans /registre/[ile] et /registre/[ile]/[region]
const ILE_NAME_TO_SLUG: Record<string, string> = {
  'Grande Comore (Ngazidja)': 'ngazidja',
  'Anjouan (Ndzwani)':        'ndzuani',
  'Mohéli (Mwali)':           'mwali',
  'Mayotte (Maore)':          'maore',
}

const ILE_SLUGS = Object.values(ILE_NAME_TO_SLUG)

interface LocaliteRow {
  ile: string
  region: string
  localite: string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sb = createServerClient()

  // ── 1. Pages statiques ──────────────────────────────────────────────────────
  const staticEntries: MetadataRoute.Sitemap = [
    { url: BASE,                              lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/registre`,                lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/registre/hinya`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/registre/createur`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/about`,                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/confidentialite`,         lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ]

  // ── 2. Pages par île (/registre/ngazidja, /registre/ndzuani, …) ─────────────
  const ileEntries: MetadataRoute.Sitemap = ILE_SLUGS.map(slug => ({
    url: `${BASE}/registre/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // ── 3. Pages par région + localité depuis la table `localites` ──────────────
  const { data: localites } = await sb
    .from('localites')
    .select('ile, region, localite')

  const rows = (localites as LocaliteRow[] | null) ?? []

  // Régions uniques : /registre/[ileSlug]/[regionSlug]
  const seenRegions = new Set<string>()
  const regionEntries: MetadataRoute.Sitemap = []

  for (const row of rows) {
    const ileSlug = ILE_NAME_TO_SLUG[row.ile]
    if (!ileSlug) continue
    const regionSlug = slugify(row.region)
    const key = `${ileSlug}/${regionSlug}`
    if (seenRegions.has(key)) continue
    seenRegions.add(key)
    regionEntries.push({
      url: `${BASE}/registre/${ileSlug}/${regionSlug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.75,
    })
  }

  // Localités : /registre/localite/[ileLong]/[regionSlug]/[localiteSlug]
  // ileLong = slugify(nom complet DB), ex : "grande-comore-ngazidja"
  const localiteEntries: MetadataRoute.Sitemap = rows.map(row => ({
    url: `${BASE}/registre/localite/${slugify(row.ile)}/${slugify(row.region)}/${slugify(row.localite)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // ── 4. Hinya distincts depuis `persons.clan` + `prefix_lignee` ──────────────
  // Le slug est construit sur le label complet : (prefix_lignee || 'Hinya') + ' ' + clan
  // Ex : prefix_lignee='Hinya', clan='Fwambaya' → slug 'hinya-fwambaya'
  const { data: clansData } = await sb
    .from('persons')
    .select('clan, prefix_lignee')
    .not('clan', 'is', null)

  const hinyaLabels = [
    ...new Set(
      (clansData as { clan: string | null; prefix_lignee: string | null }[] | null)
        ?.filter(r => Boolean(r.clan))
        .map(r => (r.prefix_lignee || 'Hinya') + ' ' + r.clan!) ?? []
    ),
  ]

  const hinyaEntries: MetadataRoute.Sitemap = hinyaLabels.map(label => ({
    url: `${BASE}/registre/hinya/${slugify(label)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // ── 5. Profils créateurs depuis `persons.created_by_name` ───────────────────
  const { data: creatorsData } = await sb
    .from('persons')
    .select('created_by_name')
    .not('created_by_name', 'is', null)

  const creatorNames = [
    ...new Set(
      (creatorsData as { created_by_name: string | null }[] | null)
        ?.map(r => r.created_by_name)
        .filter((n): n is string => Boolean(n)) ?? []
    ),
  ]

  const createurEntries: MetadataRoute.Sitemap = creatorNames.map(name => ({
    url: `${BASE}/registre/createur/${encodeURIComponent(name)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [
    ...staticEntries,
    ...ileEntries,
    ...regionEntries,
    ...localiteEntries,
    ...hinyaEntries,
    ...createurEntries,
  ]
}
