# SICKW Parser - Before & After Example

## Real-World Example: iPhone 12 Pro Max

### Input (Raw HTML from SICKW API)

```html
Model Description: SVC,IPHONE 12PROMAX,NAMM,256GB,SLV,CI/AR<br>
Model: iPhone 12 Pro Max 256GB Silver [A2342] [iPhone13,4]<br>
IMEI: 352117355388857<br>
IMEI2: 352117355401734<br>
MEID: 35211735538885<br>
Serial Number: HH6JY03S0D44<br>
Telephone Technical Support: <font color="red">Expired</font><br>
Repairs and Service Coverage: <font color="red">Expired</font><br>
Repairs and Service Expired By: 2 Years, 5 Months and 25 Days<br>
Repairs and Service Expiration Date: 2023-02-11<br>
Estimated Purchase Date: 2023-02-11<br>
Warranty Status: <font color="red">Coverage Expired</font><br>
iCloud Lock: <font color="red">ON</font><br>
iCloud Status: <font color="green">Clean</font><br>
Demo Unit: <font color="green">No</font><br>
Loaner Device: <font color="green">No</font><br>
Replaced Device: <font color="green">No</font><br>
Replacement Device: <font color="red">Yes</font><br>
Refurbished Device: <font color="green">No</font><br>
AppleCare Eligible: <font color="red">No</font><br>
Valid Purchase Date: <font color="green">Yes</font><br>
Activation Status: <font color="green">Activated</font><br>
Registration Status: <font color="green">Registered</font><br>
Locked Carrier: 10 - Unlock.<br>
Sim-Lock Status: <font color="green">Unlocked</font><br>
<br>
<b>GSMA Report</b>:<br>
IMEI: 352117355388857<br>
Model Name: Apple iPhone 12 Pro Max (A2342)<br>
Model Number: iPhone 12 Pro Max (A2342)<br>
Manufacturer: Apple Inc<br>
Blacklist Status: <span style="COLOR:GREEN;">CLEAN</SPAN><br>
General List Status: No<br>
```

### Output (Parsed DeviceInfo Object)

```typescript
{
  // Basic Info
  model: "iPhone 12 Pro Max 256GB Silver [A2342] [iPhone13,4]",
  modelDescription: "SVC,IPHONE 12PROMAX,NAMM,256GB,SLV,CI/AR",

  // Identifiers
  imei: "352117355388857",
  imei2: "352117355401734",
  meid: "35211735538885",
  serialNumber: "HH6JY03S0D44",

  // Warranty & Coverage
  warrantyStatus: "Coverage Expired",
  repairsAndServiceCoverage: "Expired",
  repairsAndServiceExpired: "2 Years, 5 Months and 25 Days",
  repairsAndServiceExpirationDate: "2023-02-11",
  estimatedPurchaseDate: "2023-02-11",
  telephoneTechnicalSupport: "Expired",

  // Device Status
  iCloudLock: "ON",
  iCloudStatus: "Clean",
  activationStatus: "Activated",
  registrationStatus: "Registered",

  // Carrier & Lock
  lockedCarrier: "10 - Unlock.",
  simLockStatus: "Unlocked",

  // Device Characteristics
  demoUnit: "No",
  loanerDevice: "No",
  replacedDevice: "No",
  replacementDevice: "Yes",
  refurbishedDevice: "No",

  // Other
  appleCareEligible: "No",
  validPurchaseDate: "Yes",

  // GSMA Report
  gsmaBlacklistStatus: "CLEAN",
  gsmaModelName: "Apple iPhone 12 Pro Max (A2342)",
  gsmaModelNumber: "iPhone 12 Pro Max (A2342)",
  gsmaManufacturer: "Apple Inc",

  // Raw data (for debugging)
  rawResult: "..." // Original HTML string
}
```

