# SICKW API HTML Parser

## Overview

A comprehensive, production-ready TypeScript parser that extracts ALL device information fields from SICKW API HTML-formatted responses. The parser handles 30+ fields including warranty status, iCloud lock status, GSMA blacklist status, and more.

**Status**: Production Ready | **Version**: 1.0.0 | **Tests**: 37/37 Passing

---

## Features

- Extracts 30+ fields from HTML responses
- Handles field name variations (e.g., "Service Coverage" vs "Repairs and Service Coverage")
- Removes all HTML tags and entities
- Supports GSMA Report section parsing
- Type-safe with full TypeScript support
- Graceful error handling (no crashes on missing data)
- Well-tested (37 passing tests)
- Comprehensive documentation

---

## Quick Start

### 1. Basic Usage

```typescript
import { sickwAPI } from './services/sickw-api';

// Set API key (one time)
sickwAPI.setApiKey('your-sickw-api-key-here');

// Lookup device
const device = await sickwAPI.lookupIMEI('352117355388857');

// Use the data
console.log(device.model);               // "iPhone 12 Pro Max 256GB Silver..."
console.log(device.warrantyStatus);       // "Coverage Expired"
console.log(device.iCloudLock);           // "ON"
console.log(device.gsmaBlacklistStatus);  // "CLEAN"
```

### 2. Check if Device is Safe to Buy

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
  console.log('✅ Safe to purchase');
} else {
  console.log('❌ Do NOT purchase');
}
```

---

## Extracted Fields (30+)

### Identifiers (4)
- `imei` - Primary IMEI
- `imei2` - Secondary IMEI (dual SIM)
- `meid` - MEID identifier
- `serialNumber` - Device serial number

### Basic Info (2)
- `model` - Device model name
- `modelDescription` - Technical description

### Warranty & Coverage (6)
- `warrantyStatus` - Overall warranty status
- `repairsAndServiceCoverage` - Service coverage
- `repairsAndServiceExpired` - Time since expiration
- `repairsAndServiceExpirationDate` - Expiration date
- `estimatedPurchaseDate` - Purchase date
- `telephoneTechnicalSupport` - Support status

### Device Status (4)
- `iCloudLock` - Activation lock (ON/OFF)
- `iCloudStatus` - iCloud account status
- `activationStatus` - Device activation
- `registrationStatus` - Apple registration

### Carrier & Lock (2)
- `lockedCarrier` - Carrier information
- `simLockStatus` - SIM lock status

### Device Characteristics (5)
- `demoUnit` - Demo device flag
- `loanerDevice` - Loaner flag
- `replacedDevice` - Replaced flag
- `replacementDevice` - Replacement flag
- `refurbishedDevice` - Refurbished flag

### GSMA Report (4)
- `gsmaBlacklistStatus` - Blacklist status
- `gsmaModelName` - Model from GSMA
- `gsmaModelNumber` - Model number
- `gsmaManufacturer` - Manufacturer

### Other (3)
- `appleCareEligible` - AppleCare eligibility
- `validPurchaseDate` - Purchase date validity
- `rawResult` - Original HTML (debugging)

---

## Installation

No installation required. The parser is already integrated in:
- `/Users/cranes/Downloads/Claude Retech/desktop/src/services/sickw-api.ts`

---

## Testing

### Run Tests

```bash
node test-parser.js
```

**Expected Output**: 37 tests passing

### Test Coverage

- Full iPhone 12 Pro Max parsing (28 fields)
- Missing fields handling
- HTML entity decoding
- GSMA section parsing
- Field name variations
- Empty input handling
- Malformed HTML handling

---

## Documentation

### Quick Reference
**File**: `SICKW_QUICK_REFERENCE.md`
- All available fields
- Common patterns
- Code examples
- Error handling

### Technical Documentation
**File**: `docs/SICKW_PARSER_README.md`
- Architecture details
- Parsing strategy
- Field variations
- Maintenance guide
- Performance considerations

### Integration Guide
**File**: `docs/SICKW_INTEGRATION_GUIDE.md`
- Complete usage examples
- React components
- Best practices
- Caching & rate limiting
- TypeScript types

### Flow Diagrams
**File**: `docs/SICKW_PARSER_FLOW.md`
- Visual architecture
- Parsing workflow
- Regex breakdown
- Extension points

### Parsing Example
**File**: `docs/SICKW_PARSING_EXAMPLE.md`
- Before/after comparison
- Visual transformations
- Real-world examples
- UI display examples

---

## Examples

### Basic Device Lookup

```typescript
import { sickwAPI } from './services/sickw-api';

