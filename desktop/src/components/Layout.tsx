import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Smartphone,
  ShoppingCart,
  Users,
  Truck,
  FileText,
  TrendingUp,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  User,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  // Check if user is admin (role can be at user.role or user.profile.role)
  const isAdmin = user?.role === 'admin' || user?.profile?.role === 'admin';

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/inventory', icon: Smartphone, label: 'Inventory' },
    { to: '/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/suppliers', icon: Truck, label: 'Suppliers' },
    { to: '/invoices', icon: FileText, label: 'Invoices' },
    { to: '/offer-analysis', icon: TrendingUp, label: 'Offer Analysis' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    ...(isAdmin ? [{ to: '/admin', icon: Shield, label: 'Admin Panel' }] : []),
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-text">
              <div className="logo-title">RETECH</div>
              <div className="logo-subtitle">INVENTORY SYSTEMS</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  <item.icon size={20} className="nav-icon" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer" style={{ position: 'relative' }}>
          <div
            className="user-profile"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              cursor: 'pointer',
              padding: '0.75rem',
              borderRadius: '8px',
              transition: 'background-color 0.2s',
              backgroundColor: showProfileMenu ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
            }}
          >
            <div className="user-avatar">{user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}</div>
            <div className="user-info">
              <p className="user-name">{user?.full_name || user?.email || 'User'}</p>
              <p className="user-role">{user?.email || 'user@example.com'}</p>
            </div>
            <ChevronUp
              size={20}
              style={{
                marginLeft: 'auto',
                transform: showProfileMenu ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.2s'
              }}
            />
          </div>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#1e293b',
                borderRadius: '8px',
                boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.1)',
                marginBottom: '0.5rem',
                overflow: 'hidden',
                zIndex: 1000
              }}
            >
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
                className="nav-item"
                style={{
                  width: '100%',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'transparent',
                  color: 'inherit',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <User size={20} />
                <span>Account Settings</span>
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  handleLogout();
                }}
                className="nav-item"
                style={{
                  width: '100%',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'transparent',
                  color: 'inherit',
                }}
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;