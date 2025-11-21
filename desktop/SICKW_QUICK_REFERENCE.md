# SICKW Parser Quick Reference

## Installation
No installation required - parser is built into `/src/services/sickw-api.ts`

## Basic Usage

```typescript
import { sickwAPI } from './services/sickw-api';

// 1. Set API key (one time)
sickwAPI.setApiKey('your-api-key-here');

// 2. Lookup device
const device = await sickwAPI.lookupIMEI('352117355388857');

// 3. Use the data
console.log(device.model);
console.log(device.warrantyStatus);
console.log(device.gsmaBlacklistStatus);
```

## Available Fields

### Identifiers
```typescript
device.imei              // "352117355388857"
device.imei2             // "352117355401734"
device.meid              // "35211735538885"
device.serialNumber      // "HH6JY03S0D44"
```

### Basic Info
```typescript
device.model             // "iPhone 12 Pro Max 256GB Silver..."
device.modelDescription  // "SVC,IPHONE 12PROMAX,NAMM,256GB,SLV..."
```

### Status Checks
```typescript
device.warrantyStatus          // "Coverage Expired" | "Active"
device.iCloudLock              // "ON" | "OFF"
device.iCloudStatus            // "Clean" | "Lost/Stolen"
device.gsmaBlacklistStatus     // "CLEAN" | "BLACKLISTED"
device.simLockStatus           // "Unlocked" | "Locked"
device.activationStatus        // "Activated" | "Not Activated"
```

### Dates
```typescript
device.estimatedPurchaseDate           // "2023-02-11"
device.repairsAndServiceExpirationDate // "2023-02-11"
```

### Device Flags
```typescript
device.demoUnit              // "Yes" | "No"
device.replacementDevice     // "Yes" | "No"
device.refurbishedDevice     // "Yes" | "No"
device.loanerDevice          // "Yes" | "No"
device.replacedDevice        // "Yes" | "No"
```

### Carrier
```typescript
device.lockedCarrier    // "10 - Unlock." | "AT&T - USA"
device.simLockStatus    // "Unlocked" | "Locked"
```

### GSMA Report
```typescript
device.gsmaBlacklistStatus  // "CLEAN" | "BLACKLISTED"
device.gsmaManufacturer     // "Apple Inc"
device.gsmaModelName        // "Apple iPhone 12 Pro Max (A2342)"
device.gsmaModelNumber      // "iPhone 12 Pro Max (A2342)"
```

## Common Patterns

### Check if Device is Safe to Buy
```typescript
function isSafeToBuy(device) {
  return (
    device.gsmaBlacklistStatus === 'CLEAN' &&
    device.iCloudLock === 'OFF' &&
    !device.iCloudStatus?.includes('Lost') &&
    !device.iCloudStatus?.includes('Stolen')
  );
}

const device = await sickwAPI.lookupIMEI(imei);
if (isSafeToBuy(device)) {
  console.log('Safe to purchase');
} else {
  console.log('RED FLAG - Do not purchase');
}
```

### Display Risk Level
```typescript
function getRiskLevel(device) {
  if (device.gsmaBlacklistStatus === 'BLACKLISTED') {
    return 'HIGH';
  }
  if (device.iCloudLock === 'ON') {
    return 'MEDIUM';
  }
  if (device.warrantyStatus?.includes('Expired')) {
    return 'LOW';
  }
  return 'NONE';
}
```

### Check Warranty Status
```typescript
function isUnderWarranty(device) {
  const status = device.warrantyStatus?.toLowerCase();
  return status?.includes('active') || status?.includes('limited');
}
```

### Validate IMEI Before Lookup
```typescript
function isValidIMEI(imei) {
  const clean = imei.replace(/[\s-]/g, '');
  return /^\d{15}$/.test(clean);
}

if (isValidIMEI(imei)) {
  const device = await sickwAPI.lookupIMEI(imei);
}
```

## Error Handling

```typescript
try {
  const device = await sickwAPI.lookupIMEI(imei);
} catch (error) {
  if (error.message.includes('API key not configured')) {
    // Show settings dialog
  } else if (error.message.includes('HTTP error')) {
    // Network error
  } else {
    // Other error
  }
}
```

## Testing

```bash
# Run built-in tests
node test-parser.js

# Expected output: 37 tests passed
```

## Field Availability

Not all fields are always present. Check for `undefined`:

```typescript
const warranty = device.warrantyStatus || 'Unknown';
const imei2 = device.imei2 ? `IMEI2: ${device.imei2}` : 'Single SIM';
```

## TypeScript Types

```typescript
import { DeviceInfo } from './services/sickw-api';

const device: DeviceInfo = await sickwAPI.lookupIMEI(imei);

// All fields are optional (except imei)
device.model?           // string | undefined
device.warrantyStatus?  // string | undefined
```

## React Hook Example

```typescript
function useDeviceLookup() {
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (imei: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await sickwAPI.lookupIMEI(imei);
      setDevice(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  return { device, loading, error, lookup };
}

// Usage
const { device, loading, lookup } = useDeviceLookup();
await lookup('352117355388857');
```

## Debugging

### View Raw HTML
```typescript
const device = await sickwAPI.lookupIMEI(imei);
console.log('Raw HTML:', device.rawResult);
```

### Check What Fields Were Extracted
```typescript
const device = await sickwAPI.lookupIMEI(imei);
const extracted = Object.entries(device)
  .filter(([key, value]) => value !== undefined && key !== 'rawResult')
  .map(([key, value]) => `${key}: ${value}`);
console.log('Extracted fields:', extracted);
```

## Status Interpretation

### iCloud Lock
- `"OFF"` = Good (can activate)
- `"ON"` = Locked (requires original owner)

### GSMA Blacklist
- `"CLEAN"` = Good (not reported)
- `"BLACKLISTED"` = Reported stolen/lost

### Warranty Status
- `"Active"` / `"Limited Warranty"` = Under warranty
- `"Coverage Expired"` = No warranty
- `"Expired"` = No coverage

### SIM Lock
- `"Unlocked"` = Any carrier
- `"Locked"` = Specific carrier only

## Performance Tips

### Cache Results
```typescript
const cache = new Map();
async function cachedLookup(imei) {
  if (cache.has(imei)) return cache.get(imei);
  const result = await sickwAPI.lookupIMEI(imei);
  cache.set(imei, result);
  return result;
}
```

### Rate Limiting
```typescript
// Wait 1 second between calls
await sickwAPI.lookupIMEI(imei1);
await new Promise(r => setTimeout(r, 1000));
await sickwAPI.lookupIMEI(imei2);
```

## File Locations

```
/Users/cranes/Downloads/Claude Retech/desktop/

Implementation:
  src/services/sickw-api.ts

Tests:
  test-parser.js                          (Node.js test)
  src/services/__tests__/sickw-api.test.ts (TypeScript test)

Docs:
  SICKW_PARSER_SUMMARY.md        (Overview)
  docs/SICKW_PARSER_README.md    (Technical)
  docs/SICKW_INTEGRATION_GUIDE.md (Integration)
  docs/SICKW_PARSER_FLOW.md      (Diagrams)
```

## Support

1. Check `rawResult` field for debugging
2. Review test fixtures in `src/services/__tests__/fixtures/sickw-samples.ts`
3. See full documentation in `/docs/` folder

## Version

- **Version**: 1.0.0
- **Last Updated**: 2025-11-20
- **Status**: Production Ready
- **Test Coverage**: 37/37 tests passing

---

**Quick Command**: `node test-parser.js` - Run all tests
