/**
 * SICKW API Service for IMEI Lookups
 * Provides device information, warranty status, carrier lock status, etc.
 */

export interface SICKWRawResponse {
  result: string; // HTML-formatted string with all device data
  imei: string;
  balance: string;
  price: string;
  id: string;
  status: 'success' | 'error';
  ip: string;
  error?: string;
}

export interface DeviceInfo {
  // Basic Info (Guaranteed)
  model?: string;
  modelDescription?: string;

  // Identifiers
  imei?: string;
  imei2?: string;
  meid?: string;
  serialNumber?: string;

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

class SICKWAPIService {
  private baseUrl = 'https://sickw.com/api.php';
  private serviceId = '61'; // IMEI Lookup Service
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sickw_api_key', key);
    }
  }

  getApiKey(): string | null {
    if (this.apiKey) return this.apiKey;

    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sickw_api_key');
      if (stored) {
        this.apiKey = stored;
        return stored;
      }
    }

    return null;
  }

  async lookupIMEI(imei: string): Promise<DeviceInfo | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('SICKW API key not configured. Please set your API key in Settings.');
    }

    try {
      const url = `${this.baseUrl}?format=json&key=${apiKey}&imei=${imei}&service=${this.serviceId}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SICKWRawResponse = await response.json();

      if (data.status !== 'success') {
        throw new Error(data.error || 'SICKW API request failed');
      }

      // Parse the HTML result using enhanced parser
      return this.parseResultEnhanced(data.result, imei);
    } catch (error) {
      console.error('SICKW API Error:', error);
      throw error;
    }
  }

  /**
   * ENHANCED PARSER - Extracts ALL fields from HTML result
   * Handles variations in field names, colors, and formatting
   */
  parseResultEnhanced(htmlResult: string, imei: string): DeviceInfo {
    const info: DeviceInfo = {
      imei,
      rawResult: htmlResult,
    };

    // Helper function to clean HTML tags and extract text
    const cleanValue = (value: string): string => {
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
    const extractField = (patterns: string[]): string | undefined => {
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
    // GSMA section usually starts with "<b>GSMA Report</b>:" or similar
    const gsmaSection = htmlResult.match(/<b>GSMA Report<\/b>:(.+?)(?:<br><br>|$)/is);
    if (gsmaSection) {
      const gsmaContent = gsmaSection[1];

      // Helper to extract from GSMA section
      const extractGSMA = (patterns: string[]): string | undefined => {
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
}

export const sickwAPI = new SICKWAPIService();
