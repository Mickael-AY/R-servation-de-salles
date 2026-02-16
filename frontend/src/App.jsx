// App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';

import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Planning from './pages/Planning.jsx';
import MyReservations from './pages/MyReservations.jsx';
import Profile from './pages/Profile.jsx';
import Room3D from './pages/Room3D.jsx';

function App() {
  const { loading } = useAuth();

  if (loading) return <div className="loading"><p>Chargement...</p></div>;

  return (
    <Routes>
      {/* Routes AVEC Header + Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/planning" element={
          <PrivateRoute><Planning /></PrivateRoute>
        } />
        <Route path="/mes-reservations" element={
          <PrivateRoute><MyReservations /></PrivateRoute>
        } />
        <Route path="/profil" element={
          <PrivateRoute><Profile /></PrivateRoute>
        } />
      </Route>

      {/* Routes SANS Header (plein ecran) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Route plein ecran 3D (sans layout) */}
      <Route path="/salle-3d" element={<Room3D />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
