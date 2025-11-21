# SICKW API HTML Parser - Technical Documentation

## Overview

The SICKW API returns device information (iPhone/Android) as HTML-formatted strings. The `parseResultEnhanced` method extracts all fields dynamically and returns clean, typed data.

## Architecture

### Core Components

1. **`parseResultEnhanced(htmlResult: string, imei: string): DeviceInfo`**
   - Main parsing method
   - Extracts ALL fields from HTML response
   - Returns typed `DeviceInfo` object

2. **Helper Functions**
   - `cleanValue(value: string): string` - Removes HTML tags and entities
   - `extractField(patterns: string[]): string | undefined` - Extracts field with pattern matching
   - `extractGSMA(patterns: string[]): string | undefined` - Specialized GSMA section extractor

## Parsing Strategy

### 1. Pattern Matching
The parser uses flexible regex patterns to handle field name variations:

```typescript
// Example: "Warranty Status" vs "Status"
extractField(['Warranty Status', 'Status']);
```

### 2. HTML Cleaning
Removes all HTML artifacts:
- Tags: `<font>`, `<br>`, `<span>`, `<b>`, etc.
- Entities: `&nbsp;`, `&amp;`, `&lt;`, `&gt;`, `&quot;`
- Preserves original text case and spacing

### 3. Section Handling
Special handling for GSMA Report section:
```typescript
const gsmaSection = htmlResult.match(/<b>GSMA Report<\/b>:(.+?)(?:<br><br>|$)/is);
```

## Extracted Fields

### Basic Info
- `model` - Device model name
- `modelDescription` - Technical model description

### Identifiers
- `imei` - Primary IMEI
- `imei2` - Secondary IMEI (dual SIM devices)
- `meid` - MEID identifier
- `serialNumber` - Device serial number

### Warranty & Coverage
- `warrantyStatus` - Overall warranty status
- `repairsAndServiceCoverage` - Service coverage status
- `repairsAndServiceExpired` - Time since expiration
- `repairsAndServiceExpirationDate` - Expiration date
- `estimatedPurchaseDate` - Purchase date
- `telephoneTechnicalSupport` - Support status

### Device Status
- `iCloudLock` - iCloud activation lock status
- `iCloudStatus` - iCloud account status
- `activationStatus` - Device activation status
- `registrationStatus` - Apple registration status

### Carrier & Lock
- `lockedCarrier` - Carrier lock information
- `simLockStatus` - SIM lock status

### Device Characteristics
- `demoUnit` - Demo device flag
- `loanerDevice` - Loaner device flag
- `replacedDevice` - Replaced device flag
- `replacementDevice` - Replacement device flag
- `refurbishedDevice` - Refurbished device flag

### GSMA Report
- `gsmaBlacklistStatus` - Blacklist status (CLEAN/BLACKLISTED)
- `gsmaModelName` - Model name from GSMA
- `gsmaModelNumber` - Model number from GSMA
- `gsmaManufacturer` - Manufacturer from GSMA

### Other
- `appleCareEligible` - AppleCare eligibility
- `validPurchaseDate` - Purchase date validity
- `rawResult` - Original HTML (for debugging)

## Field Name Variations

The parser handles multiple variations of field names:

| Canonical Name | Variations |
|----------------|-----------|
| Model | Model, Model Name |
| Repairs and Service Coverage | Repairs and Service Coverage, Service Coverage |
| Estimated Purchase Date | Estimated Purchase Date, Purchase Date |
| Telephone Technical Support | Telephone Technical Support, Technical Support |
| Sim-Lock Status | Sim-Lock Status, SIM Lock Status, Lock Status |

## Color Coding

The API uses color coding to indicate status:
- `<font color="green">` - Positive status (Active, Clean, No, Unlocked)
- `<font color="red">` - Negative status (Expired, ON, Yes, Locked)
- Parser **removes color tags** but **preserves text content**

## Example Input/Output

