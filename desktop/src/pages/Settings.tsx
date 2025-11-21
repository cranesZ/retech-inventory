import { useState, useEffect } from 'react';
import { sickwAPI } from '../services/sickw-api';
import './Settings.css';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load existing API key
    const existingKey = sickwAPI.getApiKey();
    if (existingKey) {
      setApiKey(existingKey);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      alert('Please enter an API key');
      return;
    }

    sickwAPI.setApiKey(apiKey.trim());
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      alert('Please enter an API key first');
      return;
    }

    sickwAPI.setApiKey(apiKey.trim());

    try {
      // Test with a sample IMEI
      const testIMEI = '352117355388857'; // iPhone 12 Pro Max from example
      alert(`Testing API with IMEI: ${testIMEI}...\n\nThis may take a few seconds.`);

      const result = await sickwAPI.lookupIMEI(testIMEI);

      if (result && result.model) {
        alert(
          `✅ API Test Successful!\n\n` +
          `Model: ${result.model}\n` +
          `Warranty: ${result.warrantyStatus || 'N/A'}\n` +
          `iCloud Lock: ${result.iCloudLock || 'N/A'}\n` +
          `Blacklist: ${result.gsmaBlacklistStatus || 'N/A'}`
        );
      } else {
        alert('⚠️ API returned data but could not parse model information.');
      }
    } catch (error: any) {
      alert(`❌ API Test Failed:\n\n${error.message}`);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="page-content">
        <div className="settings-section">
          <h2>SICKW API Configuration</h2>
          <p className="section-description">
            Configure your SICKW API key to enable automatic device lookups by IMEI/ESN.
            This allows you to fetch device information, warranty status, carrier lock status, and more.
          </p>

          <div className="form-group">
            <label htmlFor="apiKey">
              API Key <span className="required">*</span>
            </label>
            <input
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your SICKW API key"
              className="api-key-input"
            />
            <p className="help-text">
              Get your API key from{' '}
              <a href="https://sickw.com" target="_blank" rel="noopener noreferrer">
                sickw.com
              </a>
            </p>
          </div>

          <div className="button-group">
            <button className="primary" onClick={handleSave}>
              {saved ? '✓ Saved!' : 'Save API Key'}
            </button>
            <button className="secondary" onClick={handleTest} disabled={!apiKey.trim()}>
              Test API Connection
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2>API Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>📱 Device Information</h3>
              <p>Model, manufacturer, capacity, color, and technical specifications</p>
            </div>
            <div className="feature-card">
              <h3>🛡️ Warranty Status</h3>
              <p>Coverage status, expiration dates, and AppleCare eligibility</p>
            </div>
            <div className="feature-card">
              <h3>🔒 Lock Status</h3>
              <p>iCloud lock, carrier lock, and SIM lock information</p>
            </div>
            <div className="feature-card">
              <h3>📋 GSMA Report</h3>
              <p>Blacklist status, model verification, and manufacturer details</p>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>How to Use Device Lookup</h2>
          <ol className="instructions-list">
            <li>Save your SICKW API key above</li>
            <li>Go to the <strong>Inventory</strong> page</li>
            <li>Find a device with an IMEI or ESN</li>
            <li>Click the <strong>"🔍 Lookup"</strong> button next to the device</li>
            <li>The system will fetch and update device information automatically</li>
          </ol>
        </div>

        <div className="settings-section">
          <h2>About</h2>
          <div className="about-info">
            <p><strong>Application:</strong> Retech Inventory Management System</p>
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>SICKW Service:</strong> IMEI Lookup (Service ID: 61)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
