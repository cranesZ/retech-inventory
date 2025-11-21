# SICKW API Integration Guide

## Quick Start

### 1. Set API Key

```typescript
import { sickwAPI } from './services/sickw-api';

// Set API key (stored in localStorage)
sickwAPI.setApiKey('your-sickw-api-key-here');
```

### 2. Lookup Device

```typescript
try {
  const deviceInfo = await sickwAPI.lookupIMEI('352117355388857');

  if (deviceInfo) {
    console.log('Model:', deviceInfo.model);
    console.log('IMEI:', deviceInfo.imei);
    console.log('Warranty:', deviceInfo.warrantyStatus);
    console.log('iCloud Lock:', deviceInfo.iCloudLock);
    console.log('GSMA Status:', deviceInfo.gsmaBlacklistStatus);
  }
} catch (error) {
  console.error('Lookup failed:', error);
}
```

## Complete Example

```typescript
import { sickwAPI, DeviceInfo } from './services/sickw-api';

async function checkDevice(imei: string) {
  // Verify API key is set
  if (!sickwAPI.getApiKey()) {
    throw new Error('Please set SICKW API key first');
  }

  // Lookup device
  const device: DeviceInfo | null = await sickwAPI.lookupIMEI(imei);

  if (!device) {
    console.log('No device information found');
    return;
  }

  // Display basic info
  console.log('\n=== Device Information ===');
  console.log(`Model: ${device.model || 'Unknown'}`);
  console.log(`Serial: ${device.serialNumber || 'N/A'}`);
  console.log(`IMEI: ${device.imei}`);
  if (device.imei2) {
    console.log(`IMEI2: ${device.imei2}`);
  }

  // Display warranty info
  console.log('\n=== Warranty Status ===');
  console.log(`Status: ${device.warrantyStatus || 'Unknown'}`);
  console.log(`Coverage: ${device.repairsAndServiceCoverage || 'Unknown'}`);
  if (device.repairsAndServiceExpirationDate) {
    console.log(`Expires: ${device.repairsAndServiceExpirationDate}`);
  }

  // Display iCloud status
  console.log('\n=== iCloud Status ===');
  console.log(`Lock: ${device.iCloudLock || 'Unknown'}`);
  console.log(`Status: ${device.iCloudStatus || 'Unknown'}`);

  // Display carrier info
  console.log('\n=== Carrier & Lock ===');
  console.log(`Carrier: ${device.lockedCarrier || 'Unknown'}`);
  console.log(`SIM Lock: ${device.simLockStatus || 'Unknown'}`);

  // Display GSMA report
  console.log('\n=== GSMA Report ===');
  console.log(`Blacklist: ${device.gsmaBlacklistStatus || 'N/A'}`);
  console.log(`Manufacturer: ${device.gsmaManufacturer || 'N/A'}`);

  // Check for red flags
  const redFlags: string[] = [];
  if (device.iCloudLock === 'ON') redFlags.push('iCloud Locked');
  if (device.gsmaBlacklistStatus === 'BLACKLISTED') redFlags.push('Blacklisted');
  if (device.iCloudStatus?.toLowerCase().includes('lost') ||
      device.iCloudStatus?.toLowerCase().includes('stolen')) {
    redFlags.push('Lost/Stolen');
  }

  if (redFlags.length > 0) {
    console.log('\n⚠️  RED FLAGS:');
    redFlags.forEach(flag => console.log(`  - ${flag}`));
  } else {
    console.log('\n✅ No major issues detected');
  }

  return device;
}

// Usage
checkDevice('352117355388857')
  .then(device => console.log('\nLookup complete'))
  .catch(error => console.error('Error:', error.message));
```

## React Component Example

