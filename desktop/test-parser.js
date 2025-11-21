#!/usr/bin/env node

/**
 * Simple test runner for SICKW parser (no dependencies required)
 * Run with: node test-parser.js
 */

// Sample HTML responses for testing
const SAMPLE_IPHONE_12_PRO_MAX = `Model Description: SVC,IPHONE 12PROMAX,NAMM,256GB,SLV,CI/AR<br>Model: iPhone 12 Pro Max 256GB Silver [A2342] [iPhone13,4]<br>IMEI: 352117355388857<br>IMEI2: 352117355401734<br>MEID: 35211735538885<br>Serial Number: HH6JY03S0D44<br>Telephone Technical Support: <font color="red">Expired</font><br>Repairs and Service Coverage: <font color="red">Expired</font><br>Repairs and Service Expired By: 2 Years, 5 Months and 25 Days<br>Repairs and Service Expiration Date: 2023-02-11<br>Estimated Purchase Date: 2023-02-11<br>Warranty Status: <font color="red">Coverage Expired</font><br>iCloud Lock: <font color="red">ON</font><br>iCloud Status: <font color="green">Clean</font><br>Demo Unit: <font color="green">No</font><br>Loaner Device: <font color="green">No</font><br>Replaced Device: <font color="green">No</font><br>Replacement Device: <font color="red">Yes</font><br>Refurbished Device: <font color="green">No</font><br>AppleCare Eligible: <font color="red">No</font><br>Valid Purchase Date: <font color="green">Yes</font><br>Activation Status: <font color="green">Activated</font><br>Registration Status: <font color="green">Registered</font><br>Locked Carrier: 10 - Unlock.<br>Sim-Lock Status: <font color="green">Unlocked</font><br><br><b>GSMA Report</b>:<br>IMEI: 352117355388857<br>Model Name: Apple iPhone 12 Pro Max (A2342)<br>Model Number: iPhone 12 Pro Max (A2342)<br>Manufacturer: Apple Inc<br>Blacklist Status: <span style="COLOR:GREEN;">CLEAN</SPAN><br>General List Status: No<br>`;

