# SICKW Parser Flow Diagram

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     SICKW API Response                        │
│  (HTML-formatted string with device information)              │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│              parseResultEnhanced(htmlResult, imei)            │
│  • Main parsing entry point                                   │
│  • Creates DeviceInfo object                                  │
│  • Coordinates extraction helpers                             │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ├─────────────┬──────────────┬──────────────┐
                   │             │              │              │
                   ▼             ▼              ▼              ▼
         ┌─────────────┐ ┌──────────┐ ┌────────────┐ ┌───────────┐
         │ cleanValue  │ │extractField│ │extractGSMA │ │  Pattern  │
         │             │ │            │ │            │ │  Matching │
         │ • Remove    │ │ • Regex    │ │ • GSMA     │ │           │
         │   HTML tags │ │   matching │ │   section  │ │ • Multiple│
         │ • Decode    │ │ • Multiple │ │   parsing  │ │   field   │
         │   entities  │ │   patterns │ │            │ │   aliases │
         │ • Trim      │ │            │ │            │ │           │
         └─────────────┘ └──────────┘ └────────────┘ └───────────┘
                   │             │              │              │
                   └─────────────┴──────────────┴──────────────┘
                                  │
                                  ▼
                   ┌──────────────────────────────┐
                   │      DeviceInfo Object       │
                   │  • All fields extracted      │
                   │  • Clean, typed data         │
                   │  • Raw HTML preserved        │
                   └──────────────────────────────┘
```

## Parsing Workflow

```
HTML Input:
"Model: iPhone 12 Pro Max<br>IMEI: 352117355388857<br>Warranty Status: <font color="red">Expired</font><br>"

                           ↓

Step 1: Field Extraction (extractField)
┌─────────────────────────────────────────────────────────┐
│  Pattern: "Model(?! Description)"                       │
│  Regex: /Model(?! Description):\s*([^<]*...)/i         │
│  Match: "Model: iPhone 12 Pro Max<br>"                 │
│  Captured: "iPhone 12 Pro Max"                         │
└─────────────────────────────────────────────────────────┘
                           ↓

Step 2: Value Cleaning (cleanValue)
┌─────────────────────────────────────────────────────────┐
│  Input: "iPhone 12 Pro Max"                             │
│  • Remove tags: N/A (no tags in this capture)          │
│  • Decode entities: N/A                                 │
│  • Trim whitespace: "iPhone 12 Pro Max"                │
│  Output: "iPhone 12 Pro Max"                           │
└─────────────────────────────────────────────────────────┘
                           ↓

Step 3: Assignment
┌─────────────────────────────────────────────────────────┐
│  info.model = "iPhone 12 Pro Max"                       │
└─────────────────────────────────────────────────────────┘
```

## Example: Complex Field with HTML

```
HTML Input:
"Warranty Status: <font color="red">Expired</font><br>"

                           ↓

