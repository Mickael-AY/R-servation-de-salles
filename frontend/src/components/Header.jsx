// components/Header.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <Link to="/" className="header-brand">TechSpace</Link>

      <nav className="header-nav">
        {isAuthenticated && (
          <>
            <NavLink to="/planning">Planning</NavLink>
            <NavLink to="/mes-reservations">Mes reservations</NavLink>
          </>
        )}
      </nav>

      <div className="header-actions">
        {isAuthenticated ? (
          <>
            <Link to="/profil" className="header-user">{user?.firstname} {user?.lastname}</Link>
            <button onClick={handleLogout} className="btn btn-small">Deconnexion</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-small">Connexion</Link>
            <Link to="/register" className="btn btn-small btn-primary">S&apos;inscrire</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
