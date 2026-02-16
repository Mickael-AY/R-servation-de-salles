// pages/MyReservations.jsx
import { useState, useEffect } from 'react';
import { reservationService } from '../services/api.js';
import ReservationForm from '../components/ReservationForm.jsx';

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function normalizeDate(d) {
  return typeof d === 'string' ? d.split('T')[0] : d;
}

function normalizeTime(t) {
  return t ? t.substring(0, 5) : t;
}

function formatDisplayDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAYS_FR[d.getDay()]} ${d.getDate()}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await reservationService.getMine();
      setReservations(data.reservations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment annuler cette reservation ?')) return;
    try {
      await reservationService.delete(id);
      fetchReservations();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingReservation(null);
  };

  const handleFormSaved = () => {
    handleFormClose();
    fetchReservations();
  };

  const isPast = (reservation) => {
    const start = new Date(normalizeDate(reservation.date) + 'T' + normalizeTime(reservation.start_time));
    return start < new Date();
  };

  const upcoming = reservations.filter(r => !isPast(r));
  const past = reservations.filter(r => isPast(r));

  return (
    <div className="my-reservations-page">
      <h1>Mes reservations</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="loading">Chargement...</p>}

      {!loading && upcoming.length === 0 && (
        <p className="empty-message">Aucune reservation a venir.</p>
      )}

      {upcoming.length > 0 && (
        <>
          <h2>A venir</h2>
          <div className="reservations-list">
            {upcoming.map(r => (
              <div key={r.id} className="reservation-card">
                <div className="reservation-card-info">
                  <h3>{r.title}</h3>
                  <p>{formatDisplayDate(normalizeDate(r.date))}</p>
                  <p>{normalizeTime(r.start_time)} - {normalizeTime(r.end_time)}</p>
                </div>
                <div className="reservation-card-actions">
                  <button className="btn btn-small btn-primary" onClick={() => handleEdit(r)}>
                    Modifier
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(r.id)}>
                    Annuler
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <h2>Passees</h2>
          <div className="reservations-list">
            {past.map(r => (
              <div key={r.id} className="reservation-card past">
                <div className="reservation-card-info">
                  <h3>{r.title}</h3>
                  <p>{formatDisplayDate(normalizeDate(r.date))}</p>
                  <p>{normalizeTime(r.start_time)} - {normalizeTime(r.end_time)}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showForm && (
        <ReservationForm
          reservation={editingReservation}
          onClose={handleFormClose}
          onSaved={handleFormSaved}
        />
      )}
    </div>
  );
}

export default MyReservations;
