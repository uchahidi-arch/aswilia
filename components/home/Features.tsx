const FEATURES = [
  {
    ico: '🌳',
    title: 'Arbre Généalogique',
    body: 'Visualisez votre famille en arbre interactif. Remontez jusqu\'aux ancêtres, naviguez entre les générations d\'un clic.',
  },
  {
    ico: '⬡',
    title: 'Hinya & Daho',
    body: 'Préservez les lignées matrilinéaires comoriennes. Le Hinya et le Daho se propagent automatiquement à toute la descendance féminine.',
  },
  {
    ico: '🔍',
    title: 'Registre Comorien',
    body: 'Cherchez n\'importe qui parmi toutes les familles enregistrées, organisées par île, région et localité.',
  },
  {
    ico: '🤝',
    title: 'Relier les Familles',
    body: 'Demandez à relier votre arbre à celui d\'une autre famille. Les connexions sont validées par les deux parties.',
  },
  {
    ico: '📄',
    title: 'Export PDF',
    body: 'Exportez l\'arbre d\'ascendance de n\'importe quelle personne en PDF A3, prêt à imprimer et à offrir.',
  },
  {
    ico: '🔒',
    title: 'Vos données vous appartiennent',
    body: 'Chaque famille gère son propre arbre. Vous contrôlez ce que vous partagez avec le registre commun.',
  },
];

export default function Features() {
  return (
    <section className="home-section" id="sect-features">
      <div className="home-inner">
        <div className="s-kicker">Fonctionnalités</div>
        <h2 className="s-title">
          Tout ce dont votre famille<br /><em>a besoin</em>
        </h2>
        <p className="s-sub">
          Un outil conçu pour la réalité comorienne, accessible à tous — de 8 à 80 ans.
        </p>
        <div className="feat-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feat-card">
              <div className="feat-ico">{f.ico}</div>
              <div className="feat-title">{f.title}</div>
              <p className="feat-body">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
