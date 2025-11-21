import express from 'express';
import {
  signup,
  signin,
  signout,
  getProfile,
  enable2FA,
  verify2FA,
  resetPassword
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/signout', signout);
router.get('/profile', getProfile);
router.post('/2fa/enable', enable2FA);
router.post('/2fa/verify', verify2FA);
router.post('/reset-password', resetPassword);

export default router;