Step 1: Field Extraction
┌─────────────────────────────────────────────────────────┐
│  Pattern: "Warranty Status"                             │
│  Regex: /Warranty Status:\s*([^<]*(?:<[^>]+>...)/i     │
│  Match: "Warranty Status: <font color="red">Expired...  │
│  Captured: "<font color="red">Expired</font>"          │
└─────────────────────────────────────────────────────────┘
                           ↓

Step 2: Value Cleaning
┌─────────────────────────────────────────────────────────┐
│  Input: "<font color="red">Expired</font>"              │
│  • Remove <font> tag: "Expired</font>"                  │
│  • Remove </font> tag: "Expired"                        │
│  • Trim: "Expired"                                      │
│  Output: "Expired"                                      │
└─────────────────────────────────────────────────────────┘
                           ↓

Step 3: Assignment
┌─────────────────────────────────────────────────────────┐
│  info.warrantyStatus = "Expired"                        │
└─────────────────────────────────────────────────────────┘
```

## GSMA Section Parsing

```
HTML Input:
"<br><b>GSMA Report</b>:<br>IMEI: 352117355388857<br>Blacklist Status: <span style="COLOR:GREEN;">CLEAN</span><br><br>"

                           ↓

Step 1: Section Extraction
┌─────────────────────────────────────────────────────────┐
│  Regex: /<b>GSMA Report<\/b>:(.+?)(?:<br><br>|$)/is   │
│  Match: Entire GSMA section                             │
│  Captured: "IMEI: 352117355388857<br>Blacklist..."     │
└─────────────────────────────────────────────────────────┘
                           ↓

Step 2: Field Extraction (extractGSMA)
┌─────────────────────────────────────────────────────────┐
│  Pattern: "Blacklist Status"                            │
│  Search within: GSMA section only                       │
│  Match: "Blacklist Status: <span...>CLEAN</span>"      │
│  Captured: "<span style="COLOR:GREEN;">CLEAN</span>"   │
└─────────────────────────────────────────────────────────┘
                           ↓

Step 3: Value Cleaning
┌─────────────────────────────────────────────────────────┐
│  Input: "<span style="COLOR:GREEN;">CLEAN</span>"       │
│  • Remove <span> tag: "CLEAN</span>"                    │
│  • Remove </span> tag: "CLEAN"                          │
│  • Trim: "CLEAN"                                        │
│  Output: "CLEAN"                                        │
└─────────────────────────────────────────────────────────┘
                           ↓

Step 4: Assignment
┌─────────────────────────────────────────────────────────┐
│  info.gsmaBlacklistStatus = "CLEAN"                     │
└─────────────────────────────────────────────────────────┘
```

## Pattern Matching Strategy

### Field Name Aliases

```
Canonical Field: "Repairs and Service Coverage"

Patterns Tried (in order):
1. "Repairs and Service Coverage"    ← Exact match
2. "Service Coverage"                 ← Short alias
3. (stops if match found)

Example HTML variations handled:
✓ "Repairs and Service Coverage: Expired<br>"
✓ "Service Coverage: Active<br>"
✓ "REPAIRS AND SERVICE COVERAGE: Expired<br>"  (case-insensitive)
```

### Negative Lookahead for Disambiguation

```
Problem: Distinguishing "Model" from "Model Description"

Solution: Negative lookahead
Pattern: "Model(?! Description)"

Examples:
✓ "Model: iPhone 13<br>"              → Matches (no "Description" after)
✗ "Model Description: SVC,IPHONE..."  → Skips (has "Description" after)
```

### Handling Multiple Formats

```
Field: IMEI

Formats handled:
1. "IMEI: 352117355388857<br>"
2. "IMEI: <span>352117355388857</span><br>"
3. "IMEI:352117355388857<br>"  (no space after colon)
4. "imei: 352117355388857<br>"  (lowercase)

Regex: /IMEI(?!2):\s*([^<]*(?:<[^>]+>[^<]*<\/[^>]+>)?[^<]*)(?:<br|$)/i
       ├────┬────┘ │  └──────────────┬──────────────────────┘
       │    │      │                 └─ Optional HTML tags
       │    │      └─ Optional whitespace
       │    └─ Negative lookahead (not IMEI2)
       └─ Case-insensitive flag
```

## Data Flow: Complete Example

```
Input:
Model: iPhone 12 Pro<br>
IMEI: 123456789012345<br>
Warranty Status: <font color="red">Expired</font><br>
iCloud Lock: <font color="green">OFF</font><br>
<br><b>GSMA Report</b>:<br>
Blacklist Status: <span style="COLOR:GREEN;">CLEAN</span><br>

                    ↓  parseResultEnhanced  ↓

Output (DeviceInfo):
{
  model: "iPhone 12 Pro",
  imei: "123456789012345",
  warrantyStatus: "Expired",
  iCloudLock: "OFF",
  gsmaBlacklistStatus: "CLEAN",
  rawResult: "..." // Original HTML
}
```

## Error Handling Flow

```
                ┌─────────────────┐
                │  Field Missing  │
                │   in HTML?      │
                └────────┬────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
           Yes                       No
            │                         │
            ▼                         ▼
  ┌──────────────────┐     ┌──────────────────┐
  │ Return undefined │     │  Extract Value   │
  │ (field optional) │     │  Clean & Return  │
  └──────────────────┘     └──────────────────┘
            │                         │
            └────────────┬────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  DeviceInfo Object  │
              │  (partial/complete) │
              └─────────────────────┘
```

## Performance Characteristics

```
Time Complexity: O(n × m)
  where n = number of fields to extract
        m = average HTML length

Space Complexity: O(k)
  where k = size of parsed result

Optimizations:
  • Lazy evaluation (stops at first match)
  • Single-pass HTML scanning per field
  • No global regex compilation (could be improved)
```

## Regex Breakdown

### Main Field Extraction Pattern

```
/Model(?! Description):\s*([^<]*(?:<[^>]+>[^<]*<\/[^>]+>)?[^<]*)(?:<br|$)/i

Breaking it down:

1. Model(?! Description)
   └─ Match "Model" but not if followed by " Description"

2. :
   └─ Literal colon separator

3. \s*
   └─ Optional whitespace after colon

4. ([^<]*(?:<[^>]+>[^<]*<\/[^>]+>)?[^<]*)
   └─ Capture group:
      • [^<]*            - Text before any tag
      • (?:...)?         - Optional HTML tag group
      • <[^>]+>          - Opening tag
      • [^<]*            - Text inside tag
      • <\/[^>]+>        - Closing tag
      • [^<]*            - Text after tag

5. (?:<br|$)
   └─ Must end with <br> or end of string

6. /i
   └─ Case-insensitive flag
```

## Extension Points

```
To add new field:

1. Add to DeviceInfo interface
   └─ export interface DeviceInfo { newField?: string; }

2. Add extraction call
   └─ info.newField = extractField(['New Field', 'Alternate Name']);

3. Add test case
   └─ expect(result.newField).toBe('Expected Value');

To handle new HTML format:

1. Capture raw HTML sample
   └─ Add to fixtures/sickw-samples.ts

2. Create failing test
   └─ Add test case with new format

3. Update regex/logic
   └─ Modify extractField or add new helper

4. Verify test passes
   └─ Run npm test
```

---

**Last Updated**: 2025-11-20
