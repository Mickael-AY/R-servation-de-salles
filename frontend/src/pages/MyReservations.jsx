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

function formatDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDate();
}

function formatMonth(dateStr) {
  const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date(dateStr + 'T00:00:00');
  return months[d.getMonth()];
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
      <div className="myres-header">
        <div>
          <h1>Mes reservations</h1>
          <p className="myres-subtitle">{reservations.length} reservation{reservations.length !== 1 ? 's' : ''} au total</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingReservation(null); setShowForm(true); }}>
          + Nouvelle reservation
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="loading">Chargement...</p>}

      {!loading && upcoming.length === 0 && (
        <div className="myres-empty">
          <div className="myres-empty-icon">&#128197;</div>
          <p>Aucune reservation a venir</p>
          <span>Reservez une salle pour votre prochaine reunion</span>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="myres-section">
          <div className="myres-section-header">
            <span className="myres-section-dot upcoming"></span>
            <h2>A venir</h2>
            <span className="myres-section-count">{upcoming.length}</span>
          </div>
          <div className="reservations-list">
            {upcoming.map(r => {
              const date = normalizeDate(r.date);
              return (
                <div key={r.id} className="reservation-card">
                  <div className="rescard-date-badge">
                    <span className="rescard-day">{formatDay(date)}</span>
                    <span className="rescard-month">{formatMonth(date)}</span>
                  </div>
                  <div className="rescard-content">
                    <h3>{r.title}</h3>
                    <div className="rescard-meta">
                      <span className="rescard-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {formatDisplayDate(date)}
                      </span>
                      <span className="rescard-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {normalizeTime(r.start_time)} - {normalizeTime(r.end_time)}
                      </span>
                    </div>
                  </div>
                  <div className="reservation-card-actions">
                    <button className="btn-icon btn-edit" onClick={() => handleEdit(r)} title="Modifier">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="btn-icon btn-delete" onClick={() => handleDelete(r.id)} title="Annuler">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div className="myres-section">
          <div className="myres-section-header">
            <span className="myres-section-dot past"></span>
            <h2>Passees</h2>
            <span className="myres-section-count">{past.length}</span>
          </div>
          <div className="reservations-list">
            {past.map(r => {
              const date = normalizeDate(r.date);
              return (
                <div key={r.id} className="reservation-card past">
                  <div className="rescard-date-badge past">
                    <span className="rescard-day">{formatDay(date)}</span>
                    <span className="rescard-month">{formatMonth(date)}</span>
                  </div>
                  <div className="rescard-content">
                    <h3>{r.title}</h3>
                    <div className="rescard-meta">
                      <span className="rescard-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {formatDisplayDate(date)}
                      </span>
                      <span className="rescard-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {normalizeTime(r.start_time)} - {normalizeTime(r.end_time)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