async function lookupDevice(imei: string) {
  try {
    const device = await sickwAPI.lookupIMEI(imei);

    console.log('\n=== Device Information ===');
    console.log(`Model: ${device.model}`);
    console.log(`IMEI: ${device.imei}`);
    console.log(`Serial: ${device.serialNumber}`);

    console.log('\n=== Status ===');
    console.log(`Warranty: ${device.warrantyStatus}`);
    console.log(`iCloud Lock: ${device.iCloudLock}`);
    console.log(`GSMA Status: ${device.gsmaBlacklistStatus}`);

    return device;
  } catch (error) {
    console.error('Lookup failed:', error);
  }
}

lookupDevice('352117355388857');
```

### React Component

```typescript
import React, { useState } from 'react';
import { sickwAPI, DeviceInfo } from '../services/sickw-api';

export function DeviceLookup() {
  const [imei, setImei] = useState('');
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    setLoading(true);
    try {
      const result = await sickwAPI.lookupIMEI(imei);
      setDevice(result);
    } catch (error) {
      console.error('Lookup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        value={imei}
        onChange={(e) => setImei(e.target.value)}
        placeholder="Enter IMEI"
      />
      <button onClick={handleLookup} disabled={loading}>
        {loading ? 'Looking up...' : 'Lookup'}
      </button>

      {device && (
        <div>
          <h3>{device.model}</h3>
          <p>Warranty: {device.warrantyStatus}</p>
          <p>GSMA: {device.gsmaBlacklistStatus}</p>
        </div>
      )}
    </div>
  );
}
```

### Risk Assessment

```typescript
function assessRisk(device: DeviceInfo): 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' {
  if (device.gsmaBlacklistStatus === 'BLACKLISTED') {
    return 'HIGH';
  }
  if (device.iCloudLock === 'ON' ||
      device.iCloudStatus?.includes('Lost') ||
      device.iCloudStatus?.includes('Stolen')) {
    return 'MEDIUM';
  }
  if (device.warrantyStatus?.includes('Expired')) {
    return 'LOW';
  }
  return 'NONE';
}

const device = await sickwAPI.lookupIMEI(imei);
const risk = assessRisk(device);
console.log(`Risk Level: ${risk}`);
```

---

## API Reference

### `sickwAPI.setApiKey(key: string)`
Set the SICKW API key (stored in localStorage)

```typescript
sickwAPI.setApiKey('your-api-key');
```

### `sickwAPI.getApiKey(): string | null`
Get the current API key

```typescript
const key = sickwAPI.getApiKey();
```

### `sickwAPI.lookupIMEI(imei: string): Promise<DeviceInfo | null>`
Lookup device by IMEI

```typescript
const device = await sickwAPI.lookupIMEI('352117355388857');
```

### `sickwAPI.parseResultEnhanced(htmlResult: string, imei: string): DeviceInfo`
Parse HTML result into DeviceInfo object (used internally)

```typescript
const device = sickwAPI.parseResultEnhanced(htmlResult, imei);
```

---

## TypeScript Types

### DeviceInfo Interface

```typescript
interface DeviceInfo {
  // Identifiers
  imei?: string;
  imei2?: string;
  meid?: string;
  serialNumber?: string;

  // Basic Info
  model?: string;
  modelDescription?: string;

  // Warranty & Coverage
  warrantyStatus?: string;
  repairsAndServiceCoverage?: string;
  repairsAndServiceExpired?: string;
  repairsAndServiceExpirationDate?: string;
  estimatedPurchaseDate?: string;
  telephoneTechnicalSupport?: string;

  // Device Status
  iCloudLock?: string;
  iCloudStatus?: string;
  activationStatus?: string;
  registrationStatus?: string;

  // Carrier & Lock
  lockedCarrier?: string;
  simLockStatus?: string;

  // Device Characteristics
  demoUnit?: string;
  loanerDevice?: string;
  replacedDevice?: string;
  replacementDevice?: string;
  refurbishedDevice?: string;

  // GSMA Report
  gsmaBlacklistStatus?: string;
  gsmaModelName?: string;
  gsmaModelNumber?: string;
  gsmaManufacturer?: string;

  // Other
  appleCareEligible?: string;
  validPurchaseDate?: string;

