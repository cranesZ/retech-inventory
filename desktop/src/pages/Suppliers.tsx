import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { getSuppliers, saveSupplier, deleteSupplier } from '../services/storage';
import type { Supplier } from '../types';
import Modal from '../components/Modal';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Partial<Supplier> | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("Failed to load suppliers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;

    const toSave: Supplier = {
      ...(editingSupplier as Supplier),
      id: editingSupplier.id || crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
      createdAt: editingSupplier.createdAt || new Date().toISOString(),
      tags: editingSupplier.tags || []
    };

    await saveSupplier(toSave);
    setIsModalOpen(false);
    loadSuppliers();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this supplier?')) {
      await deleteSupplier(id);
      loadSuppliers();
    }
  };

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <button className="btn btn-primary" onClick={() => {
          setEditingSupplier({ tags: [] });
          setIsModalOpen(true);
        }}>
          <Plus size={16} className="mr-2" /> Add Supplier
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search suppliers..."
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
              <th>Terms</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5}>Loading...</td></tr> : filtered.map(supplier => (
              <tr key={supplier.id}>
                <td>
                  <div className="font-medium">{supplier.name}</div>
                  <div className="text-xs text-gray-500">{supplier.contactPerson}</div>
                </td>
                <td>
                  <div className="flex items-center text-sm"><Mail size={14} className="mr-1"/> {supplier.email}</div>
                  <div className="flex items-center text-sm text-gray-500"><Phone size={14} className="mr-1"/> {supplier.phone}</div>
                </td>
                <td><span className="badge badge-gray">{supplier.paymentTerms}</span></td>
                <td>
                  <div className="flex text-yellow-500">
                    {'★'.repeat(supplier.rating || 0)}{'☆'.repeat(5 - (supplier.rating || 0))}
                  </div>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded" onClick={() => {
                      setEditingSupplier(supplier);
                      setIsModalOpen(true);
                    }}>
                      <Edit size={16} />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded text-red-500" onClick={() => handleDelete(supplier.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Supplier Details">
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="col-span-2" style={{ gridColumn: '1 / -1' }}>
            <label className="label">Company Name</label>
            <input className="input" required value={editingSupplier?.name || ''} onChange={e => setEditingSupplier({...editingSupplier, name: e.target.value})} />
          </div>
          <div>
            <label className="label">Contact Person</label>
            <input className="input" value={editingSupplier?.contactPerson || ''} onChange={e => setEditingSupplier({...editingSupplier, contactPerson: e.target.value})} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={editingSupplier?.email || ''} onChange={e => setEditingSupplier({...editingSupplier, email: e.target.value})} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={editingSupplier?.phone || ''} onChange={e => setEditingSupplier({...editingSupplier, phone: e.target.value})} />
          </div>
          <div>
            <label className="label">Payment Terms</label>
            <input className="input" placeholder="Net 30" value={editingSupplier?.paymentTerms || ''} onChange={e => setEditingSupplier({...editingSupplier, paymentTerms: e.target.value})} />
          </div>
          <div>
            <label className="label">Rating (1-5)</label>
            <input className="input" type="number" min="1" max="5" value={editingSupplier?.rating || 5} onChange={e => setEditingSupplier({...editingSupplier, rating: parseInt(e.target.value)})} />
          </div>
          <div className="col-span-2" style={{ gridColumn: '1 / -1' }}>
            <label className="label">Address</label>
            <textarea className="input" rows={2} value={editingSupplier?.address || ''} onChange={e => setEditingSupplier({...editingSupplier, address: e.target.value})} />
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

export default Suppliers;
