import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import HomeFooter from '@/components/home/HomeFooter'
import AboutNavWrapper from '@/components/home/AboutNavWrapper'

export const metadata: Metadata = {
  title: 'À propos — Aswilia, Mémoire Généalogique Comorienne',
  description:
    "Aswilia est né d'un constat simple : aucun outil de généalogie ne reflète la réalité comorienne. Découvrez notre histoire et notre mission.",
}

const pillars = [
  {
    title: 'Mémoire',
    text: "Préserver les lignées, les noms, les histoires avant qu'elles ne s'effacent.",
    color: 'var(--green)',
    bg: 'var(--green-bg)',
    border: 'var(--green-bd)',
  },
  {
    title: 'Connexion',
    text: 'Relier la diaspora à ses racines, et les familles entre elles.',
    color: 'var(--gold)',
    bg: 'var(--gold-bg)',
    border: 'var(--gold-bd)',
  },
  {
    title: 'Identité',
    text: "Affirmer la culture comorienne à travers un outil numérique qui lui ressemble.",
    color: 'var(--rose)',
    bg: 'var(--rose-bg)',
    border: 'var(--rose-li)',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* ── NAV ─────────────────────────────────────────── */}
      <AboutNavWrapper />

      <main style={{ paddingTop: '72px' }}>
        {/* ── SECTION 1 : HERO ────────────────────────────── */}
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '112px 48px',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--hero)',
            backgroundImage:
              'radial-gradient(ellipse 90% 70% at 50% 30%, rgba(45,122,84,.45) 0%, transparent 65%),' +
              'radial-gradient(ellipse 60% 40% at 20% 80%, rgba(122,83,14,.18) 0%, transparent 50%)',
          }}
        >
          <div style={{ position: 'relative', zIndex: 10, maxWidth: '768px', margin: '0 auto' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '.15em',
                marginBottom: '28px',
                color: 'rgba(255,255,255,.5)',
                fontFamily: "'Satoshi', sans-serif",
              }}
            >
              Notre histoire
            </span>
            <h1
              style={{
                fontFamily: "'Satoshi', sans-serif",
                fontSize: 'clamp(2.2rem, 5vw, 3.75rem)',
                fontWeight: 700,
                color: 'white',
                lineHeight: 1.1,
                marginBottom: '28px',
              }}
            >
              Fait par des Comoriens,
              <br />
              pour des Comoriens.
            </h1>
            <p
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                lineHeight: 1.7,
                maxWidth: '640px',
                margin: '0 auto',
                color: 'rgba(255,255,255,.6)',
                fontFamily: "'Satoshi', sans-serif",
              }}
            >
              Aswilia est né d&apos;un refus. Le refus que la mémoire comorienne se perde dans des
              outils pensés pour d&apos;autres.
            </p>
          </div>
        </section>

        {/* ── SECTION 2 : L'ORIGINE ───────────────────────── */}
        <section style={{ padding: '80px 48px', background: 'transparent' }}>
          <div style={{ maxWidth: '768px', margin: '0 auto' }}>
            <span
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '.15em',
                marginBottom: '20px',
                color: 'var(--green)',
                fontFamily: "'Satoshi', sans-serif",
              }}
            >
              Origine
            </span>
            <h2
              style={{
                fontFamily: "'Satoshi', sans-serif",
                fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                fontWeight: 700,
                marginBottom: '36px',
                lineHeight: 1.25,
                color: 'var(--t1)',
              }}
            >
              Pourquoi Aswilia existe
            </h2>
            <div style={{ color: 'var(--t2)', fontFamily: "'Satoshi', sans-serif", fontSize: '1.0625rem', lineHeight: 1.85 }}>
              <p style={{ marginBottom: '24px' }}>
                Les grands sites de généalogie mondiaux n&apos;ont pas été conçus pour nous. Ils
                ignorent le Hinya, le Daho, la transmission matrilinéaire, les liens entre îles,
                les noms comoriens, les réalités de nos familles. Résultat&nbsp;: des milliers de
                familles comoriennes sans outil digne de leur histoire.
              </p>
              <p>
                Aswilia est né de ce constat. Une alternative pensée depuis les Comores, ancrée
                dans la culture comorienne, construite pour les familles comoriennes — qu&apos;elles
                vivent à Moroni, à Marseille, à Mayotte ou à Dubai.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 3 : UCHAHIDI & U-DATA ──────────────── */}
        <section style={{ padding: '80px 48px', background: 'transparent' }}>
          <div style={{ maxWidth: '768px', margin: '0 auto' }}>
            <span
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '.15em',
                marginBottom: '20px',
                color: 'var(--gold)',
                fontFamily: "'Satoshi', sans-serif",
              }}
            >
              Vision
            </span>
            <h2
              style={{
                fontFamily: "'Satoshi', sans-serif",
                fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                fontWeight: 700,
                marginBottom: '36px',
                lineHeight: 1.25,
                color: 'var(--t1)',
              }}
            >
              Un projet porté par une vision
            </h2>
            <p
              style={{
                fontSize: '1.0625rem',
                lineHeight: 1.85,
                color: 'var(--t2)',
                fontFamily: "'Satoshi', sans-serif",
              }}
            >
              Aswilia n&apos;est pas né seul. Dans la logique d&apos;affirmer et de préserver
              l&apos;identité comorienne,{' '}
              <strong style={{ color: 'var(--t1)' }}>UCHAHIDI</strong> — à travers sa branche{' '}
              <strong style={{ color: 'var(--t1)' }}>U-Data</strong> — a accompagné le projet
              depuis ses premières heures jusqu&apos;à sa naissance. Parce que construire des
              outils numériques qui reflètent qui nous sommes, c&apos;est aussi une forme de
              souveraineté culturelle.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
              <div style={{ height: '1px', flex: 1, background: 'var(--bd)' }} />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '.1em',
                  flexShrink: 0,
                  color: 'var(--gold)',
                  fontFamily: "'Satoshi', sans-serif",
                }}
              >
                UCHAHIDI × U-Data
              </span>
              <div style={{ height: '1px', flex: 1, background: 'var(--bd)' }} />
            </div>
          </div>
        </section>

        {/* ── SECTION 4 : MISSION ─────────────────────────── */}
        <section style={{ padding: '80px 48px', background: 'transparent' }}>
          <div style={{ maxWidth: '896px', margin: '0 auto' }}>
            <span
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '.15em',
                marginBottom: '20px',
                color: 'var(--green)',
                fontFamily: "'Satoshi', sans-serif",
              }}
            >
              Mission
            </span>
            <h2
              style={{
                fontFamily: "'Satoshi', sans-serif",
                fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                fontWeight: 700,
                marginBottom: '28px',
                lineHeight: 1.25,
                color: 'var(--t1)',
              }}
            >
              Notre mission
            </h2>
            <p
              style={{
                fontFamily: "'Satoshi', sans-serif",
                fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
                fontWeight: 500,
                marginBottom: '24px',
                lineHeight: 1.55,
                color: 'var(--t1)',
              }}
            >
              Connecter la nouvelle génération à ses origines.
            </p>
            <p
              style={{
                fontSize: '1.0625rem',
                lineHeight: 1.85,
                marginBottom: '64px',
                color: 'var(--t2)',
                fontFamily: "'Satoshi', sans-serif",
              }}
            >
              Que tu sois né aux Comores ou que tu aies grandi loin de l&apos;archipel, Aswilia
              est fait pour toi. Pour que tes enfants sachent d&apos;où ils viennent. Pour que le
              nom de ton arrière-grand-mère ne disparaisse pas. Pour que le Hinya de ta famille
              traverse les générations. Pour que tu sois fier.
            </p>

            {/* Pillars */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
              }}
            >
              {pillars.map(({ title, text, color, bg, border }) => (
                <div
                  key={title}
                  style={{
                    borderRadius: 'var(--r)',
                    padding: '28px',
                    background: bg,
                    border: `1px solid ${border}`,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Satoshi', sans-serif",
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      marginBottom: '12px',
                      color,
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.75,
                      color: 'var(--t2)',
                      fontFamily: "'Satoshi', sans-serif",
                    }}
                  >
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 5 : CTA ─────────────────────────────── */}
        <section
          style={{
            padding: '112px 48px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--hero)',
            backgroundImage:
              'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(45,122,84,.35) 0%, transparent 60%),' +
              'radial-gradient(ellipse 50% 40% at 80% 20%, rgba(122,83,14,.15) 0%, transparent 50%)',
          }}
        >
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '768px', margin: '0 auto' }}>
            <span
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '.15em',
                marginBottom: '24px',
                color: 'rgba(255,255,255,.45)',
                fontFamily: "'Satoshi', sans-serif",
              }}
            >
              Rejoindre
            </span>
            <h2
              style={{
                fontFamily: "'Satoshi', sans-serif",
                fontSize: 'clamp(1.875rem, 4vw, 3rem)',
                fontWeight: 700,
                color: 'white',
                marginBottom: '32px',
                lineHeight: 1.15,
              }}
            >
              Plus qu&apos;un site,
              <br />
              une base de données vivante
            </h2>
            <p
              style={{
                fontSize: '1.0625rem',
                marginBottom: '48px',
                maxWidth: '640px',
                margin: '0 auto 48px',
                lineHeight: 1.8,
                color: 'rgba(255,255,255,.58)',
                fontFamily: "'Satoshi', sans-serif",
              }}
            >
              Aswilia n&apos;est pas seulement un endroit où consulter sa généalogie. C&apos;est un
              projet collectif. Chaque famille qui crée son arbre, chaque personne ajoutée, chaque
              Hinya enregistré — tout cela construit une base de données capable de connecter tous
              les Comoriens entre eux. Un jour, tu pourras découvrir que cette famille de Anjouan
              est liée à la tienne. Que ce Comorien de Paris partage ton Daho. Aswilia grandit avec
              vous.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: 'var(--r-sm)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all .2s',
                  background: 'white',
                  color: 'var(--green)',
                  padding: '13px 28px',
                  fontSize: '14px',
                  fontFamily: "'Satoshi', sans-serif",
                }}
              >
                Créer mon arbre
              </Link>
              <Link
                href="/registre"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: 'var(--r-sm)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all .2s',
                  color: 'white',
                  background: 'rgba(255,255,255,.1)',
                  border: '1px solid rgba(255,255,255,.28)',
                  padding: '13px 28px',
                  fontSize: '14px',
                  fontFamily: "'Satoshi', sans-serif",
                }}
              >
                Explorer le registre
              </Link>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
    </>
  )
}
