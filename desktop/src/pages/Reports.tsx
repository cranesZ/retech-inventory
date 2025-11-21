import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { getDevices, getOrders, getCustomers } from '../services/storage';
import { formatCurrency } from '../utils/format';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [inventoryStats, setInventoryStats] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [salesByGrade, setSalesByGrade] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [devices, orders, customers] = await Promise.all([
        getDevices(),
        getOrders(),
        getCustomers()
      ]);

      // 1. Inventory by Status
      const statusCount: Record<string, number> = {};
      devices.forEach(d => {
        statusCount[d.status] = (statusCount[d.status] || 0) + 1;
      });
      const statusData = Object.keys(statusCount).map(key => ({
        name: key,
        value: statusCount[key]
      }));
      setInventoryStats(statusData);

      // 2. Top Customers by Revenue
      const customerRevenue: Record<string, number> = {};
      orders.filter(o => o.status !== 'Cancelled').forEach(o => {
        if (o.customerId) {
          customerRevenue[o.customerId] = (customerRevenue[o.customerId] || 0) + o.total;
        }
      });
      
      const topCustData = Object.keys(customerRevenue).map(id => {
        const customer = customers.find(c => c.id === id);
        return {
          name: customer ? customer.name : 'Unknown',
          revenue: customerRevenue[id]
        };
      }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
      setTopCustomers(topCustData);

      // 3. Sales by Grade (approximate based on sold items in inventory)
      // Note: In a real DB we'd join order items, but here we can look at Sold devices
      const soldDevices = devices.filter(d => d.status === 'Sold');
      const gradeCount: Record<string, number> = {};
      soldDevices.forEach(d => {
        const grade = d.grade || 'Ungraded';
        gradeCount[grade] = (gradeCount[grade] || 0) + 1;
      });
      const gradeData = Object.keys(gradeCount).map(key => ({
        name: key,
        count: gradeCount[key]
      }));
      setSalesByGrade(gradeData);

    } catch (error) {
      console.error("Error loading reports", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Generating Reports...</div>;

  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>

      <div className="grid grid-cols-2 gap-6 mb-8" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Inventory Status Pie Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Inventory Composition</h2>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inventoryStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Customers Bar Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Top Customers by Revenue</h2>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCustomers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

         {/* Sales by Grade */}
         <div className="card">
          <h2 className="text-lg font-semibold mb-4">Units Sold by Grade</h2>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByGrade}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10b981" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
