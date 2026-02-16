// pages/Dashboard.jsx
// Redirige vers /planning (ancienne page remplacee)
import { Navigate } from 'react-router-dom';

function Dashboard() {
  return <Navigate to="/planning" replace />;
}

export default Dashboard;
