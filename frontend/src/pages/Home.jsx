// pages/Home.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1>TechSpace Solutions</h1>
        <p>Reservez votre salle de reunion en quelques clics</p>

        <div className="home-actions">
          {isAuthenticated ? (
            <>
              <Link to="/planning" className="btn btn-primary">Voir le planning</Link>
              <Link to="/salle-3d" className="btn btn-secondary">Visite 3D de la salle</Link>
              <Link to="/littlest-tokyo" className="btn btn-secondary">Littlest Tokyo 3D</Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">Commencer</Link>
              <Link to="/salle-3d" className="btn btn-secondary">Visite 3D de la salle</Link>
              <Link to="/littlest-tokyo" className="btn btn-secondary">Littlest Tokyo 3D</Link>
            </>
          )}
        </div>
      </div>

      <div className="home-features">
        <div className="home-feature">
          <div className="home-feature-icon">&#128197;</div>
          <h3>Planning visuel</h3>
          <p>Vue hebdomadaire claire de toutes les reservations du lundi au vendredi.</p>
        </div>
        <div className="home-feature">
          <div className="home-feature-icon">&#9889;</div>
          <h3>Reservation rapide</h3>
          <p>Cliquez sur un creneau libre pour reserver en quelques secondes.</p>
        </div>
        <div className="home-feature">
          <div className="home-feature-icon">&#128274;</div>
          <h3>Gestion simple</h3>
          <p>Modifiez ou annulez vos reservations a tout moment.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
