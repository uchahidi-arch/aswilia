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
    body: 'Préfixe de filiation : "Wa Mangani" signifie "de la lignée Mangani", porteurs du nom du patriarche ou de la localite d\'origine.',
  },
  {
    name: 'Localité',
    body: 'Le village d\'origine rattaché à la famille. Un ancrage géographique essentiel à l\'identité comorienne.',
  },
];

export default function HinyaSection() {
  return (
    <section className="hinya-section" id="sect-hinya">
      <div className="hinya-inner">
        {/* Left column */}
        <div>
          <div className="h-kicker">Culture Comorienne</div>
          <h2 className="h-title">
            Préservez le <em>Hinya</em><br />et le Daho
          </h2>
          <p className="h-body">
            Dans la tradition comorienne, l&apos;identité se transmet par la mère. Le Hinya — la lignée matrilinéaire —
            et le Daho — le foyer familial — sont au cœur de chaque famille.
            Aswilia les préserve automatiquement à travers toutes les générations.
          </p>
          <div className="h-concepts">
            {CONCEPTS.map((c) => (
              <div key={c.name} className="h-concept">
                <div className="h-c-name">{c.name}</div>
                <p className="h-c-body">{c.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — visual demo */}
        <div className="h-visual">
          <div className="tree-demo">
            <div className="td-root">
              <div className="td-node f">Fatiha · Hinya Fwambaya</div>
              <div className="td-line" />
              <div className="td-row">
                <div className="td-node m" style={{ padding: '2px 14px', fontSize: '11px' }}>Ali</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                  <div className="td-node f">Aïsha · Hinya Fwambaya ✓</div>
                  <div className="td-line" />
                  <div className="td-node f" style={{ fontSize: '11px' }}>Leïla · Hinya Fwambaya ✓</div>
                </div>
              </div>
            </div>
            <p style={{ marginTop: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
              Le Hinya se propage automatiquement<br />à toutes les descendantes féminines.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
