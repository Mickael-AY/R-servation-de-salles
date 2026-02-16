// layouts/AuthLayout.jsx
import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="auth-page">
      <div className="auth-branding">
        <h2>TechSpace</h2>
        <p>Gerez vos reservations de salle<br />simplement et efficacement.</p>
      </div>
      <div className="auth-form-side">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
