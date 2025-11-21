import React, { useState, useEffect } from 'react';
import { Upload, Play, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { getSuppliers, saveOrder, saveDevice } from '../services/storage';
import type { Supplier, Order, Device } from '../types';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';

// Simple market price estimation - replace with actual market data API
const getMarketPrice = (_model: string, _grade: string, _capacity: string): number => {
  // Return 0 for now - this should be replaced with real market data
  return 0;
};

interface AnalysisItem {
  id: string;
  model: string;
  capacity: string;
  grade: string;
  offeredPrice: number;
  marketPrice: number;
  profit: number;
  decision: 'Accept' | 'Reject';
}

const OfferAnalysis: React.FC = () => {
  const [inputData, setInputData] = useState('');
  const [analyzedItems, setAnalyzedItems] = useState<AnalysisItem[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleAnalyze = () => {
    // Parse CSV/Text logic
    // Format expected: Model, Capacity, Grade, Price
    const lines = inputData.split('\n');
    const items: AnalysisItem[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length >= 4) {
        const [model, capacity, grade, priceStr] = parts;
        const offeredPrice = parseFloat(priceStr.replace('$', ''));
        if (isNaN(offeredPrice)) return;

        const marketPrice = getMarketPrice(model, grade, capacity);
        const profit = marketPrice - offeredPrice;

        items.push({
          id: idx.toString(),
          model,
          capacity,
          grade,
          offeredPrice,
          marketPrice,
          profit,
          decision: profit > 0 ? 'Accept' : 'Reject'
        });
      }
    });

    setAnalyzedItems(items);
    setShowResults(true);
  };

  const toggleDecision = (id: string) => {
    setAnalyzedItems(items => items.map(item => {
      if (item.id === id) {
        return { ...item, decision: item.decision === 'Accept' ? 'Reject' : 'Accept' };
      }
      return item;
    }));
  };

  const navigate = useNavigate();
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');

  useEffect(() => {
    const loadSuppliers = async () => {
      const data = await getSuppliers();
      setSuppliers(data);
    };
    loadSuppliers();
  }, []);

  const handleCreatePO = async () => {
    if (!selectedSupplierId) {
      alert('Please select a supplier');
      return;
    }

    const acceptedItems = analyzedItems.filter(i => i.decision === 'Accept');
    if (acceptedItems.length === 0) {
      alert('No items accepted');
      return;
    }

    const orderId = crypto.randomUUID();
    const orderDate = new Date().toISOString();

    // 1. Create Devices in Inventory (In Stock / Ordered)
    const newDevices: Device[] = acceptedItems.map(item => ({
      id: crypto.randomUUID(),
      manufacturer: item.model.split(' ')[0], // Simple heuristic
      model: item.model,
      capacity: item.capacity,
      grade: item.grade as any,
      quantity: 1,
      pricePaid: item.offeredPrice,
      expectedSalePrice: item.marketPrice,
      status: 'In Stock',
      createdAt: orderDate,
      updatedAt: orderDate,
      orderId: orderId // Link to this PO
    }));

    for (const device of newDevices) {
      await saveDevice(device);
    }

    // 2. Create Order
    const newOrder: Order = {
      id: orderId,
      orderNumber: `PO-${Date.now().toString().slice(-6)}`,
      type: 'Purchase Order',
      supplierId: selectedSupplierId,
      status: 'Completed', // Assuming received immediately for this workflow
      date: orderDate,
      items: newDevices.map(d => ({
        deviceId: d.id,
        deviceSnapshot: d,
        quantity: 1,
        unitPrice: d.pricePaid || 0,
        total: d.pricePaid || 0
      })),
      subtotal: stats.totalOffer,
      tax: 0,
      total: stats.totalOffer,
      createdAt: orderDate,
      updatedAt: orderDate
    };

    await saveOrder(newOrder);

    alert(`Purchase Order ${newOrder.orderNumber} created with ${newDevices.length} devices added to inventory.`);
    navigate('/inventory');
  };

  const stats = {
    totalOffer: analyzedItems.filter(i => i.decision === 'Accept').reduce((sum, i) => sum + i.offeredPrice, 0),
    totalProfit: analyzedItems.filter(i => i.decision === 'Accept').reduce((sum, i) => sum + i.profit, 0),
    itemCount: analyzedItems.filter(i => i.decision === 'Accept').length
  };

  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-6">Offer Analysis</h1>

      {!showResults ? (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Import Offer</h2>
          <p className="text-sm text-gray-500 mb-4">
            Paste your offer data below (CSV format: Model, Capacity, Grade, Price) or upload an Excel file.
          </p>
          
          <textarea
            className="input font-mono text-sm mb-4"
            rows={10}
            placeholder="iPhone 13, 128GB, A, 350&#10;iPhone 12, 64GB, B, 200&#10;Samsung S21, 128GB, A, 220"
            value={inputData}
            onChange={e => setInputData(e.target.value)}
          />
          
          <div className="flex justify-between">
            <button className="btn btn-secondary">
              <Upload size={16} className="mr-2" /> Upload Excel
            </button>
            <button className="btn btn-primary" onClick={handleAnalyze} disabled={!inputData}>
              <Play size={16} className="mr-2" /> Analyze Offer
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-6 mb-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div className="card bg-blue-50 border-blue-200">
              <p className="text-sm text-blue-600">Total Cost (Accepted)</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.totalOffer)}</p>
            </div>
            <div className="card bg-green-50 border-green-200">
              <p className="text-sm text-green-600">Expected Profit</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalProfit)}</p>
            </div>
            <div className="card bg-gray-50">
              <p className="text-sm text-gray-600">Items Accepted</p>
              <p className="text-2xl font-bold">{stats.itemCount} / {analyzedItems.length}</p>
            </div>
          </div>

          <div className="card table-container">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Analysis Results</h2>
              <div className="flex gap-2">
                <button className="btn btn-secondary" onClick={() => setShowResults(false)}>New Analysis</button>
                <button className="btn btn-primary" onClick={() => setIsPOModalOpen(true)} disabled={stats.itemCount === 0}>
                  <ShoppingCart size={16} className="mr-2" /> Create Purchase Order
                </button>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Grade</th>
                  <th>Offer Price</th>
                  <th>Market Value</th>
                  <th>Profit</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {analyzedItems.map(item => (
                  <tr key={item.id} className={item.decision === 'Reject' ? 'opacity-50' : ''}>
                    <td>
                      <div className="font-medium">{item.model}</div>
                      <div className="text-xs text-gray-500">{item.capacity}</div>
                    </td>
                    <td>{item.grade}</td>
                    <td>{formatCurrency(item.offeredPrice)}</td>
                    <td>{formatCurrency(item.marketPrice)}</td>
                    <td className={item.profit > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {formatCurrency(item.profit)}
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleDecision(item.id)}
                        className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${ 
                          item.decision === 'Accept' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.decision === 'Accept' ? <CheckCircle size={14} className="mr-1"/> : <XCircle size={14} className="mr-1"/>}
                        {item.decision}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Modal
            isOpen={isPOModalOpen}
            onClose={() => setIsPOModalOpen(false)}
            title="Create Purchase Order"
          >
            <div className="p-4">
              <p className="mb-4">Select the supplier for this purchase order ({stats.itemCount} items).</p>
              <label className="label">Supplier</label>
              <select 
                className="input mb-6"
                value={selectedSupplierId}
                onChange={e => setSelectedSupplierId(e.target.value)}
              >
                <option value="">Select Supplier...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              
              <div className="flex justify-end gap-2">
                <button className="btn btn-secondary" onClick={() => setIsPOModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreatePO}>Confirm Purchase</button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default OfferAnalysis;
