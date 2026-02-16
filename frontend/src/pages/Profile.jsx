// pages/Profile.jsx
import { useAuth } from '../hooks/useAuth.js';

function Profile() {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <h1>Mon profil</h1>
      <div className="profile-card">
        <div className="profile-avatar">
          {user?.firstname?.charAt(0)}{user?.lastname?.charAt(0)}
        </div>
        <div className="profile-info">
          <div className="profile-field">
            <label>Prenom</label>
            <p>{user?.firstname}</p>
          </div>
          <div className="profile-field">
            <label>Nom</label>
            <p>{user?.lastname}</p>
          </div>
          <div className="profile-field">
            <label>Email</label>
            <p>{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