```typescript
import React, { useState } from 'react';
import { sickwAPI, DeviceInfo } from '../services/sickw-api';

export function DeviceLookup() {
  const [imei, setImei] = useState('');
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!imei.trim()) {
      setError('Please enter an IMEI');
      return;
    }

    setLoading(true);
    setError(null);
    setDevice(null);

    try {
      const result = await sickwAPI.lookupIMEI(imei.trim());
      setDevice(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="device-lookup">
      <h2>IMEI Lookup</h2>

      <div className="input-group">
        <input
          type="text"
          value={imei}
          onChange={(e) => setImei(e.target.value)}
          placeholder="Enter IMEI"
          disabled={loading}
        />
        <button onClick={handleLookup} disabled={loading}>
          {loading ? 'Looking up...' : 'Lookup'}
        </button>
      </div>

      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}

      {device && (
        <div className="device-info">
          <h3>Device Information</h3>

          <div className="info-section">
            <h4>Basic Info</h4>
            <p><strong>Model:</strong> {device.model}</p>
            <p><strong>IMEI:</strong> {device.imei}</p>
            {device.imei2 && <p><strong>IMEI2:</strong> {device.imei2}</p>}
            <p><strong>Serial:</strong> {device.serialNumber}</p>
          </div>

          <div className="info-section">
            <h4>Status</h4>
            <p><strong>Warranty:</strong> {device.warrantyStatus}</p>
            <p><strong>iCloud Lock:</strong>
              <span className={device.iCloudLock === 'ON' ? 'status-bad' : 'status-good'}>
                {device.iCloudLock}
              </span>
            </p>
            <p><strong>GSMA Blacklist:</strong>
              <span className={device.gsmaBlacklistStatus === 'BLACKLISTED' ? 'status-bad' : 'status-good'}>
                {device.gsmaBlacklistStatus}
              </span>
            </p>
          </div>

          <div className="info-section">
            <h4>Carrier</h4>
            <p><strong>Locked Carrier:</strong> {device.lockedCarrier}</p>
            <p><strong>SIM Lock:</strong> {device.simLockStatus}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Error Handling

### Common Errors

```typescript
try {
  const device = await sickwAPI.lookupIMEI(imei);
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('API key not configured')) {
      // Prompt user to set API key in settings
      showSettingsDialog();
    } else if (error.message.includes('HTTP error')) {
      // Network error
      showError('Network error. Please check your connection.');
    } else if (error.message.includes('failed')) {
      // API returned error
      showError(`Lookup failed: ${error.message}`);
    } else {
      // Unknown error
      showError('An unexpected error occurred');
    }
  }
}
```

## Field Interpretation

### Warranty Status
- "Active" / "Limited Warranty" → Device is covered
- "Coverage Expired" → Out of warranty
- "Expired" → No coverage

### iCloud Lock
- "OFF" → Good (can be activated)
- "ON" → Locked (requires original owner)

### iCloud Status
- "Clean" → Good
- "Lost/Stolen" → Device reported as lost/stolen

### GSMA Blacklist Status
- "CLEAN" → Good (not blacklisted)
- "BLACKLISTED" → Device reported stolen or lost

### SIM Lock Status
- "Unlocked" → Can use any carrier
- "Locked" → Tied to specific carrier

### Device Flags
- "Demo Unit: Yes" → Store demo device
- "Loaner Device: Yes" → Temporary replacement device
- "Replacement Device: Yes" → Warranty replacement
- "Refurbished Device: Yes" → Refurbished by Apple

## Best Practices

### 1. Validate IMEI Before Lookup

```typescript
function isValidIMEI(imei: string): boolean {
  // Remove spaces and dashes
  const clean = imei.replace(/[\s-]/g, '');

  // IMEI should be 15 digits
  return /^\d{15}$/.test(clean);
}

async function safeLookup(imei: string) {
  if (!isValidIMEI(imei)) {
    throw new Error('Invalid IMEI format. Must be 15 digits.');
  }

  return await sickwAPI.lookupIMEI(imei);
}
```

### 2. Cache Results

```typescript
const cache = new Map<string, { data: DeviceInfo; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function cachedLookup(imei: string): Promise<DeviceInfo | null> {
  const cached = cache.get(imei);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Returning cached result');
    return cached.data;
  }

  const result = await sickwAPI.lookupIMEI(imei);

  if (result) {
    cache.set(imei, { data: result, timestamp: Date.now() });
  }

  return result;
}
```

### 3. Rate Limiting

```typescript
class RateLimiter {
  private lastCall = 0;
  private minInterval = 1000; // 1 second between calls

  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;