// Inline parser implementation (copy of parseResultEnhanced logic)
function parseResultEnhanced(htmlResult, imei) {
  const info = {
    imei,
    rawResult: htmlResult,
  };

  // Helper function to clean HTML tags and extract text
  const cleanValue = (value) => {
    return value
      .replace(/<\/?[^>]+(>|$)/g, '') // Remove all HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  };

  // Helper function to extract field value with multiple possible field names
  const extractField = (patterns) => {
    for (const pattern of patterns) {
      // Match: "Field Name: value<br>" or "Field Name: <tag>value</tag><br>"
      const regex = new RegExp(`${pattern}:\\s*([^<]*(?:<[^>]+>[^<]*<\\/[^>]+>)?[^<]*)(?:<br|$)`, 'i');
      const match = htmlResult.match(regex);
      if (match) {
        const cleaned = cleanValue(match[1]);
        if (cleaned) return cleaned;
      }
    }
    return undefined;
  };

  // Extract Basic Info
  info.model = extractField(['Model(?! Description)', 'Model Name']);
  info.modelDescription = extractField(['Model Description']);

  // Extract Identifiers
  info.imei = extractField(['IMEI(?!2)']) || imei; // Fallback to provided IMEI
  info.imei2 = extractField(['IMEI2']);
  info.meid = extractField(['MEID']);
  info.serialNumber = extractField(['Serial Number', 'Serial']);

  // Extract Warranty & Coverage
  info.warrantyStatus = extractField(['Warranty Status']);
  info.repairsAndServiceCoverage = extractField(['Repairs and Service Coverage', 'Service Coverage']);
  info.repairsAndServiceExpired = extractField([
    'Repairs and Service Expired By',
    'Service Expired By',
    'Coverage Expired By'
  ]);
  info.repairsAndServiceExpirationDate = extractField([
    'Repairs and Service Expiration Date',
    'Service Expiration Date',
    'Coverage Expiration Date'
  ]);
  info.estimatedPurchaseDate = extractField(['Estimated Purchase Date', 'Purchase Date']);
  info.telephoneTechnicalSupport = extractField(['Telephone Technical Support', 'Technical Support']);

  // Extract Device Status
  info.iCloudLock = extractField(['iCloud Lock']);
  info.iCloudStatus = extractField(['iCloud Status']);
  info.activationStatus = extractField(['Activation Status']);
  info.registrationStatus = extractField(['Registration Status']);

  // Extract Carrier & Lock
  info.lockedCarrier = extractField(['Locked Carrier', 'Carrier Lock', 'Carrier']);
  info.simLockStatus = extractField(['Sim-Lock Status', 'SIM Lock Status', 'Lock Status']);

  // Extract Device Characteristics
  info.demoUnit = extractField(['Demo Unit']);
  info.loanerDevice = extractField(['Loaner Device']);
  info.replacedDevice = extractField(['Replaced Device']);
  info.replacementDevice = extractField(['Replacement Device']);
  info.refurbishedDevice = extractField(['Refurbished Device', 'Refurbished']);

  // Extract AppleCare & Purchase
  info.appleCareEligible = extractField(['AppleCare Eligible', 'AppleCare']);
  info.validPurchaseDate = extractField(['Valid Purchase Date']);

  // Extract GSMA Report fields
  const gsmaSection = htmlResult.match(/<b>GSMA Report<\/b>:(.+?)(?:<br><br>|$)/is);
  if (gsmaSection) {
    const gsmaContent = gsmaSection[1];

    // Helper to extract from GSMA section
    const extractGSMA = (patterns) => {
      for (const pattern of patterns) {
        const regex = new RegExp(`${pattern}:\\s*([^<]*(?:<[^>]+>[^<]*<\\/[^>]+>)?[^<]*)(?:<br|$)`, 'i');
        const match = gsmaContent.match(regex);
        if (match) {
          const cleaned = cleanValue(match[1]);
          if (cleaned) return cleaned;
        }
      }
      return undefined;
    };

    info.gsmaBlacklistStatus = extractGSMA(['Blacklist Status', 'Status']);
    info.gsmaModelName = extractGSMA(['Model Name']);
    info.gsmaModelNumber = extractGSMA(['Model Number', 'Model']);
    info.gsmaManufacturer = extractGSMA(['Manufacturer']);
  }

  return info;
}

// Simple test framework
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log('✅', message);
    passed++;
  } else {
    console.log('❌', message);
    failed++;
  }
}

function assertEquals(actual, expected, fieldName) {
  if (actual === expected) {
    console.log(`✅ ${fieldName}: "${actual}"`);
    passed++;
  } else {
    console.log(`❌ ${fieldName}: Expected "${expected}", got "${actual}"`);
    failed++;
  }
}

// Run tests
console.log('\n========================================');
console.log('SICKW Parser Test Suite');
console.log('========================================\n');

console.log('Test 1: iPhone 12 Pro Max - Full Parsing');
console.log('------------------------------------------');
const result = parseResultEnhanced(SAMPLE_IPHONE_12_PRO_MAX, '352117355388857');

// Basic Info
assertEquals(result.model, 'iPhone 12 Pro Max 256GB Silver [A2342] [iPhone13,4]', 'model');
assertEquals(result.modelDescription, 'SVC,IPHONE 12PROMAX,NAMM,256GB,SLV,CI/AR', 'modelDescription');

// Identifiers
assertEquals(result.imei, '352117355388857', 'imei');
assertEquals(result.imei2, '352117355401734', 'imei2');
assertEquals(result.meid, '35211735538885', 'meid');
assertEquals(result.serialNumber, 'HH6JY03S0D44', 'serialNumber');

