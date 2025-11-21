import { supabase, STORAGE_BUCKETS } from '../config/supabase.js';
import { optimizeImage, createThumbnail } from '../utils/imageProcessor.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all devices with pagination and filtering
 */
export async function getAllDevices(req, res) {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      status = '',
      manufacturer = ''
    } = req.query;

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('devices')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`imei.ilike.%${search}%,model.ilike.%${search}%,manufacturer.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (manufacturer) {
      query = query.eq('manufacturer', manufacturer);
    }

    // Apply pagination
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching devices:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch devices'
      });
    }

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllDevices:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Get single device by ID
 */
export async function getDeviceById(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Device not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in getDeviceById:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch device'
    });
  }
}

/**
 * Create new device
 */
export async function createDevice(req, res) {
  try {
    const deviceData = req.body;

    // Validate required fields
    if (!deviceData.manufacturer || !deviceData.model) {
      return res.status(400).json({
        success: false,
        error: 'Manufacturer and model are required'
      });
    }

    // Check for duplicate IMEI if provided
    if (deviceData.imei) {
      const { data: existing } = await supabase
        .from('devices')
        .select('id')
        .eq('imei', deviceData.imei)
        .single();

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Device with this IMEI already exists'
        });
      }
    }

    const { data, error } = await supabase
      .from('devices')
      .insert(deviceData)
      .select()
      .single();

    if (error) {
      console.error('Error creating device:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create device'
      });
    }

    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in createDevice:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Update device
 */
export async function updateDevice(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove id from updates if present
    delete updates.id;
    delete updates.created_at;

    // Set updated_at
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('devices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Device not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in updateDevice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update device'
    });
  }
}

/**
 * Delete device
 */
export async function deleteDevice(req, res) {
  try {
    const { id } = req.params;

    // Get device to check for associated files
    const { data: device } = await supabase
      .from('devices')
      .select('image_url, pdf_url')
      .eq('id', id)
      .single();

    if (device) {
      // Delete associated files from storage
      if (device.image_url) {
        const imagePath = device.image_url.split('/').pop();
        await supabase.storage
          .from(STORAGE_BUCKETS.DEVICE_IMAGES)
          .remove([imagePath]);
      }

      if (device.pdf_url) {
        const pdfPath = device.pdf_url.split('/').pop();
        await supabase.storage
          .from(STORAGE_BUCKETS.DOCUMENTS)
          .remove([pdfPath]);
      }
    }

    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteDevice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete device'
    });
  }
}

/**
 * Upload device image
 */
export async function uploadDeviceImage(req, res) {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Optimize image
    const { buffer } = await optimizeImage(req.file.buffer);

    // Generate unique filename
    const filename = `${id}-${uuidv4()}.webp`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.DEVICE_IMAGES)
      .upload(filename, buffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload image'
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS.DEVICE_IMAGES)
      .getPublicUrl(filename);

    // Update device with image URL
    const { data: device, error: updateError } = await supabase
      .from('devices')
      .update({ image_url: publicUrl })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      data: {
        imageUrl: publicUrl,
        device
      }
    });
  } catch (error) {
    console.error('Error in uploadDeviceImage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
}

/**
 * Upload device PDF document
 */
export async function uploadDeviceDocument(req, res) {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file provided'
      });
    }

    // Generate unique filename
    const filename = `${id}-${uuidv4()}.pdf`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.DOCUMENTS)
      .upload(filename, req.file.buffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading document:', uploadError);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload document'
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS.DOCUMENTS)
      .getPublicUrl(filename);

    // Update device with PDF URL
    const { data: device, error: updateError } = await supabase
      .from('devices')
      .update({ pdf_url: publicUrl })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      data: {
        pdfUrl: publicUrl,
        device
      }
    });
  } catch (error) {
    console.error('Error in uploadDeviceDocument:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload document'
    });
  }
}
