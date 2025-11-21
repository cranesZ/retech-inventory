import React, { useState, useEffect } from 'react';
import { Plus, FileText, Printer } from 'lucide-react';
import { getInvoices } from '../services/storage';
import type { Invoice } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await getInvoices();
      setInvoices(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <button className="btn btn-primary">
          <Plus size={16} className="mr-2" /> New Invoice
        </button>
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7}>Loading...</td></tr> : invoices.length === 0 ? (
               <tr><td colSpan={7} className="text-center py-4">No invoices found</td></tr>
            ) : invoices.map(inv => (
              <tr key={inv.id}>
                <td className="font-medium">{inv.invoiceNumber}</td>
                <td>{inv.customerName}</td>
                <td>{formatDate(inv.createdAt)}</td>
                <td>{formatDate(inv.dueDate)}</td>
                <td className="font-bold">{formatCurrency(inv.total)}</td>
                <td>
                  <span className={`badge ${
                    inv.status === 'Paid' ? 'badge-success' :
                    inv.status === 'Overdue' ? 'badge-danger' : 'badge-gray'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded"><FileText size={16}/></button>
                    <button className="p-1 hover:bg-gray-100 rounded"><Printer size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoices;