### Visual Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│ RAW HTML INPUT                                                  │
├─────────────────────────────────────────────────────────────────┤
│ Model: iPhone 12 Pro Max...<br>                                 │
│ IMEI: 352117355388857<br>                                       │
│ Warranty Status: <font color="red">Coverage Expired</font><br> │
│ iCloud Lock: <font color="red">ON</font><br>                   │
│ ...                                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ parseResultEnhanced()
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PARSED OBJECT (DeviceInfo)                                      │
├─────────────────────────────────────────────────────────────────┤
│ {                                                               │
│   model: "iPhone 12 Pro Max...",                                │
│   imei: "352117355388857",                                      │
│   warrantyStatus: "Coverage Expired",  ← HTML tags removed      │
│   iCloudLock: "ON",                    ← HTML tags removed      │
│   ...                                                           │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Transformation Details

### 1. HTML Tag Removal

**Before:**
```html
Warranty Status: <font color="red">Coverage Expired</font><br>
```

**After:**
```typescript
warrantyStatus: "Coverage Expired"
```

### 2. HTML Entity Decoding

**Before:**
```html
Model: iPhone&nbsp;15<br>
Description: Active&amp;Valid<br>
```

**After:**
```typescript
model: "iPhone 15"           // &nbsp; → space
description: "Active&Valid"   // &amp; → &
```

### 3. Section Isolation (GSMA)

**Before:**
```html
IMEI: 352117355388857<br>
<br><b>GSMA Report</b>:<br>
IMEI: 352117355388857<br>
Blacklist Status: <span style="COLOR:GREEN;">CLEAN</SPAN><br>
```

**After:**
```typescript
imei: "352117355388857"              // From main section
gsmaBlacklistStatus: "CLEAN"         // From GSMA section only
```

### 4. Field Name Normalization

**Input Variation 1:**
```html
Repairs and Service Coverage: Expired<br>
```

**Input Variation 2:**
```html
Service Coverage: Expired<br>
```

**Output (same for both):**
```typescript
repairsAndServiceCoverage: "Expired"
```

## UI Display Example

### Raw HTML (Unusable in UI)
```
Model: iPhone 12 Pro Max 256GB Silver [A2342] [iPhone13,4]<br>IMEI: 352117355388857<br>Warranty Status: <font color="red">Coverage Expired</font><br>...
```

### Parsed Data (UI-Ready)

```
┌──────────────────────────────────────────────────────┐
│ Device Information                                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Model:                                               │
│   iPhone 12 Pro Max 256GB Silver [A2342]             │
│                                                      │
│ IMEI: 352117355388857                                │
│ IMEI2: 352117355401734                               │
│ Serial: HH6JY03S0D44                                 │
│                                                      │
│ ┌────────────────────────────────────────────────┐   │
│ │ Warranty Status                                │   │
│ │                                                │   │
│ │ Status: Coverage Expired ⚠️                    │   │
│ │ Expired: 2023-02-11                            │   │
│ │ Service: Expired                               │   │
│ └────────────────────────────────────────────────┘   │
│                                                      │
│ ┌────────────────────────────────────────────────┐   │
│ │ iCloud & Activation                            │   │
│ │                                                │   │
│ │ iCloud Lock: ON 🔒                             │   │
│ │ iCloud Status: Clean ✅                        │   │
│ │ Activation: Activated ✅                       │   │
│ └────────────────────────────────────────────────┘   │
│                                                      │
│ ┌────────────────────────────────────────────────┐   │
│ │ GSMA Blacklist Report                          │   │
│ │                                                │   │
│ │ Status: CLEAN ✅                               │   │
│ │ Manufacturer: Apple Inc                        │   │
│ └────────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Usage in Code

```typescript
// Step 1: Get raw HTML from API
const apiResponse = await fetch('https://sickw.com/api.php?...');
const data = await apiResponse.json();
const htmlResult = data.result;

// Step 2: Parse HTML
const device = sickwAPI.parseResultEnhanced(htmlResult, imei);

// Step 3: Use parsed data
console.log(`Model: ${device.model}`);
console.log(`Warranty: ${device.warrantyStatus}`);
console.log(`GSMA: ${device.gsmaBlacklistStatus}`);

// Step 4: Display in UI
return (
  <div>
    <h2>{device.model}</h2>
    <p>IMEI: {device.imei}</p>
    <p>Warranty: {device.warrantyStatus}</p>
    <StatusBadge status={device.gsmaBlacklistStatus} />
  </div>
);
```

## Field Extraction Process

### Example: Warranty Status

```
Step 1: Raw HTML
"Warranty Status: <font color="red">Coverage Expired</font><br>"

Step 2: Regex Match
Pattern: /Warranty Status:\s*([^<]*(?:<[^>]+>[^<]*<\/[^>]+>)?[^<]*)(?:<br|$)/i
Match: "Warranty Status: <font color="red">Coverage Expired</font><br>"
Captured: "<font color="red">Coverage Expired</font>"

Step 3: Clean HTML Tags
Input: "<font color="red">Coverage Expired</font>"
Remove: <font color="red"> and </font>
Output: "Coverage Expired"

Step 4: Assign to Object
info.warrantyStatus = "Coverage Expired"
```

## Color Coding Interpretation

The API uses color coding, which we remove but can interpret:

### Red (Negative)
```html
<font color="red">Expired</font>        → "Expired"
<font color="red">ON</font>             → "ON" (iCloud locked)
<font color="red">Coverage Expired</font> → "Coverage Expired"
```

### Green (Positive)
```html
<font color="green">Active</font>       → "Active"
<font color="green">Clean</font>        → "Clean"
<font color="green">Unlocked</font>     → "Unlocked"
```

### Status Badge Mapping (for UI)
```typescript
function getStatusColor(field, value) {
  if (field === 'gsmaBlacklistStatus') {
    return value === 'CLEAN' ? 'green' : 'red';
  }
  if (field === 'iCloudLock') {
    return value === 'OFF' ? 'green' : 'red';
  }
  if (field === 'warrantyStatus') {
    return value.includes('Active') ? 'green' : 'orange';
  }
  return 'gray';
}
```

## Complete Code Example

```typescript
import { sickwAPI } from './services/sickw-api';

async function displayDeviceInfo(imei: string) {
  // Lookup device
  const device = await sickwAPI.lookupIMEI(imei);

  // Display basic info
  console.log('\n=== DEVICE INFORMATION ===');
  console.log(`Model: ${device.model}`);
  console.log(`Serial: ${device.serialNumber}`);
  console.log(`IMEI: ${device.imei}`);

  // Display warranty
  console.log('\n=== WARRANTY ===');
  console.log(`Status: ${device.warrantyStatus}`);
  console.log(`Expiration: ${device.repairsAndServiceExpirationDate}`);

  // Display security status
  console.log('\n=== SECURITY ===');
  console.log(`iCloud Lock: ${device.iCloudLock}`);
  console.log(`Blacklist: ${device.gsmaBlacklistStatus}`);

  // Check if safe to buy
  const isSafe = (
    device.gsmaBlacklistStatus === 'CLEAN' &&
    device.iCloudLock === 'OFF'
  );

  console.log('\n=== RECOMMENDATION ===');
  console.log(isSafe ? '✅ Safe to purchase' : '❌ Do NOT purchase');

  return device;
}

// Usage
displayDeviceInfo('352117355388857');
```

## Output

```
=== DEVICE INFORMATION ===
Model: iPhone 12 Pro Max 256GB Silver [A2342] [iPhone13,4]
Serial: HH6JY03S0D44
IMEI: 352117355388857

=== WARRANTY ===
Status: Coverage Expired
Expiration: 2023-02-11

=== SECURITY ===
iCloud Lock: ON
Blacklist: CLEAN

=== RECOMMENDATION ===
❌ Do NOT purchase
```

---

**Key Takeaway**: The parser transforms messy HTML into clean, structured data that's ready to use in your application.

**Files**:
- Implementation: `/Users/cranes/Downloads/Claude Retech/desktop/src/services/sickw-api.ts`
- Test: `/Users/cranes/Downloads/Claude Retech/desktop/test-parser.js`

**Run Tests**: `node test-parser.js`
