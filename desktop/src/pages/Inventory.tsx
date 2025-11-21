import { useEffect, useState } from 'react';
import { getDevices, saveDevice, deleteDevice } from '../services/storage';
import { sickwAPI } from '../services/sickw-api';
import type { Device } from '../types';
import { ImportModal } from '../components/ImportModal';
import './Inventory.css';

export default function Inventory() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [lookingUpDeviceId, setLookingUpDeviceId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{deviceId: string; field: keyof Device} | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    filterDevices();
  }, [devices, searchTerm, statusFilter]);

  const loadDevices = async () => {
    try {
      setError(null);
      const data = await getDevices();
      setDevices(data);
    } catch (error) {
      console.error('Error loading devices:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load devices';
      setError(errorMessage);
      // If it's an auth error, we might want to redirect to login
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        alert('Session expired. Please log in again.');
        // You could redirect to login here if you have a login page
      }
    } finally {
      setLoading(false);
    }
  };

  const filterDevices = () => {
    let filtered = [...devices];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        d =>
          (d.esn && d.esn.toLowerCase().includes(term)) ||
          (d.imei && d.imei.toLowerCase().includes(term)) ||
          d.manufacturer.toLowerCase().includes(term) ||
          d.model.toLowerCase().includes(term) ||
          (d.variant && d.variant.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    // Sort by created date descending
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredDevices(filtered);
  };

  const handleAddDevice = () => {
    setEditingDevice(null);
    setShowModal(true);
  };

  const handleEditDevice = (device: Device) => {
    setEditingDevice(device);
    setShowModal(true);
  };

  const handleDeleteDevice = async (id: string) => {
    if (confirm('Are you sure you want to delete this device?')) {
      await deleteDevice(id);
      await loadDevices();
    }
  };

  const handleSaveDevice = async (device: Device) => {
    setIsSaving(true);
    try {
      await saveDevice(device);
      setShowModal(false);
      await loadDevices();
    } catch (error) {
      console.error('Failed to save device:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save device';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImport = async (importedDevices: Device[]) => {
    try {
      console.log(`Inventory: Starting import of ${importedDevices.length} devices`);

      for (const device of importedDevices) {
        console.log(`Saving device: ${device.manufacturer} ${device.model}`);
        await saveDevice(device);
      }

      setShowImportModal(false);
      await loadDevices();

      console.log('Import complete, devices loaded');
      alert(`✅ Successfully imported ${importedDevices.length} devices!`);
    } catch (error) {
      console.error('Failed to import devices:', error);
      alert(`❌ Failed to import devices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleLookupDevice = async (device: Device) => {
    const identifier = device.imei || device.esn;
    if (!identifier) {
      alert('This device does not have an IMEI or ESN to lookup.');
      return;
    }

    const apiKey = sickwAPI.getApiKey();
    if (!apiKey) {
      if (confirm('SICKW API key not configured. Would you like to go to Settings to add it?')) {
        window.location.href = '/settings';
      }
      return;
    }

    setLookingUpDeviceId(device.id);

    try {
      const deviceInfo = await sickwAPI.lookupIMEI(identifier);

      if (!deviceInfo) {
        alert('No information found for this device.');
        return;
      }

      // Update device with the information from SICKW
      const updatedDevice: Device = {
        ...device,
        // Update model if we got better info
        model: deviceInfo.model || device.model,
        // Update warranty status
        status: deviceInfo.warrantyStatus?.includes('Expired')
          ? 'Warranty Expired'
          : deviceInfo.warrantyStatus?.includes('Active')
            ? 'Warranty Active'
            : device.status,
        // Add/update notes with API info
        notes: [
          device.notes,
          '',
          '--- SICKW API Lookup ---',
          deviceInfo.model ? `Model: ${deviceInfo.model}` : null,
          deviceInfo.serialNumber ? `Serial: ${deviceInfo.serialNumber}` : null,
          deviceInfo.warrantyStatus ? `Warranty: ${deviceInfo.warrantyStatus}` : null,
          deviceInfo.iCloudLock ? `iCloud Lock: ${deviceInfo.iCloudLock}` : null,
          deviceInfo.iCloudStatus ? `iCloud Status: ${deviceInfo.iCloudStatus}` : null,
          deviceInfo.simLockStatus ? `SIM Lock: ${deviceInfo.simLockStatus}` : null,
          deviceInfo.gsmaBlacklistStatus ? `Blacklist: ${deviceInfo.gsmaBlacklistStatus}` : null,
          deviceInfo.activationStatus ? `Activation: ${deviceInfo.activationStatus}` : null,
        ].filter(Boolean).join('\n'),
        updatedAt: new Date().toISOString(),
      };

      await saveDevice(updatedDevice);
      await loadDevices();

      alert(
        `✅ Device information updated!\n\n` +
        `Model: ${deviceInfo.model || 'N/A'}\n` +
        `Warranty: ${deviceInfo.warrantyStatus || 'N/A'}\n` +
        `iCloud Lock: ${deviceInfo.iCloudLock || 'N/A'}\n` +
        `Blacklist: ${deviceInfo.gsmaBlacklistStatus || 'N/A'}\n\n` +
        `Full details added to device notes.`
      );
    } catch (error: any) {
      alert(`Failed to lookup device:\n\n${error.message}`);
    } finally {
      setLookingUpDeviceId(null);
    }
  };

  // Inline editing handlers
  const startEditing = (deviceId: string, field: keyof Device, currentValue: any) => {
    setEditingCell({ deviceId, field });
    setEditValue(String(currentValue || ''));
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const saveInlineEdit = async () => {
    if (!editingCell) return;

    const device = devices.find(d => d.id === editingCell.deviceId);
    if (!device) return;

    const updatedDevice = {
      ...device,
      [editingCell.field]: editValue,
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveDevice(updatedDevice);
      await loadDevices();
      cancelEditing();
    } catch (error) {
      console.error('Failed to save inline edit:', error);
      alert('Failed to save changes. Please try again.');
      cancelEditing();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveInlineEdit();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const renderEditableCell = (device: Device, field: keyof Device, value: any) => {
    const isEditing = editingCell?.deviceId === device.id && editingCell?.field === field;

    if (isEditing) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={saveInlineEdit}
          autoFocus
          style={{
            width: '100%',
            padding: '4px 8px',
            border: '2px solid #3b82f6',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}
        />
      );
    }

    return (
      <div
        onClick={() => startEditing(device.id, field, value)}
        style={{
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          minHeight: '24px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        title="Click to edit"
      >
        {value || '—'}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="inventory-page">
        <div className="page-header">
          <h1>Inventory</h1>
        </div>
        <div className="page-content">
          <p>Loading devices...</p>
        </div>
      </div>
    );
  }

  if (error && devices.length === 0) {
    return (
      <div className="inventory-page">
        <div className="page-header">
          <h1>Inventory</h1>
        </div>
        <div className="page-content">
          <div className="empty-state-box" style={{ color: '#dc2626' }}>
            <p>⚠️ Error loading devices: {error}</p>
            <button className="primary" onClick={loadDevices}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1>Inventory</h1>
        <div className="header-actions">
          <button className="secondary" onClick={() => setShowImportModal(true)}>
            📥 Import Excel/CSV
          </button>
          <button className="primary" onClick={handleAddDevice}>
            + Add Device
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="toolbar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by IMEI/ESN, manufacturer, model, or variant..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="Warranty Active">Warranty Active</option>
            <option value="Warranty Expired">Warranty Expired</option>
            <option value="In Stock">In Stock</option>
            <option value="Sold">Sold</option>
            <option value="Reserved">Reserved</option>
            <option value="Repair">Repair</option>
            <option value="Returned">Returned</option>
          </select>
        </div>

        {filteredDevices.length === 0 ? (
          <div className="empty-state-box">
            {devices.length === 0 ? (
              <>
                <p>No devices in inventory yet.</p>
                <div className="empty-actions">
                  <button className="secondary" onClick={() => setShowImportModal(true)}>
                    Import from Excel/CSV
                  </button>
                  <button className="primary" onClick={handleAddDevice}>
                    Add your first device
                  </button>
                </div>
              </>
            ) : (
              <p>No devices match your search criteria.</p>
            )}
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>IMEI/ESN</th>
                    <th>MANUFACTURER</th>
                    <th>MODEL</th>
                    <th>VARIANT</th>
                    <th>NETWORK</th>
                    <th>CAPACITY</th>
                    <th>COLOR</th>
                    <th>GRADE</th>
                    <th>QTY</th>
                    <th>STATUS</th>
                    <th>PRICE PAID</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
              <tbody>
                {filteredDevices.map(device => (
                  <tr key={device.id}>
                    <td>{renderEditableCell(device, 'imei', device.imei || device.esn)}</td>
                    <td>{renderEditableCell(device, 'manufacturer', device.manufacturer)}</td>
                    <td>{renderEditableCell(device, 'model', device.model)}</td>
                    <td>{renderEditableCell(device, 'variant', device.variant)}</td>
                    <td>{renderEditableCell(device, 'network', device.network)}</td>
                    <td>{renderEditableCell(device, 'capacity', device.capacity)}</td>
                    <td>{renderEditableCell(device, 'color', device.color)}</td>
                    <td>{renderEditableCell(device, 'grade', device.grade)}</td>
                    <td>{renderEditableCell(device, 'quantity', device.quantity)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(device.status)}`}>
                        {device.status}
                      </span>
                    </td>
                    <td>{renderEditableCell(device, 'pricePaid', device.pricePaid ? `$${device.pricePaid}` : '')}</td>
                    <td>
                      <div className="action-buttons">
                        {(device.imei || device.esn) && (
                          <button
                            className="primary small"
                            onClick={() => handleLookupDevice(device)}
                            disabled={lookingUpDeviceId === device.id}
                            title="Lookup device information via SICKW API"
                          >
                            {lookingUpDeviceId === device.id ? '⏳' : '🔍'}
                          </button>
                        )}
                        <button
                          className="secondary small"
                          onClick={() => handleEditDevice(device)}
                        >
                          Edit
                        </button>
                        <button
                          className="danger small"
                          onClick={() => handleDeleteDevice(device.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <DeviceModal
          device={editingDevice}
          onSave={handleSaveDevice}
          onCancel={() => setShowModal(false)}
          isSaving={isSaving}
        />
      )}

      {showImportModal && (
        <ImportModal
          onImport={handleImport}
          onCancel={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
}

interface DeviceModalProps {
  device: Device | null;
  onSave: (device: Device) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

function DeviceModal({ device, onSave, onCancel, isSaving = false }: DeviceModalProps) {
  const [formData, setFormData] = useState<Device>(
    device || {
      id: crypto.randomUUID(),
      manufacturer: '',
      model: '',
      quantity: 1,
      status: 'In Stock',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const handleChange = (field: keyof Device, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.manufacturer || !formData.model) {
      alert('Please fill in manufacturer and model');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2>{device ? 'Edit Device' : 'Add Device'}</h2>
            <button type="button" className="close-button" onClick={onCancel}>
              ×
            </button>
          </div>

          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="form-row">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>IMEI/ESN</label>
                <input
                  type="text"
                  value={formData.imei || ''}
                  onChange={e => handleChange('imei', e.target.value)}
                  placeholder="Enter device IMEI or ESN"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Manufacturer <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={e => handleChange('manufacturer', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Model <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={e => handleChange('model', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Variant</label>
                <input
                  type="text"
                  value={formData.variant || ''}
                  onChange={e => handleChange('variant', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Network</label>
                <input
                  type="text"
                  value={formData.network || ''}
                  onChange={e => handleChange('network', e.target.value)}
                  placeholder="e.g., Verizon, AT&T"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="text"
                  value={formData.capacity || ''}
                  onChange={e => handleChange('capacity', e.target.value)}
                  placeholder="e.g., 128GB, 256GB"
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  value={formData.color || ''}
                  onChange={e => handleChange('color', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Grade</label>
                <input
                  type="text"
                  value={formData.grade || ''}
                  onChange={e => handleChange('grade', e.target.value)}
                  placeholder="e.g., A, B, C"
                />
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={e => handleChange('quantity', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={e => handleChange('status', e.target.value)}
                >
                  <option value="Warranty Active">Warranty Active</option>
                  <option value="Warranty Expired">Warranty Expired</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Sold">Sold</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Repair">Repair</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>

              <div className="form-group">
                <label>Price Paid</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pricePaid || ''}
                  onChange={e => handleChange('pricePaid', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={e => handleChange('location', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Battery</label>
                <input
                  type="text"
                  value={formData.battery || ''}
                  onChange={e => handleChange('battery', e.target.value)}
                  placeholder="Battery health %"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Damages</label>
              <textarea
                value={formData.damages || ''}
                onChange={e => handleChange('damages', e.target.value)}
                rows={2}
                placeholder="List any damages or defects"
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={e => handleChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary" onClick={onCancel} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : device ? 'Update Device' : 'Add Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Warranty Active':
      return 'success';
    case 'Warranty Expired':
      return 'warning';
    case 'In Stock':
      return 'info';
    case 'Sold':
      return 'info';
    case 'Reserved':
      return 'warning';
    case 'Repair':
      return 'danger';
    case 'Returned':
      return 'danger';
    default:
      return 'info';
  }
}
