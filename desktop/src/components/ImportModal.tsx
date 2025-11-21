import { useState } from 'react';
import * as XLSX from 'xlsx';
import type { Device } from '../types';
import './ImportModal.css';

interface ImportModalProps {
  onImport: (devices: Device[]) => void;
  onCancel: () => void;
}

export function ImportModal({ onImport, onCancel }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [preview, setPreview] = useState<any[]>([]);
  const [step, setStep] = useState<'upload' | 'selectSheet' | 'preview'>('upload');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Read the file
    const data = await selectedFile.arrayBuffer();
    const workbook = XLSX.read(data);

    // Get sheet names
    const sheetNames = workbook.SheetNames;
    setSheets(sheetNames);

    if (sheetNames.length === 1) {
      // If only one sheet, go directly to preview
      setSelectedSheet(sheetNames[0]);
      loadPreview(workbook, sheetNames[0]);
    } else {
      // Multiple sheets, let user choose
      setStep('selectSheet');
    }
  };

  const loadPreview = (workbook: XLSX.WorkBook, sheetName: string) => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    setPreview(jsonData.slice(0, 10)); // Show first 10 rows
    setStep('preview');
  };

  const handleSheetSelect = async () => {
    if (!file || !selectedSheet) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    loadPreview(workbook, selectedSheet);
  };

  const getField = (row: any, ...fieldNames: string[]): string => {
    for (const name of fieldNames) {
      if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
        return String(row[name]);
      }
    }
    return '';
  };

  const handleImport = async () => {
    if (!file || !selectedSheet) {
      console.error('Import failed: missing file or sheet');
      alert('Error: No file or sheet selected');
      return;
    }

    try {
      console.log('Starting import from sheet:', selectedSheet);

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[selectedSheet];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      console.log(`Found ${jsonData.length} rows to import`);

      // Map Excel columns to Device fields with flexible column name matching
      const devices: Device[] = jsonData.map((row) => ({
        id: crypto.randomUUID(),
        manufacturer: getField(row, 'Manufacturer', 'manufacturer', 'MANUFACTURER', 'Brand', 'brand', 'BRAND'),
        model: getField(row, 'Model', 'model', 'MODEL', 'Model Name', 'model name'),
        variant: getField(row, 'Variant', 'variant', 'VARIANT', 'Version', 'version'),
        network: getField(row, 'Network', 'network', 'NETWORK', 'Carrier', 'carrier', 'CARRIER'),
        capacity: getField(row, 'Capacity', 'capacity', 'CAPACITY', 'Storage', 'storage', 'STORAGE', 'Size', 'size'),
        color: getField(row, 'Color', 'color', 'COLOR', 'Colour', 'colour'),
        esn: getField(row, 'ESN', 'esn', 'Esn'),
        imei: getField(row, 'IMEI', 'imei', 'Imei'),
        quantity: parseInt(getField(row, 'Quantity', 'quantity', 'QUANTITY', 'Qty', 'qty', 'QTY', 'Count', 'count') || '1') || 1,
        grade: getField(row, 'Grade', 'grade', 'GRADE', 'Condition', 'condition'),
        damages: getField(row, 'Damages', 'damages', 'DAMAGES', 'Damage', 'damage', 'Issues', 'issues'),
        notes: getField(row, 'Notes', 'notes', 'NOTES', 'Galaxy Notes', 'Comments', 'comments', 'Note', 'note'),
        pricePaid: parseFloat(getField(row, 'Price Paid', 'price paid', 'PRICE PAID', 'pricePaid', 'Cost', 'cost', 'Purchase Price', 'purchase price') || '0') || undefined,
        status: mapStatus(getField(row, 'Status', 'status', 'STATUS') || 'In Stock'),
        location: getField(row, 'Location', 'location', 'LOCATION', 'Warehouse', 'warehouse'),
        battery: getField(row, 'Battery', 'battery', 'BATTERY', 'Battery Health', 'battery health'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      console.log(`Mapped ${devices.length} devices, calling onImport...`);
      await onImport(devices);
      console.log('Import completed successfully');
    } catch (error) {
      console.error('Import error:', error);
      alert(`❌ Failed to import devices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const mapStatus = (status: string): Device['status'] => {
    const normalized = status.toLowerCase().trim();
    if (normalized.includes('warranty expired')) return 'Warranty Expired';
    if (normalized.includes('warranty active')) return 'Warranty Active';
    if (normalized.includes('sold')) return 'Sold';
    if (normalized.includes('reserved')) return 'Reserved';
    if (normalized.includes('repair')) return 'Repair';
    if (normalized.includes('returned')) return 'Returned';
    return 'In Stock';
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import Devices from Excel/CSV</h2>
          <button type="button" className="close-button" onClick={onCancel}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {step === 'upload' && (
            <div className="upload-section">
              <p>Select an Excel (.xlsx, .xls) or CSV file to import devices.</p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="file-input"
              />
              {file && <p className="file-name">Selected: {file.name}</p>}
            </div>
          )}

          {step === 'selectSheet' && (
            <div className="sheet-selection">
              <p>This file contains multiple sheets. Please select which sheet to import:</p>
              <div className="sheet-list">
                {sheets.map((sheet) => (
                  <label key={sheet} className="sheet-option">
                    <input
                      type="radio"
                      name="sheet"
                      value={sheet}
                      checked={selectedSheet === sheet}
                      onChange={(e) => setSelectedSheet(e.target.value)}
                    />
                    <span>{sheet}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="preview-section">
              <h3>Preview (first 10 rows)</h3>
              <p className="preview-info">
                Found {preview.length > 0 ? '10+' : preview.length} rows. Click Import to add all devices.
              </p>
              {preview.length > 0 && (
                <div className="preview-table-container">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        {Object.keys(preview[0]).map((key) => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((value: any, cellIdx) => (
                            <td key={cellIdx}>{value?.toString() || ''}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {preview.length === 0 && (
                <p className="error-message">No data found in the selected sheet.</p>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
          {step === 'selectSheet' && (
            <button
              type="button"
              className="primary"
              onClick={handleSheetSelect}
              disabled={!selectedSheet}
            >
              Continue
            </button>
          )}
          {step === 'preview' && (
            <button
              type="button"
              className="primary"
              onClick={handleImport}
              disabled={preview.length === 0}
            >
              Import Devices
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
