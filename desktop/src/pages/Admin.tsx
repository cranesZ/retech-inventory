import { useState, useEffect } from 'react';
import { Users, Shield, UserPlus, Settings } from 'lucide-react';
import { getAllUsers, createUser as apiCreateUser, updateUserRole as apiUpdateUserRole, activateUser as apiActivateUser, deactivateUser as apiDeactivateUser, deleteUser as apiDeleteUser } from '../services/api';
import '../styles/Admin.css';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'staff' | 'viewer';
  is_active: boolean;
  two_factor_enabled: boolean;
  last_login_at?: string;
  created_at: string;
}

export function Admin() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'staff' as 'admin' | 'manager' | 'staff' | 'viewer'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await getAllUsers();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiCreateUser(newUser);
      if (result.success) {
        alert('User created successfully');
        setShowCreateModal(false);
        setNewUser({ email: '', password: '', full_name: '', role: 'staff' });
        loadUsers();
      } else {
        alert(`Failed to create user: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const result = await apiUpdateUserRole(userId, newRole);
      if (result.success) {
        loadUsers();
      } else {
        alert(`Failed to update role: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update role');
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const result = isActive
        ? await apiDeactivateUser(userId)
        : await apiActivateUser(userId);

      if (result.success) {
        loadUsers();
      } else {
        alert(`Failed to ${isActive ? 'deactivate' : 'activate'} user: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      alert('Failed to toggle user status');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await apiDeleteUser(userId);
      if (result.success) {
        alert('User deleted successfully');
        loadUsers();
      } else {
        alert(`Failed to delete user: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin': return 'role-badge role-admin';
      case 'manager': return 'role-badge role-manager';
      case 'staff': return 'role-badge role-staff';
      case 'viewer': return 'role-badge role-viewer';
      default: return 'role-badge';
    }
  };

  if (loading) {
    return <div className="admin-page"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-title">
          <Shield size={32} />
          <h1>Admin Panel</h1>
        </div>
        <button className="btn-create-user" onClick={() => setShowCreateModal(true)}>
          <UserPlus size={20} />
          Create User
        </button>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <Users size={24} />
          <div className="stat-info">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{users.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <Shield size={24} />
          <div className="stat-info">
            <span className="stat-label">Admins</span>
            <span className="stat-value">{users.filter(u => u.role === 'admin').length}</span>
          </div>
        </div>
        <div className="stat-card">
          <Settings size={24} />
          <div className="stat-info">
            <span className="stat-label">Managers</span>
            <span className="stat-value">{users.filter(u => u.role === 'manager').length}</span>
          </div>
        </div>
        <div className="stat-card">
          <Users size={24} />
          <div className="stat-info">
            <span className="stat-label">Active Users</span>
            <span className="stat-value">{users.filter(u => u.is_active).length}</span>
          </div>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>2FA</th>
              <th>Last Login</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className={!user.is_active ? 'user-inactive' : ''}>
                <td>{user.email}</td>
                <td>{user.full_name || '-'}</td>
                <td>
                  <select
                    className={getRoleBadgeClass(user.role)}
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.two_factor_enabled ? 'badge-enabled' : 'badge-disabled'}`}>
                    {user.two_factor_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td>{user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : '-'}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <button
                    className="btn-action btn-toggle"
                    onClick={() => handleToggleActive(user.id, user.is_active)}
                    title={user.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {user.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="btn-action btn-delete"
                    onClick={() => handleDeleteUser(user.id, user.email)}
                    title="Delete user"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New User</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Min. 8 characters"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                >
                  <option value="viewer">Viewer</option>
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
