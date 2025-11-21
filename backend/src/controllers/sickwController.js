import { supabase } from '../config/supabase.js';

const SICKW_BASE_URL = 'https://api.sickw.com'; // Replace with actual SICKW API URL
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Get cached data or fetch fresh if expired
 */
async function getCachedOrFetch(cacheKey, fetchFunction) {
  try {
    // Check cache
    const { data: cached, error: cacheError } = await supabase
      .from('api_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .single();

    // If cache exists and not expired
    if (cached && !cacheError) {
      const now = new Date();
      const expiresAt = new Date(cached.expires_at);

      if (now < expiresAt) {
        console.log(`✅ Cache HIT for ${cacheKey}`);
        // Update last_accessed_at
        await supabase
          .from('api_cache')
          .update({ last_accessed_at: new Date().toISOString() })
          .eq('cache_key', cacheKey);

        return {
          data: cached.cache_data,
          unparsed: cached.unparsed_data,
          cached: true,
          age: Math.floor((now - new Date(cached.created_at)) / 1000) // seconds
        };
      }
    }

    console.log(`❌ Cache MISS for ${cacheKey} - fetching fresh data...`);

    // Fetch fresh data
    const { data, unparsed } = await fetchFunction();

    // Store in cache
    const expiresAt = new Date(Date.now() + CACHE_DURATION);
    await supabase
      .from('api_cache')
      .upsert({
        cache_key: cacheKey,
        cache_data: data,
        unparsed_data: unparsed,
        endpoint: cacheKey.split(':')[0],
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString()
      });

    return {
      data,
      unparsed,
      cached: false,
      age: 0
    };
  } catch (error) {
    console.error('Cache error:', error);
    // If cache fails, still try to fetch fresh data
    const { data, unparsed } = await fetchFunction();
    return { data, unparsed, cached: false, age: 0 };
  }
}

/**
 * Get device pricing from SICKW API
 */
export async function getDevicePricing(req, res) {
  try {
    const { imei, model, condition } = req.query;

    if (!imei && !model) {
      return res.status(400).json({
        success: false,
        error: 'IMEI or model is required'
      });
    }

    const cacheKey = `sickw:pricing:${imei || model}:${condition || 'any'}`;

    const result = await getCachedOrFetch(cacheKey, async () => {
      // Fetch from SICKW API (replace with actual API call)
      const response = await fetch(`${SICKW_BASE_URL}/pricing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SICKW_API_KEY || ''}`
        },
        body: JSON.stringify({
          imei,
          model,
          condition
        })
      });

      const rawText = await response.text();
      let jsonData;

      try {
        jsonData = JSON.parse(rawText);
      } catch (e) {
        // If parsing fails, return raw text
        jsonData = { raw: rawText };
      }

      return {
        data: jsonData,
        unparsed: rawText
      };
    });

    res.json({
      success: true,
      data: result.data,
      meta: {
        cached: result.cached,
        age_seconds: result.age
      }
    });
  } catch (error) {
    console.error('Error in getDevicePricing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch device pricing'
    });
  }
}

/**
 * Get device information from SICKW API
 */
export async function getDeviceInfo(req, res) {
  try {
    const { imei } = req.params;

    if (!imei) {
      return res.status(400).json({
        success: false,
        error: 'IMEI is required'
      });
    }

    const cacheKey = `sickw:device:${imei}`;

    const result = await getCachedOrFetch(cacheKey, async () => {
      const response = await fetch(`${SICKW_BASE_URL}/device/${imei}`, {
        headers: {
          'Authorization': `Bearer ${process.env.SICKW_API_KEY || ''}`
        }
      });

      const rawText = await response.text();
      let jsonData;

      try {
        jsonData = JSON.parse(rawText);
      } catch (e) {
        jsonData = { raw: rawText };
      }

      return {
        data: jsonData,
        unparsed: rawText
      };
    });

    res.json({
      success: true,
      data: result.data,
      meta: {
        cached: result.cached,
        age_seconds: result.age
      }
    });
  } catch (error) {
    console.error('Error in getDeviceInfo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch device info'
    });
  }
}

/**
 * Clear cache for specific key or all
 */
export async function clearCache(req, res) {
  try {
    const { cache_key } = req.query;

    if (cache_key) {
      await supabase
        .from('api_cache')
        .delete()
        .eq('cache_key', cache_key);

      res.json({
        success: true,
        message: `Cache cleared for ${cache_key}`
      });
    } else {
      // Clear all expired cache
      await supabase
        .from('api_cache')
        .delete()
        .lt('expires_at', new Date().toISOString());

      res.json({
        success: true,
        message: 'Expired cache cleared'
      });
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(req, res) {
  try {
    const { data, error } = await supabase
      .from('api_cache')
      .select('endpoint, created_at, expires_at, last_accessed_at');

    if (error) throw error;

    const now = new Date();
    const stats = {
      total: data.length,
      expired: data.filter(c => new Date(c.expires_at) < now).length,
      active: data.filter(c => new Date(c.expires_at) >= now).length,
      by_endpoint: {}
    };

    data.forEach(cache => {
      if (!stats.by_endpoint[cache.endpoint]) {
        stats.by_endpoint[cache.endpoint] = 0;
      }
      stats.by_endpoint[cache.endpoint]++;
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache stats'
    });
  }
}
