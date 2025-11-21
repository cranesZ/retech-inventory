import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getOrders, getCustomers } from '../services/storage';
import type { Order, Customer } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, customersData] = await Promise.all([
        getOrders(),
        getCustomers()
      ]);
      setOrders(ordersData);
      setCustomers(customersData);
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (id?: string) => {
    if (!id) return 'Unknown';
    return customers.find(c => c.id === id)?.name || 'Unknown';
  };

  const filtered = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCustomerName(o.customerId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Link to="/orders/new" className="btn btn-primary">
          <Plus size={16} className="mr-2" /> New Order
        </Link>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search orders..."
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
              <th>Order #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
              <th>Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7}>Loading...</td></tr> : filtered.map(order => (
              <tr key={order.id}>
                <td className="font-medium">{order.orderNumber}</td>
                <td>{formatDate(order.date)}</td>
                <td>{getCustomerName(order.customerId)}</td>
                <td>
                  <span className={`badge ${
                    order.status === 'Completed' ? 'badge-success' :
                    order.status === 'Pending' ? 'badge-warning' :
                    order.status === 'Cancelled' ? 'badge-danger' : 'badge-info'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="font-bold">{formatCurrency(order.total)}</td>
                <td>{order.items.length} items</td>
                <td>
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded" title="View Details">
                      <Eye size={16} className="text-gray-600" />
                    </button>
                    {order.type === 'Sales Order' && (
                      <button 
                        className="p-1 hover:bg-gray-100 rounded" 
                        title="Create Invoice"
                        onClick={() => navigate(`/invoices/new?orderId=${order.id}`)}
                      >
                        <FileText size={16} className="text-blue-600" />
                      </button>
                    )}
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

export default Orders;