    if (timeSinceLastCall < this.minInterval) {
      await new Promise(resolve =>
        setTimeout(resolve, this.minInterval - timeSinceLastCall)
      );
    }

    this.lastCall = Date.now();
    return fn();
  }
}

const limiter = new RateLimiter();

async function throttledLookup(imei: string) {
  return limiter.throttle(() => sickwAPI.lookupIMEI(imei));
}
```

### 4. Batch Lookups

```typescript
async function batchLookup(imeis: string[]): Promise<DeviceInfo[]> {
  const results: DeviceInfo[] = [];

  for (const imei of imeis) {
    try {
      const device = await throttledLookup(imei);
      if (device) {
        results.push(device);
      }
    } catch (error) {
      console.error(`Failed to lookup ${imei}:`, error);
      // Continue with next IMEI
    }

    // Progress tracking
    console.log(`Progress: ${results.length}/${imeis.length}`);
  }

  return results;
}
```

## TypeScript Types

### Full Type Definitions

```typescript
import { DeviceInfo } from './services/sickw-api';

// Type guard
function isDeviceClean(device: DeviceInfo): boolean {
  return (
    device.gsmaBlacklistStatus !== 'BLACKLISTED' &&
    device.iCloudLock !== 'ON' &&
    !device.iCloudStatus?.toLowerCase().includes('lost') &&
    !device.iCloudStatus?.toLowerCase().includes('stolen')
  );
}

// Type with computed properties
interface EnhancedDeviceInfo extends DeviceInfo {
  isClean: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

function enhanceDeviceInfo(device: DeviceInfo): EnhancedDeviceInfo {
  const isClean = isDeviceClean(device);

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (device.gsmaBlacklistStatus === 'BLACKLISTED') {
    riskLevel = 'high';
  } else if (device.iCloudLock === 'ON') {
    riskLevel = 'medium';
  }

  return {
    ...device,
    isClean,
    riskLevel
  };
}
```

## Testing

### Mock API for Testing

```typescript
// test-utils/mock-sickw.ts
import { DeviceInfo } from '../services/sickw-api';

export const mockDeviceClean: DeviceInfo = {
  model: 'iPhone 13 Pro 256GB Graphite',
  imei: '123456789012345',
  serialNumber: 'F2ABC123',
  warrantyStatus: 'Active',
  iCloudLock: 'OFF',
  iCloudStatus: 'Clean',
  gsmaBlacklistStatus: 'CLEAN',
  simLockStatus: 'Unlocked'
};

export const mockDeviceBlacklisted: DeviceInfo = {
  model: 'iPhone 12 128GB Black',
  imei: '987654321098765',
  serialNumber: 'F2XYZ789',
  warrantyStatus: 'Coverage Expired',
  iCloudLock: 'ON',
  iCloudStatus: 'Lost/Stolen',
  gsmaBlacklistStatus: 'BLACKLISTED',
  simLockStatus: 'Unlocked'
};

// Mock service
export class MockSICKWService {
  async lookupIMEI(imei: string): Promise<DeviceInfo | null> {
    if (imei === '123456789012345') return mockDeviceClean;
    if (imei === '987654321098765') return mockDeviceBlacklisted;
    return null;
  }
}
```

## Troubleshooting

### Issue: "API key not configured"
**Solution**: Call `sickwAPI.setApiKey('your-key')` before lookups

### Issue: Empty or missing fields
**Solution**: Check `rawResult` property to see raw HTML response

### Issue: Incorrect parsing
**Solution**:
1. Add console.log for `device.rawResult`
2. Add sample to `/src/services/__tests__/fixtures/sickw-samples.ts`
3. Create test case
4. Update parser if needed

### Issue: Network errors
**Solution**:
1. Verify internet connection
2. Check SICKW API status
3. Verify API key is valid
4. Check for rate limiting

## Additional Resources

- [SICKW API Documentation](https://sickw.com/api-docs)
- [Parser Technical Documentation](./SICKW_PARSER_README.md)
- [Test Fixtures](../src/services/__tests__/fixtures/sickw-samples.ts)

---

**Last Updated**: 2025-11-20
**Version**: 1.0.0
