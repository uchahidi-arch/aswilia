const CONCEPTS = [
  {
    name: 'Hinya',
    body: 'La lignée matrilinéaire. Le clan transmis de mère en fille, qui définit l\'appartenance familiale profonde.',
  },
  {
    name: 'Daho',
    body: 'Le nom propre du foyer maternel. Il voyage avec les femmes et marque l\'identité de la maison.',
  },
  {
    name: 'Wa',
    body: 'Préfixe de filiation : "Wa Mangani" signifie "de la lignée Mangani", porteurs du nom du patriarche ou de la localité d\'origine.',
  },
  {
    name: 'Localité',
    body: 'Le village d\'origine rattaché à la famille. Un ancrage géographique essentiel à l\'identité comorienne.',
  },
];

export default function HinyaSection() {
  return (
    <section className="lng-section" id="sect-hinya">
      <div className="lng-inner">
        <span className="lng-eyebrow">Culture Comorienne</span>
        <h2 className="lng-title">
          Préservez le Hinya<br />et le Daho
        </h2>
        <p className="lng-body">
          Dans la tradition comorienne, l&apos;identité se transmet par la mère.
          Le Hinya — la lignée matrilinéaire — et le Daho — le foyer familial —
          sont au cœur de chaque famille. Aswilia les préserve automatiquement.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          width: '100%',
          marginTop: '40px',
        }}>
          {CONCEPTS.map(c => (
            <div
              key={c.name}
              style={{
                background: 'var(--h-surface)',
                border: '1px solid var(--h-border)',
                borderRadius: '14px',
                padding: '24px',
                textAlign: 'left',
              }}
            >
              <div style={{
                fontFamily: "'Satoshi', sans-serif",
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--h-gold)',
                marginBottom: '10px',
              }}>
                {c.name}
              </div>
              <p style={{
                fontSize: '14px',
                color: 'var(--h-text2)',
                lineHeight: 1.7,
              }}>
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
