// controllers/reservation.controller.js
import Reservation from '../models/reservation.model.js';

// Validation des regles metier
function validateReservation(date, start_time, end_time) {
  const errors = [];

  // Verifier que les champs sont presents
  if (!date || !start_time || !end_time) {
    return ['Tous les champs (date, start_time, end_time) sont requis'];
  }

  const reservationDate = new Date(date + 'T00:00:00');
  const dayOfWeek = reservationDate.getDay(); // 0=dim, 1=lun, ..., 6=sam

  // Jours ouvres uniquement (lundi-vendredi)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    errors.push('Les reservations sont possibles uniquement du lundi au vendredi');
  }

  // Horaires autorises (8h00 - 19h00)
  const startHour = parseInt(start_time.split(':')[0], 10);
  const startMin = parseInt(start_time.split(':')[1], 10);
  const endHour = parseInt(end_time.split(':')[0], 10);
  const endMin = parseInt(end_time.split(':')[1], 10);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  if (startMinutes < 480) { // 8h00 = 480 min
    errors.push('L\'heure de debut ne peut pas etre avant 08:00');
  }

  if (endMinutes > 1140) { // 19h00 = 1140 min
    errors.push('L\'heure de fin ne peut pas depasser 19:00');
  }

  // Heure de fin apres heure de debut
  if (endMinutes <= startMinutes) {
    errors.push('L\'heure de fin doit etre apres l\'heure de debut');
  }

  // Duree minimum 1 heure (60 minutes)
  if (endMinutes - startMinutes < 60) {
    errors.push('La duree minimum est de 1 heure');
  }

  // Pas de reservation dans le passe
  const now = new Date();
  const reservationStart = new Date(date + 'T' + start_time + ':00');
  if (reservationStart < now) {
    errors.push('Impossible de reserver un creneau deja passe');
  }

  return errors;
}

// GET /api/reservations
export const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findByUserId(req.user.id);
    res.json({ reservations });
  } catch (error) {
    console.error('Erreur getMyReservations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET /api/reservations/week?date=YYYY-MM-DD
export const getWeekReservations = async (req, res) => {
  try {
    let { date } = req.query;

    // Si pas de date, prendre aujourd'hui
    if (!date) {
      date = new Date().toISOString().split('T')[0];
    }

    // Calculer le lundi et vendredi de la semaine
    const current = new Date(date + 'T00:00:00');
    const dayOfWeek = current.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(current);
    monday.setDate(current.getDate() + diffToMonday);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const startDate = monday.toISOString().split('T')[0];
    const endDate = friday.toISOString().split('T')[0];

    const reservations = await Reservation.findByWeek(startDate, endDate);

    res.json({
      week_start: startDate,
      week_end: endDate,
      reservations
    });
  } catch (error) {
    console.error('Erreur getWeekReservations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST /api/reservations
export const createReservation = async (req, res) => {
  try {
    const { title, date, start_time, end_time } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Le titre est requis' });
    }

    // Validation des regles metier
    const errors = validateReservation(date, start_time, end_time);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0] });
    }

    // Verifier chevauchement
    const hasOverlap = await Reservation.checkOverlap(date, start_time, end_time);
    if (hasOverlap) {
      return res.status(409).json({ error: 'Ce creneau est deja reserve' });
    }

    const reservation = await Reservation.create({
      title: title.trim(),
      date,
      start_time,
      end_time,
      user_id: req.user.id
    });

    res.status(201).json({ message: 'Reservation creee avec succes', reservation });
  } catch (error) {
    console.error('Erreur createReservation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// PUT /api/reservations/:id
export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, start_time, end_time } = req.body;

    // Verifier que la reservation existe
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation introuvable' });
    }

    // Verifier la propriete
    if (reservation.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Vous ne pouvez modifier que vos propres reservations' });
    }

    // Verifier que la reservation n'est pas passee
    const reservationStart = new Date(reservation.date + 'T' + reservation.start_time);
    if (reservationStart < new Date()) {
      return res.status(400).json({ error: 'Impossible de modifier une reservation passee' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Le titre est requis' });
    }

    // Validation des regles metier
    const errors = validateReservation(date, start_time, end_time);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0] });
    }

    // Verifier chevauchement (exclure la reservation en cours de modif)
    const hasOverlap = await Reservation.checkOverlap(date, start_time, end_time, id);
    if (hasOverlap) {
      return res.status(409).json({ error: 'Ce creneau est deja reserve' });
    }

    await Reservation.update(id, { title: title.trim(), date, start_time, end_time });
    res.json({ message: 'Reservation modifiee avec succes' });
  } catch (error) {
    console.error('Erreur updateReservation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// DELETE /api/reservations/:id
export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifier que la reservation existe
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation introuvable' });
    }

    // Verifier la propriete
    if (reservation.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Vous ne pouvez annuler que vos propres reservations' });
    }

    // Verifier que la reservation n'est pas passee
    const reservationStart = new Date(reservation.date + 'T' + reservation.start_time);
    if (reservationStart < new Date()) {
      return res.status(400).json({ error: 'Impossible d\'annuler une reservation passee' });
    }

    await Reservation.delete(id);
    res.json({ message: 'Reservation annulee avec succes' });
  } catch (error) {
    console.error('Erreur deleteReservation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