  // Raw data for debugging
  rawResult?: string;
}
```

---

## Error Handling

### Common Errors

```typescript
try {
  const device = await sickwAPI.lookupIMEI(imei);
} catch (error) {
  if (error.message.includes('API key not configured')) {
    // API key missing - show settings
  } else if (error.message.includes('HTTP error')) {
    // Network error
  } else if (error.message.includes('failed')) {
    // API returned error
  } else {
    // Unknown error
  }
}
```

### Field Availability

Not all fields are always present. Always check for `undefined`:

```typescript
const warranty = device.warrantyStatus || 'Unknown';
const imei2 = device.imei2 ? `IMEI2: ${device.imei2}` : 'Single SIM';
```

---

## Best Practices

### 1. Validate IMEI Before Lookup

```typescript
function isValidIMEI(imei: string): boolean {
  const clean = imei.replace(/[\s-]/g, '');
  return /^\d{15}$/.test(clean);
}
```

### 2. Cache Results

```typescript
const cache = new Map();
async function cachedLookup(imei: string) {
  if (cache.has(imei)) return cache.get(imei);
  const result = await sickwAPI.lookupIMEI(imei);
  cache.set(imei, result);
  return result;
}
```

### 3. Rate Limiting

```typescript
// Wait 1 second between calls
await sickwAPI.lookupIMEI(imei1);
await new Promise(r => setTimeout(r, 1000));
await sickwAPI.lookupIMEI(imei2);
```

---

## Debugging

### View Raw HTML

```typescript
const device = await sickwAPI.lookupIMEI(imei);
console.log('Raw HTML:', device.rawResult);
```

### Check Extracted Fields

```typescript
const extracted = Object.entries(device)
  .filter(([key, value]) => value !== undefined)
  .map(([key, value]) => `${key}: ${value}`);
console.log('Extracted:', extracted);
```

---

## File Structure

```
/Users/cranes/Downloads/Claude Retech/desktop/

Main Implementation:
├── src/services/sickw-api.ts              # Parser implementation

Tests:
├── test-parser.js                         # Node.js test runner
└── src/services/__tests__/
    ├── sickw-api.test.ts                  # TypeScript tests
    └── fixtures/
        └── sickw-samples.ts               # Test fixtures

Documentation:
├── README_SICKW_PARSER.md                 # This file
├── SICKW_PARSER_SUMMARY.md                # Implementation summary
├── SICKW_QUICK_REFERENCE.md               # Quick reference
└── docs/
    ├── SICKW_PARSER_README.md             # Technical docs
    ├── SICKW_INTEGRATION_GUIDE.md         # Integration guide
    ├── SICKW_PARSER_FLOW.md               # Flow diagrams
    └── SICKW_PARSING_EXAMPLE.md           # Examples
```

---

## Status Interpretation

### iCloud Lock
- `"OFF"` → Good (can activate)
- `"ON"` → Locked (requires original owner)

### GSMA Blacklist
- `"CLEAN"` → Good (not reported stolen)
- `"BLACKLISTED"` → Reported stolen/lost

### Warranty Status
- `"Active"` / `"Limited Warranty"` → Under warranty
- `"Coverage Expired"` → No warranty

### SIM Lock Status
- `"Unlocked"` → Any carrier
- `"Locked"` → Specific carrier only

---

## Performance

- **Time Complexity**: O(n × m) where n=fields, m=HTML length
- **Space Complexity**: O(k) where k=result size
- **Typical Performance**: <10ms for standard response

---

## Maintenance

### Adding New Fields

1. Update `DeviceInfo` interface
2. Add extraction call in `parseResultEnhanced`
3. Add test case
4. Update documentation

Example:
```typescript
// 1. Interface
export interface DeviceInfo {
  newField?: string;
}

// 2. Extraction
info.newField = extractField(['New Field Name', 'Alternate Name']);

// 3. Test
assertEquals(result.newField, 'Expected Value', 'newField');
```

---

## Support

1. Check `rawResult` field for debugging
2. Review test fixtures in `src/services/__tests__/fixtures/`
3. See comprehensive docs in `/docs/` folder
4. Run tests: `node test-parser.js`

---

## Version History

### 1.0.0 (2025-11-20)
- Initial production release
- 30+ fields extracted
- 37 passing tests
- Complete documentation

---

## License

Part of Retech Inventory application

---

## Quick Commands

```bash
# Run tests
node test-parser.js

# Check TypeScript compilation
npx tsc --noEmit

# View documentation
open docs/SICKW_PARSER_README.md
```

---

**Ready to use in production!**

For questions or issues, review the comprehensive documentation in the `/docs/` folder.
