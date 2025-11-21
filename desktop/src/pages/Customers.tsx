import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { getCustomers, saveCustomer, deleteCustomer } from '../services/storage';
import type { Customer } from '../types';
import Modal from '../components/Modal';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to load customers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    const toSave: Customer = {
      ...(editingCustomer as Customer),
      id: editingCustomer.id || crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
      createdAt: editingCustomer.createdAt || new Date().toISOString(),
      tags: editingCustomer.tags || []
    };

    await saveCustomer(toSave);
    setIsModalOpen(false);
    loadCustomers();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this customer?')) {
      await deleteCustomer(id);
      loadCustomers();
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button className="btn btn-primary" onClick={() => {
          setEditingCustomer({ type: 'Retail Customer', tags: [] });
          setIsModalOpen(true);
        }}>
          <Plus size={16} className="mr-2" /> Add Customer
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search customers..."
            className="input pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={4}>Loading...</td></tr> : filtered.map(customer => (
              <tr key={customer.id}>
                <td>
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-xs text-gray-500">{customer.companyName}</div>
                </td>
                <td>
                  <div className="flex items-center text-sm"><Mail size={14} className="mr-1"/> {customer.email}</div>
                  <div className="flex items-center text-sm text-gray-500"><Phone size={14} className="mr-1"/> {customer.phone}</div>
                </td>
                <td><span className="badge badge-info">{customer.type}</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded" onClick={() => {
                      setEditingCustomer(customer);
                      setIsModalOpen(true);
                    }}>
                      <Edit size={16} />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded text-red-500" onClick={() => handleDelete(customer.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Customer Details">
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="col-span-2" style={{ gridColumn: '1 / -1' }}>
            <label className="label">Name</label>
            <input className="input" required value={editingCustomer?.name || ''} onChange={e => setEditingCustomer({...editingCustomer, name: e.target.value})} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={editingCustomer?.email || ''} onChange={e => setEditingCustomer({...editingCustomer, email: e.target.value})} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={editingCustomer?.phone || ''} onChange={e => setEditingCustomer({...editingCustomer, phone: e.target.value})} />
          </div>
          <div>
            <label className="label">Company</label>
            <input className="input" value={editingCustomer?.companyName || ''} onChange={e => setEditingCustomer({...editingCustomer, companyName: e.target.value})} />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={editingCustomer?.type} onChange={e => setEditingCustomer({...editingCustomer, type: e.target.value as any})}>
              <option>Retail Customer</option>
              <option>Wholesale Buyer</option>
              <option>Partner</option>
            </select>
          </div>
          <div className="col-span-2" style={{ gridColumn: '1 / -1' }}>
            <label className="label">Address</label>
            <textarea className="input" rows={2} value={editingCustomer?.billingAddress || ''} onChange={e => setEditingCustomer({...editingCustomer, billingAddress: e.target.value})} />
          </div>
          <div className="col-span-2 flex justify-end gap-2 mt-4" style={{ gridColumn: '1 / -1' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
