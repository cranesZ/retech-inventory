import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Plug, Info, Smartphone, Shield, Lock, FileCheck2 } from 'lucide-react';
import { sickwAPI } from '../services/sickw-api';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

type TabType = 'account' | 'api' | 'about';

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tab = searchParams.get('tab') as TabType;
    return tab === 'account' || tab === 'api' || tab === 'about' ? tab : 'account';
  });

  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  // Account Settings State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    // Load existing API key
    const existingKey = sickwAPI.getApiKey();
    if (existingKey) {
      setApiKey(existingKey);
    }
  }, []);

  useEffect(() => {
    // Update URL when tab changes
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

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
          `API Test Successful!\n\n` +
          `Model: ${result.model}\n` +
          `Warranty: ${result.warrantyStatus || 'N/A'}\n` +
          `iCloud Lock: ${result.iCloudLock || 'N/A'}\n` +
          `Blacklist: ${result.gsmaBlacklistStatus || 'N/A'}`
        );
      } else {
        alert('API returned data but could not parse model information.');
      }
    } catch (error: any) {
      alert(`API Test Failed:\n\n${error.message}`);
    }
  };

  const handlePasswordChange = async () => {
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      alert('New password must be at least 8 characters long');
      return;
    }

    try {
      // TODO: Implement actual password change API call
      // For now, just show success message
      alert(' Password changed successfully!\n\nNote: This is a demo. Integrate with backend API for production.');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSaved(true);

      setTimeout(() => {
        setPasswordSaved(false);
      }, 3000);
    } catch (error: any) {
      alert(`Failed to change password:\n\n${error.message}`);
    }
  };

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    if (!twoFactorEnabled) {
      alert('Two-Factor Authentication Enabled\n\nNote: This is a demo. Integrate with backend API for production.');
    } else {
      alert('Two-Factor Authentication Disabled');
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        <button
          className={`tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <User size={18} />
          <span>Account Settings</span>
        </button>
        <button
          className={`tab ${activeTab === 'api' ? 'active' : ''}`}
          onClick={() => setActiveTab('api')}
        >
          <Plug size={18} />
          <span>API Configuration</span>
        </button>
        <button
          className={`tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          <Info size={18} />
          <span>About</span>
        </button>
      </div>

      <div className="page-content">
        {/* Account Settings Tab */}
        {activeTab === 'account' && (
          <>
            <div className="settings-section">
              <h2>Profile Information</h2>
              <p className="section-description">
                View and manage your account profile.
              </p>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={user?.full_name || user?.email?.split('@')[0] || 'User'}
                    disabled
                    style={{ backgroundColor: 'var(--gray-100)', cursor: 'not-allowed' }}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    style={{ backgroundColor: 'var(--gray-100)', cursor: 'not-allowed' }}
                  />
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h2>Change Password</h2>
              <p className="section-description">
                Update your password to keep your account secure.
              </p>
              <div className="form-row">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="currentPassword">
                    Current Password <span className="required">*</span>
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="newPassword">
                    New Password <span className="required">*</span>
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <p className="help-text">Minimum 8 characters</p>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    Confirm New Password <span className="required">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="button-group">
                <button className="primary" onClick={handlePasswordChange}>
                  {passwordSaved ? 'Password Changed!' : 'Change Password'}
                </button>
              </div>
            </div>

            <div className="settings-section">
              <h2>Two-Factor Authentication</h2>
              <p className="section-description">
                Add an extra layer of security to your account with two-factor authentication.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={handleToggle2FA}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                  {twoFactorEnabled ? ' Enabled' : 'Disabled'}
                </span>
              </div>
              {twoFactorEnabled && (
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                    <strong>Note:</strong> This is a demo feature. In production, you would scan a QR code with your authenticator app.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* API Configuration Tab */}
        {activeTab === 'api' && (
          <>
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
              {saved ? 'Saved!' : 'Save API Key'}
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
              <h3><Smartphone size={20} style={{ display: 'inline-block', marginRight: '0.5rem', verticalAlign: 'middle' }} />Device Information</h3>
              <p>Model, manufacturer, capacity, color, and technical specifications</p>
            </div>
            <div className="feature-card">
              <h3><Shield size={20} style={{ display: 'inline-block', marginRight: '0.5rem', verticalAlign: 'middle' }} />Warranty Status</h3>
              <p>Coverage status, expiration dates, and AppleCare eligibility</p>
            </div>
            <div className="feature-card">
              <h3><Lock size={20} style={{ display: 'inline-block', marginRight: '0.5rem', verticalAlign: 'middle' }} />Lock Status</h3>
              <p>iCloud lock, carrier lock, and SIM lock information</p>
            </div>
            <div className="feature-card">
              <h3><FileCheck2 size={20} style={{ display: 'inline-block', marginRight: '0.5rem', verticalAlign: 'middle' }} />GSMA Report</h3>
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
            <li>Click the <strong>"Lookup"</strong> button next to the device</li>
            <li>The system will fetch and update device information automatically</li>
          </ol>
        </div>
          </>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <>
            <div className="settings-section">
              <h2>About</h2>
              <div className="about-info">
                <p><strong>Application:</strong> Retech Inventory Management System</p>
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>SICKW Service:</strong> IMEI Lookup (Service ID: 61)</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
