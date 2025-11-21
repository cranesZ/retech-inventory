import { supabase } from '../config/supabase.js';

/**
 * Middleware to check if user is admin
 */
export async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No authorization header'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    req.user = user;
    req.profile = profile;
    next();
  } catch (error) {
    console.error('Error in requireAdmin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify admin'
    });
  }
}

/**
 * Get all users (Admin only)
 */
export async function getAllUsers(req, res) {
  try {
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users'
    });
  }
}

/**
 * Update user role (Admin only)
 */
export async function updateUserRole(req, res) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'manager', 'staff', 'viewer'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
    }

    // Don't allow changing your own role
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot change your own role'
      });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update role'
    });
  }
}

/**
 * Deactivate user (Admin only)
 */
export async function deactivateUser(req, res) {
  try {
    const { userId } = req.params;

    // Don't allow deactivating yourself
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot deactivate yourself'
      });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in deactivateUser:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate user'
    });
  }
}

/**
 * Activate user (Admin only)
 */
export async function activateUser(req, res) {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in activateUser:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to activate user'
    });
  }
}

/**
 * Delete user (Admin only)
 */
export async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    // Don't allow deleting yourself
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete yourself'
      });
    }

    // Delete from auth.users (will cascade to user_profiles)
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
}

/**
 * Create new user (Admin only)
 */
export async function createUser(req, res) {
  try {
    const { email, password, full_name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    if (role && !['admin', 'manager', 'staff', 'viewer'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,  // Auto-confirm for admin-created users
      user_metadata: {
        full_name: full_name || ''
      }
    });

    if (authError) throw authError;

    // Update role if specified (trigger will create profile with default 'staff' role)
    if (role && role !== 'staff') {
      await supabase
        .from('user_profiles')
        .update({ role })
        .eq('id', authData.user.id);
    }

    // Get the updated profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    res.status(201).json({
      success: true,
      data: {
        user: authData.user,
        profile
      }
    });
  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
}

/**
 * Get dashboard stats (Admin only)
 */
export async function getDashboardStats(req, res) {
  try {
    // Get user counts by role
    const { data: users } = await supabase
      .from('user_profiles')
      .select('role, is_active');

    const stats = {
      total_users: users?.length || 0,
      active_users: users?.filter(u => u.is_active).length || 0,
      inactive_users: users?.filter(u => !u.is_active).length || 0,
      by_role: {
        admin: users?.filter(u => u.role === 'admin').length || 0,
        manager: users?.filter(u => u.role === 'manager').length || 0,
        staff: users?.filter(u => u.role === 'staff').length || 0,
        viewer: users?.filter(u => u.role === 'viewer').length || 0
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stats'
    });
  }
}
