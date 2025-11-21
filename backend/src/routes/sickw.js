import express from 'express';
import {
  getDevicePricing,
  getDeviceInfo,
  clearCache,
  getCacheStats
} from '../controllers/sickwController.js';

const router = express.Router();

/**
 * Get device pricing from SICKW API
 * Query params: imei, model, condition
 */
router.get('/pricing', getDevicePricing);

/**
 * Get device information from SICKW API
 * Params: imei
 */
router.get('/device/:imei', getDeviceInfo);

/**
 * Clear cache
 * Query params: cache_key (optional - clears specific key or all expired)
 */
router.delete('/cache', clearCache);

/**
 * Get cache statistics
 */
router.get('/cache/stats', getCacheStats);

export default router;
