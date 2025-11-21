import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { DollarSign, Smartphone, ShoppingBag, Users } from 'lucide-react';
import { getDevices, getOrders, getCustomers, getInvoices } from '../services/storage';
import { formatCurrency } from '../utils/format';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    inventoryCount: 0,
    inventoryValue: 0,
    activeOrders: 0,
    totalCustomers: 0,
  });

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [devices, orders, customers, invoices] = await Promise.all([
          getDevices(),
          getOrders(),
          getCustomers(),
          getInvoices()
        ]);

        // Calculate Stats
        const totalRevenue = invoices
          .filter(inv => inv.status === 'Paid')
          .reduce((sum, inv) => sum + inv.total, 0);

        const inventoryValue = devices
          .filter(d => d.status === 'In Stock')
          .reduce((sum, d) => sum + (d.pricePaid || 0), 0);

        const activeOrdersCount = orders
          .filter(o => ['Pending', 'Confirmed', 'In Progress'].includes(o.status))
          .length;

        setStats({
          revenue: totalRevenue,
          inventoryCount: devices.length,
          inventoryValue,
          activeOrders: activeOrdersCount,
          totalCustomers: customers.length
        });

        // Empty chart data - to be populated from real data
        setRevenueData([]);

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>

        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
          </div>
        </div>

        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <Smartphone size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">In Stock</p>
            <p className="text-2xl font-bold">{stats.inventoryCount}</p>
            <p className="text-xs text-gray-400">{formatCurrency(stats.inventoryValue)} value</p>
          </div>
        </div>

        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Orders</p>
            <p className="text-2xl font-bold">{stats.activeOrders}</p>
          </div>
        </div>

        <div className="card flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Customers</p>
            <p className="text-2xl font-bold">{stats.totalCustomers}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
          <div style={{ height: '300px' }}>
            {revenueData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                  <Bar dataKey="profit" fill="#10b981" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Sales Trend</h2>
          <div style={{ height: '300px' }}>
            {revenueData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
