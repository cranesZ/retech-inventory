import express from 'express';
import {
  requireAdmin,
  getAllUsers,
  updateUserRole,
  deactivateUser,
  activateUser,
  deleteUser,
  createUser,
  getDashboardStats
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require admin role
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:userId/role', updateUserRole);
router.put('/users/:userId/activate', activateUser);
router.put('/users/:userId/deactivate', deactivateUser);
router.delete('/users/:userId', deleteUser);

export default router;
