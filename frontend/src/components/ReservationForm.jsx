// components/ReservationForm.jsx
import { useState } from 'react';
import { reservationService } from '../services/api.js';

function normalizeTime(t) {
  return t ? t.substring(0, 5) : t;
}

function normalizeDate(d) {
  return typeof d === 'string' ? d.split('T')[0] : d;
}

// Options de 08:00 a 19:00 par tranches de 30 min
const TIME_OPTIONS = [];
for (let h = 8; h <= 19; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 19) TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`);
}

function ReservationForm({ reservation, slot, onClose, onSaved }) {
  const isEditing = !!reservation;

  const [title, setTitle] = useState(isEditing ? reservation.title : '');
  const [date, setDate] = useState(
    isEditing ? normalizeDate(reservation.date) : (slot?.date || '')
  );
  const [startTime, setStartTime] = useState(
    isEditing ? normalizeTime(reservation.start_time) : (slot?.startTime || '08:00')
  );
  const [endTime, setEndTime] = useState(
    isEditing ? normalizeTime(reservation.end_time) : (slot?.endTime || '09:00')
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = { title, date, start_time: startTime, end_time: endTime };
      if (isEditing) {
        await reservationService.update(reservation.id, data);
      } else {
        await reservationService.create(data);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Voulez-vous vraiment annuler cette reservation ?')) return;
    setLoading(true);
    try {
      await reservationService.delete(reservation.id);
      onSaved();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Modifier la reservation' : 'Nouvelle reservation'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Titre</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Reunion d'equipe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Debut</label>
              <select
                id="startTime"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              >
                {TIME_OPTIONS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="endTime">Fin</label>
              <select
                id="endTime"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              >
                {TIME_OPTIONS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            {isEditing && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={loading}
              >
                Annuler la reservation
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Fermer
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'En cours...' : (isEditing ? 'Modifier' : 'Reserver')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReservationForm;
