import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { getCustomers, getOrders, saveInvoice } from '../services/storage';
import type { Customer, Invoice, InvoiceItem } from '../types';
import { formatCurrency } from '../utils/format';

const InvoiceCreate: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [taxRate, setTaxRate] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [custs, orders] = await Promise.all([getCustomers(), getOrders()]);
    setCustomers(custs);

    if (orderId) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setSelectedCustomerId(order.customerId || '');
        setItems(order.items.map(i => ({
          description: `${i.deviceSnapshot.manufacturer} ${i.deviceSnapshot.model} (${i.deviceSnapshot.grade})`,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.total,
          deviceId: i.deviceId
        })));
      }
    }
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      item.total = item.quantity * item.unitPrice;
    }
    newItems[index] = item;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, i) => sum + i.total, 0);
    const tax = subtotal * (taxRate / 100);
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleSave = async () => {
    if (!selectedCustomerId) {
      alert('Select a customer');
      return;
    }
    if (items.length === 0) {
      alert('Add at least one item');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    const { subtotal, tax, total } = calculateTotals();

    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      customerId: selectedCustomerId,
      customerName: customer?.name || 'Unknown',
      orderId: orderId || undefined,
      items,
      subtotal,
      tax,
      total,
      status: 'Draft',
      dueDate: dueDate || new Date().toISOString(), // Default to today if not set
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveInvoice(newInvoice);
    navigate('/invoices');
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="container">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/invoices')} className="mr-4 p-2 hover:bg-gray-200 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Create Invoice</h1>
      </div>

      <div className="grid grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="col-span-2">
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Line Items</h2>
              <button className="btn btn-secondary" onClick={addItem}>
                <Plus size={16} className="mr-2" /> Add Item
              </button>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="w-20">Qty</th>
                    <th className="w-32">Price</th>
                    <th className="w-32">Total</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <input 
                          className="input" 
                          value={item.description}
                          onChange={e => updateItem(idx, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="input" 
                          value={item.quantity}
                          onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value))}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="input" 
                          value={item.unitPrice}
                          onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value))}
                        />
                      </td>
                      <td className="font-mono">{formatCurrency(item.total)}</td>
                      <td>
                        <button className="text-red-500 p-1" onClick={() => removeItem(idx)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="card mb-6">
            <h2 className="text-lg font-semibold mb-4">Details</h2>
            <div className="mb-4">
              <label className="label">Customer</label>
              <select 
                className="input" 
                value={selectedCustomerId} 
                onChange={e => setSelectedCustomerId(e.target.value)}
                disabled={!!orderId} // Lock customer if coming from order
              >
                <option value="">Select Customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="label">Due Date</label>
              <input 
                type="date" 
                className="input" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)} 
              />
            </div>
            <div className="mb-4">
              <label className="label">Tax Rate (%)</label>
              <input 
                type="number" 
                className="input" 
                value={taxRate} 
                onChange={e => setTaxRate(parseFloat(e.target.value))} 
              />
            </div>
          </div>

          <div className="card bg-gray-50">
             <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
            <div className="border-t border-gray-300 my-4 pt-4 flex justify-between items-center">
              <span className="text-xl font-bold">Total</span>
              <span className="text-xl font-bold text-blue-600">{formatCurrency(total)}</span>
            </div>
            <button className="btn btn-primary w-full py-3" onClick={handleSave}>
              <Save size={16} className="mr-2" /> Save Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCreate;
