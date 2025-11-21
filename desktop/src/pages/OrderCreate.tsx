import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { getCustomers, getDevices, saveOrder, saveDevice } from '../services/storage';
import type { Customer, Device, Order, OrderItem } from '../types';
import { formatCurrency } from '../utils/format';
import Modal from '../components/Modal';

const OrderCreate: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<Device[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemSearch, setItemSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const [c, d] = await Promise.all([getCustomers(), getDevices()]);
      setCustomers(c);
      setInventory(d.filter(dev => dev.status === 'In Stock'));
    };
    loadData();
  }, []);

  const addItem = (device: Device) => {
    const newItem: OrderItem = {
      deviceId: device.id,
      deviceSnapshot: device,
      quantity: 1,
      unitPrice: device.expectedSalePrice || device.pricePaid || 0,
      total: device.expectedSalePrice || device.pricePaid || 0
    };
    setItems([...items, newItem]);
    setIsItemModalOpen(false);
  };

  const updateItemPrice = (index: number, price: number) => {
    const newItems = [...items];
    newItems[index].unitPrice = price;
    newItems[index].total = price * newItems[index].quantity;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.0; // 0% tax for wholesale export usually, configurable later
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleSaveOrder = async () => {
    if (!selectedCustomerId) {
      alert('Please select a customer');
      return;
    }
    if (items.length === 0) {
      alert('Please add items to the order');
      return;
    }

    const totals = calculateTotals();
    const newOrder: Order = {
      id: crypto.randomUUID(),
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      type: 'Sales Order',
      customerId: selectedCustomerId,
      status: 'Confirmed',
      date: new Date(orderDate).toISOString(),
      items,
      ...totals,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveOrder(newOrder);

    // Update device status
    for (const item of items) {
      const device = inventory.find(d => d.id === item.deviceId);
      if (device) {
        await saveDevice({ ...device, status: 'Sold', orderId: newOrder.id });
      }
    }

    navigate('/orders');
  };

  const filteredInventory = inventory.filter(d => 
    !items.some(item => item.deviceId === d.id) && // Exclude already added
    (d.model.toLowerCase().includes(itemSearch.toLowerCase()) || d.imei?.includes(itemSearch))
  );

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="container">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/orders')} className="mr-4 p-2 hover:bg-gray-200 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Create New Sales Order</h1>
      </div>

      <div className="grid grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Items */}
        <div className="col-span-2">
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Order Items</h2>
              <button className="btn btn-secondary" onClick={() => setIsItemModalOpen(true)}>
                <Plus size={16} className="mr-2" /> Add Device
              </button>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>IMEI</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-gray-500">No items added. Click "Add Device" to select from inventory.</td></tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={item.deviceId}>
                        <td>
                          <div className="font-medium">{item.deviceSnapshot.manufacturer} {item.deviceSnapshot.model}</div>
                          <div className="text-xs text-gray-500">{item.deviceSnapshot.grade} - {item.deviceSnapshot.capacity}</div>
                        </td>
                        <td className="font-mono text-sm">{item.deviceSnapshot.imei}</td>
                        <td>
                          <input 
                            type="number" 
                            className="input w-32" 
                            value={item.unitPrice} 
                            onChange={(e) => updateItemPrice(idx, parseFloat(e.target.value))}
                          />
                        </td>
                        <td>
                          <button className="text-red-500 hover:bg-red-50 p-1 rounded" onClick={() => removeItem(idx)}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Summary */}
        <div>
          <div className="card mb-6">
            <h2 className="text-lg font-semibold mb-4">Customer & Details</h2>
            <div className="mb-4">
              <label className="label">Customer</label>
              <select 
                className="input" 
                value={selectedCustomerId} 
                onChange={e => setSelectedCustomerId(e.target.value)}
              >
                <option value="">Select Customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="label">Order Date</label>
              <input 
                type="date" 
                className="input" 
                value={orderDate} 
                onChange={e => setOrderDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="card bg-gray-50">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tax (0%)</span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
            <div className="border-t border-gray-300 my-4 pt-4 flex justify-between items-center">
              <span className="text-xl font-bold">Total</span>
              <span className="text-xl font-bold text-blue-600">{formatCurrency(total)}</span>
            </div>
            <button className="btn btn-primary w-full py-3" onClick={handleSaveOrder}>
              Confirm Order
            </button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isItemModalOpen} 
        onClose={() => setIsItemModalOpen(false)} 
        title="Add Items from Inventory"
        size="lg"
      >
        <div className="mb-4">
          <input 
            type="text" 
            className="input" 
            placeholder="Search inventory..." 
            value={itemSearch}
            onChange={e => setItemSearch(e.target.value)}
            autoFocus
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2">Model</th>
                <th className="p-2">IMEI</th>
                <th className="p-2">Grade</th>
                <th className="p-2">Cost</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(device => (
                <tr key={device.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{device.manufacturer} {device.model}</td>
                  <td className="p-2 font-mono text-sm">{device.imei}</td>
                  <td className="p-2">{device.grade}</td>
                  <td className="p-2 text-gray-500 text-sm">{formatCurrency(device.pricePaid || 0)}</td>
                  <td className="p-2 text-right">
                    <button className="btn btn-secondary btn-sm" onClick={() => addItem(device)}>Add</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default OrderCreate;
