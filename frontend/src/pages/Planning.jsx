// pages/Planning.jsx
import { useState, useEffect, useCallback } from 'react';
import { reservationService } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import ReservationForm from '../components/ReservationForm.jsx';

const HOUR_HEIGHT = 60;
const START_HOUR = 8;
const END_HOUR = 19;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS_FR = [
  'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'
];

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateYMD(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function normalizeDate(d) {
  return typeof d === 'string' ? d.split('T')[0] : d;
}

function normalizeTime(t) {
  return t ? t.substring(0, 5) : t;
}

function getWeekDays(monday) {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function Planning() {
  const { user } = useAuth();
  const [monday, setMonday] = useState(() => getMonday(new Date()));
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);
  const [error, setError] = useState('');

  const days = getWeekDays(monday);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await reservationService.getWeek(formatDateYMD(monday));
      setReservations(data.reservations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [monday]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const prevWeek = () => {
    const d = new Date(monday);
    d.setDate(d.getDate() - 7);
    setMonday(d);
  };

  const nextWeek = () => {
    const d = new Date(monday);
    d.setDate(d.getDate() + 7);
    setMonday(d);
  };

  const goToday = () => {
    setMonday(getMonday(new Date()));
  };

  const handleSlotClick = (date, hour) => {
    setEditingReservation(null);
    setSelectedSlot({
      date: formatDateYMD(date),
      startTime: `${String(hour).padStart(2, '0')}:00`,
      endTime: `${String(hour + 1).padStart(2, '0')}:00`
    });
    setShowForm(true);
  };

  const handleReservationClick = (reservation) => {
    if (reservation.user_id !== user?.id) return;
    setSelectedSlot(null);
    setEditingReservation(reservation);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedSlot(null);
    setEditingReservation(null);
  };

  const handleFormSaved = () => {
    handleFormClose();
    fetchReservations();
  };

  const getReservationsForDay = (date) => {
    const dateStr = formatDateYMD(date);
    return reservations.filter(r => normalizeDate(r.date) === dateStr);
  };

  const getReservationStyle = (startTime, endTime) => {
    const [sh, sm] = normalizeTime(startTime).split(':').map(Number);
    const [eh, em] = normalizeTime(endTime).split(':').map(Number);
    const top = ((sh - START_HOUR) + sm / 60) * HOUR_HEIGHT;
    const height = ((eh - sh) + (em - sm) / 60) * HOUR_HEIGHT;
    return { top: `${top}px`, height: `${height}px` };
  };

  const friday = days[4];
  const weekLabel = `${monday.getDate()} ${MONTHS_FR[monday.getMonth()]} - ${friday.getDate()} ${MONTHS_FR[friday.getMonth()]} ${friday.getFullYear()}`;

  return (
    <div className="planning-page">
      <div className="planning-header">
        <button onClick={prevWeek} className="btn btn-secondary">&larr; Precedente</button>
        <div className="planning-title">
          <h1>Planning de la semaine</h1>
          <p>{weekLabel}</p>
          <button onClick={goToday} className="btn btn-small">Aujourd&apos;hui</button>
        </div>
        <button onClick={nextWeek} className="btn btn-secondary">Suivante &rarr;</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="planning-grid-wrapper">
        <div className="planning-grid">
          {/* Colonne des heures */}
          <div className="time-column">
            <div className="day-header-cell"></div>
            {HOURS.map(h => (
              <div key={h} className="time-label" style={{ height: `${HOUR_HEIGHT}px` }}>
                {`${String(h).padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          {/* Colonnes des jours */}
          {days.map((date, idx) => {
            const dayReservations = getReservationsForDay(date);
            const isToday = formatDateYMD(date) === formatDateYMD(new Date());

            return (
              <div key={idx} className={`day-column ${isToday ? 'today' : ''}`}>
                <div className="day-header-cell">
                  <span className="day-name">{DAYS_FR[date.getDay()]}</span>
                  <span className="day-date">{date.getDate()}</span>
                </div>
                <div className="day-slots" style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}>
                  {/* Creneaux horaires cliquables */}
                  {HOURS.map(h => (
                    <div
                      key={h}
                      className="hour-slot"
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      onClick={() => handleSlotClick(date, h)}
                    />
                  ))}

                  {/* Reservations */}
                  {dayReservations.map(r => (
                    <div
                      key={r.id}
                      className={`reservation-block ${r.user_id === user?.id ? 'own' : ''}`}
                      style={getReservationStyle(r.start_time, r.end_time)}
                      onClick={(e) => { e.stopPropagation(); handleReservationClick(r); }}
                      title={`${r.title} - ${r.firstname} ${r.lastname}`}
                    >
                      <span className="reservation-title">{r.title}</span>
                      <span className="reservation-user">{r.firstname} {r.lastname}</span>
                      <span className="reservation-time">
                        {normalizeTime(r.start_time)} - {normalizeTime(r.end_time)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {loading && <div className="loading">Chargement...</div>}

      {showForm && (
        <ReservationForm
          reservation={editingReservation}
          slot={selectedSlot}
          onClose={handleFormClose}
          onSaved={handleFormSaved}
        />
      )}
    </div>
  );
}

export default Planning;
