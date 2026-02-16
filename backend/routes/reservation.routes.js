// routes/reservation.routes.js
import { Router } from 'express';
import {
  getMyReservations,
  getWeekReservations,
  createReservation,
  updateReservation,
  deleteReservation
} from '../controllers/reservation.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

// Toutes les routes sont protegees
router.use(authMiddleware);

router.get('/', getMyReservations);
router.get('/week', getWeekReservations);
router.post('/', createReservation);
router.put('/:id', updateReservation);
router.delete('/:id', deleteReservation);

export default router;
