import express from 'express';
import {
  getAllDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
  uploadDeviceImage,
  uploadDeviceDocument
} from '../controllers/devicesController.js';
import { upload, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Device CRUD routes
router.get('/', getAllDevices);
router.get('/:id', getDeviceById);
router.post('/', createDevice);
router.put('/:id', updateDevice);
router.delete('/:id', deleteDevice);

// File upload routes
router.post('/:id/image', upload.single('image'), handleUploadError, uploadDeviceImage);
router.post('/:id/document', upload.single('document'), handleUploadError, uploadDeviceDocument);

export default router;
