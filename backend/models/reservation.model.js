// models/reservation.model.js
import { query } from '../config/db.js';

const Reservation = {
  // Creer une reservation
  async create({ title, date, start_time, end_time, user_id }) {
    const sql = `
      INSERT INTO reservations (title, date, start_time, end_time, user_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [title, date, start_time, end_time, user_id]);
    return { id: result.insertId, title, date, start_time, end_time, user_id };
  },

  // Trouver par ID
  async findById(id) {
    const sql = `
      SELECT r.*, u.firstname, u.lastname
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  },

  // Reservations d'une semaine (lundi-vendredi)
  async findByWeek(startDate, endDate) {
    const sql = `
      SELECT r.*, u.firstname, u.lastname
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      WHERE r.date BETWEEN ? AND ?
      ORDER BY r.date, r.start_time
    `;
    return query(sql, [startDate, endDate]);
  },

  // Mes reservations
  async findByUserId(userId) {
    const sql = `
      SELECT * FROM reservations
      WHERE user_id = ?
      ORDER BY date ASC, start_time ASC
    `;
    return query(sql, [userId]);
  },

  // Verifier chevauchement (exclure un id optionnel pour le cas modification)
  async checkOverlap(date, start_time, end_time, excludeId = null) {
    let sql = `
      SELECT id FROM reservations
      WHERE date = ?
        AND start_time < ?
        AND end_time > ?
    `;
    const params = [date, end_time, start_time];

    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    const results = await query(sql, params);
    return results.length > 0;
  },

  // Modifier une reservation
  async update(id, { title, date, start_time, end_time }) {
    const sql = `
      UPDATE reservations
      SET title = ?, date = ?, start_time = ?, end_time = ?
      WHERE id = ?
    `;
    return query(sql, [title, date, start_time, end_time, id]);
  },

  // Supprimer une reservation
  async delete(id) {
    const sql = 'DELETE FROM reservations WHERE id = ?';
    return query(sql, [id]);
  }
};

export default Reservation;
