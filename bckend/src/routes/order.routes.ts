import { Router } from 'express';
import {
  createOrder,
  getOrderHistory,
  getAllOrders,
  updateOrderStatus
} from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/isAdmin.middleware';

const router = Router();

router.post('/', authenticate, createOrder);
router.get('/history', authenticate, getOrderHistory);


router.get('/all', authenticate, isAdmin, getAllOrders);

router.patch('/:id/status', authenticate, isAdmin, updateOrderStatus);

export default router;