### Input (Raw HTML)
```html
Model: iPhone 12 Pro Max 256GB Silver [A2342]<br>
IMEI: 352117355388857<br>
Warranty Status: <font color="red">Coverage Expired</font><br>
iCloud Lock: <font color="red">ON</font><br>
<br><b>GSMA Report</b>:<br>
Blacklist Status: <span style="COLOR:GREEN;">CLEAN</SPAN><br>
```

### Output (Parsed DeviceInfo)
```typescript
{
  model: "iPhone 12 Pro Max 256GB Silver [A2342]",
  imei: "352117355388857",
  warrantyStatus: "Coverage Expired",
  iCloudLock: "ON",
  gsmaBlacklistStatus: "CLEAN",
  rawResult: "..." // Original HTML
}
```

## Error Handling

### Missing Fields
- Fields not found in HTML return `undefined`
- No errors thrown for missing optional fields

### Malformed HTML
- Parser attempts to extract what it can
- Invalid tags are stripped
- Partial data is returned

### Empty Input
- Returns minimal `DeviceInfo` with provided IMEI
- `rawResult` contains empty string

## Testing

### Unit Tests
Located in: `/src/services/__tests__/sickw-api.test.ts`

Run tests:
```bash
npm test src/services/__tests__/sickw-api.test.ts
```

### Test Fixtures
Located in: `/src/services/__tests__/fixtures/sickw-samples.ts`

Add new samples as you encounter different formats:
```typescript
export const SAMPLE_NEW_FORMAT = `raw HTML from SICKW API`;
```

### Test Coverage
- Full iPhone 12 Pro Max example (all fields)
- Android device example
- Blacklisted device example
- Minimal data example
- Field name variations
- HTML entity handling
- Missing fields handling
- Malformed HTML handling

## Maintenance & Extension

### Adding New Fields

1. **Update Interface** (`DeviceInfo`):
   ```typescript
   export interface DeviceInfo {
     // ... existing fields
     newField?: string;
   }
   ```

2. **Add Extraction** (`parseResultEnhanced`):
   ```typescript
   info.newField = extractField(['New Field Name', 'Alternate Name']);
   ```

3. **Add Test** (`sickw-api.test.ts`):
   ```typescript
   expect(result.newField).toBe('Expected Value');
   ```

### Handling New Formats

1. Capture raw HTML response
2. Add to test fixtures (`sickw-samples.ts`)
3. Create failing test
4. Update parser logic
5. Verify test passes

### Performance Considerations

- Regex compilation is done per extraction
- For high-volume scenarios, consider caching compiled regexes
- Current implementation prioritizes **correctness** over speed

## Debugging

### Enable Detailed Logging

Add to `parseResultEnhanced`:
```typescript
console.log('Raw HTML:', htmlResult);
console.log('Parsed fields:', JSON.stringify(info, null, 2));
```

### Inspect Raw Results

Access via `DeviceInfo.rawResult`:
```typescript
const deviceInfo = await sickwAPI.lookupIMEI(imei);
console.log('Raw HTML:', deviceInfo.rawResult);
```

### Common Issues

1. **Field not extracting**: Check field name spelling and variations
2. **Partial text**: Verify HTML tag structure
3. **Wrong section**: Ensure not pulling from GSMA when should be main, or vice versa

## API Response Formats

### Standard Format
```
Field Name: Value<br>
Field Name: <font color="...">Value</font><br>
```

### GSMA Section Format
```
<br><b>GSMA Report</b>:<br>
Field Name: Value<br>
Field Name: <span style="COLOR:...">Value</span><br>
```

## Future Enhancements

1. **Performance Optimization**
   - Pre-compile regex patterns
   - Cache parsing results

2. **Enhanced Validation**
   - Type validation (dates, numbers)
   - Range validation (IMEI length, etc.)

3. **Field Normalization**
   - Standardize date formats
   - Normalize boolean values (Yes/No → true/false)

4. **AI-Assisted Parsing**
   - Use LLM for ambiguous fields
   - Handle completely new formats automatically

## Contact & Support

For issues or questions:
- File issue in repository
- Include raw HTML sample (anonymized)
- Include expected vs actual output

---

**Last Updated**: 2025-11-20
**Version**: 1.0.0