// Warranty & Coverage
assertEquals(result.warrantyStatus, 'Coverage Expired', 'warrantyStatus');
assertEquals(result.repairsAndServiceCoverage, 'Expired', 'repairsAndServiceCoverage');
assertEquals(result.repairsAndServiceExpired, '2 Years, 5 Months and 25 Days', 'repairsAndServiceExpired');
assertEquals(result.repairsAndServiceExpirationDate, '2023-02-11', 'repairsAndServiceExpirationDate');
assertEquals(result.estimatedPurchaseDate, '2023-02-11', 'estimatedPurchaseDate');
assertEquals(result.telephoneTechnicalSupport, 'Expired', 'telephoneTechnicalSupport');

// Device Status
assertEquals(result.iCloudLock, 'ON', 'iCloudLock');
assertEquals(result.iCloudStatus, 'Clean', 'iCloudStatus');
assertEquals(result.activationStatus, 'Activated', 'activationStatus');
assertEquals(result.registrationStatus, 'Registered', 'registrationStatus');

// Carrier & Lock
assertEquals(result.lockedCarrier, '10 - Unlock.', 'lockedCarrier');
assertEquals(result.simLockStatus, 'Unlocked', 'simLockStatus');

// Device Characteristics
assertEquals(result.demoUnit, 'No', 'demoUnit');
assertEquals(result.loanerDevice, 'No', 'loanerDevice');
assertEquals(result.replacedDevice, 'No', 'replacedDevice');
assertEquals(result.replacementDevice, 'Yes', 'replacementDevice');
assertEquals(result.refurbishedDevice, 'No', 'refurbishedDevice');

// AppleCare & Purchase
assertEquals(result.appleCareEligible, 'No', 'appleCareEligible');
assertEquals(result.validPurchaseDate, 'Yes', 'validPurchaseDate');

// GSMA Report
assertEquals(result.gsmaBlacklistStatus, 'CLEAN', 'gsmaBlacklistStatus');
assertEquals(result.gsmaModelName, 'Apple iPhone 12 Pro Max (A2342)', 'gsmaModelName');
assertEquals(result.gsmaModelNumber, 'iPhone 12 Pro Max (A2342)', 'gsmaModelNumber');
assertEquals(result.gsmaManufacturer, 'Apple Inc', 'gsmaManufacturer');

console.log('\n------------------------------------------');
console.log('Test 2: Missing Fields Handling');
console.log('------------------------------------------');
const minimalHtml = `Model: iPhone 14 Pro<br>IMEI: 123456789012345<br>Serial Number: ABC123<br>`;
const minimalResult = parseResultEnhanced(minimalHtml, '123456789012345');

assertEquals(minimalResult.model, 'iPhone 14 Pro', 'model');
assertEquals(minimalResult.imei, '123456789012345', 'imei');
assertEquals(minimalResult.serialNumber, 'ABC123', 'serialNumber');
assert(minimalResult.imei2 === undefined, 'imei2 should be undefined');
assert(minimalResult.warrantyStatus === undefined, 'warrantyStatus should be undefined');

console.log('\n------------------------------------------');
console.log('Test 3: HTML Entity Decoding');
console.log('------------------------------------------');
const entityHtml = `Model: iPhone&nbsp;15<br>IMEI: 123456789012345<br>Warranty Status: <font color="green">Active&amp;Valid</font><br>`;
const entityResult = parseResultEnhanced(entityHtml, '123456789012345');

assertEquals(entityResult.model, 'iPhone 15', 'model (with &nbsp;)');
assertEquals(entityResult.warrantyStatus, 'Active&Valid', 'warrantyStatus (with &amp;)');

console.log('\n------------------------------------------');
console.log('Test 4: IMEI Fallback');
console.log('------------------------------------------');
const noImeiHtml = `Model: iPhone 11<br>Serial Number: XYZ789<br>`;
const noImeiResult = parseResultEnhanced(noImeiHtml, '999999999999999');

assertEquals(noImeiResult.imei, '999999999999999', 'imei (fallback)');

console.log('\n========================================');
console.log('Test Results Summary');
console.log('========================================');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);
console.log('========================================\n');

if (failed === 0) {
  console.log('🎉 All tests passed!\n');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please review the output above.\n');
  process.exit(1);
}
