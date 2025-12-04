import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container animate-fade-in">
      <section style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: '800' }}>
          Nuit de l'Info <span style={{ color: 'var(--accent-primary)' }}>2025</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Bienvenue sur le hub central. Choisissez votre défi et commencez l'aventure.
        </p>
      </section>

      <section>
        <h2 style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '1rem' }}>
          Défis Disponibles
        </h2>

        <div className="grid-cards">
          {/* Main Challenge Card */}
          {/* Mission Briefing */}
          <div className="card" style={{ gridColumn: '1 / -1', marginBottom: '2rem', borderColor: '#ef4444', background: 'linear-gradient(45deg, #1a0505, #000)' }}>
            <h3 style={{ color: '#ef4444', fontSize: '2rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
              ⚠️ MISSION : LE VILLAGE NUMÉRIQUE RÉSISTANT (Défi principal)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>CONTEXTE : L'EMPIRE CONTRE-ATTAQUE</h4>
                <p style={{ color: '#ccc' }}>
                  Les établissements scolaires sont sous le joug des "Big Tech". Obsolescence programmée, fin du support Windows 10, coûts exorbitants, données stockées hors UE...
                  L'autonomie de nos écoles est menacée.
                </p>
              </div>

              <div>
                <h4 style={{ color: '#0f0', marginBottom: '0.5rem' }}>LA SOLUTION : PROTOCOLE N.I.R.D.</h4>
                <p style={{ color: '#ccc' }}>
                  <strong style={{ color: '#0f0' }}>N</strong>umérique <strong style={{ color: '#0f0' }}>I</strong>nclusif, <strong style={{ color: '#0f0' }}>R</strong>esponsable et <strong style={{ color: '#0f0' }}>D</strong>urable.
                  <br />
                  Nous devons adopter une démarche de résistance : promouvoir Linux, le logiciel libre et lutter contre le gaspillage numérique.
                </p>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/nird-tools" style={{
                  backgroundColor: '#ef4444',
                  color: '#000',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}>
                  ACCÉDER AUX OUTILS DE LA RÉSISTANCE &rarr;
                </Link>
                <a href="https://nird.forge.apps.education.fr/" target="_blank" rel="noopener noreferrer" style={{ color: '#ef4444', textDecoration: 'underline', alignSelf: 'center' }}>
                  Archives officielles (Site NIRD)
                </a>
              </div>
            </div>
          </div>

          {/* Rube Goldberg */}
          <Link to="/quests/rube-goldberg" className="card" style={{ borderColor: '#4a90e2' }}>
            <h3 style={{ color: '#4a90e2' }}>Rube Goldberg</h3>
            <p>Prouvez que vous êtes humain... si vous le pouvez.</p>
            <div style={{ marginTop: '1rem', display: 'inline-block', fontSize: '0.9rem', color: '#4a90e2' }}>
              Vérification &rarr;
            </div>
          </Link>

          {/* Bad Phone */}
          <Link to="/quests/bad-phone" className="card" style={{ borderColor: '#deef44ff' }}>
            <h3 style={{ color: '#deef44ff' }}>Bad Phone</h3>
            <p>L'enfer de l'UX. Bonne chance pour entrer votre numéro.</p>
            <div style={{ marginTop: '1rem', display: 'inline-block', fontSize: '0.9rem', color: '#deef44ff' }}>
              Souffrir &rarr;
            </div>
          </Link>

          {/* Pixel Game */}
          <Link to="/quests/pixel-game" className="card" style={{ borderColor: '#0f0' }}>
            <h3 style={{ color: '#0f0', fontFamily: 'monospace' }}>Pixel Game</h3>
            <p style={{ fontFamily: 'monospace' }}>Infiltrez le système. Roguelike procédural.</p>
            <div style={{ marginTop: '1rem', display: 'inline-block', fontSize: '0.9rem', color: '#0f0' }}>
              Lancer le hack &rarr;
            </div>
          </Link>

          {/* Hidden Snake */}
          <Link to="/quests/ugly" className="card" style={{ borderColor: '#555', backgroundColor: '#000' }}>
            <h3 style={{ color: '#0f0', fontFamily: 'monospace' }}>Hidden Snake</h3>
            <p style={{ fontFamily: 'monospace', color: '#0f0' }}>Connexion interrompue... Des données semblent cachées ici.</p>
            <div style={{ marginTop: '1rem', display: 'inline-block', fontSize: '0.9rem', color: '#0f0' }}>
              Décrypter &rarr;
            </div>
          </Link>


        </div>
      </section>
    </div>
  );
};

export default Home;
