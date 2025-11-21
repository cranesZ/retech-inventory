import { supabase } from '../config/supabase.js';

/**
 * Sign up new user
 */
export async function signup(req, res) {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || ''
        },
        emailRedirectTo: process.env.SITE_URL || 'http://localhost:5173'
      }
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        error: authError.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully. Please check your email for confirmation.',
      data: {
        user: authData.user,
        session: authData.session
      }
    });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
}

/**
 * Sign in user
 */
export async function signin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: error.message
      });
    }

    // Update last_login_at
    if (data.user) {
      await supabase
        .from('user_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.user.id);
    }

    res.json({
      success: true,
      data: {
        user: data.user,
        session: data.session
      }
    });
  } catch (error) {
    console.error('Error in signin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sign in'
    });
  }
}

/**
 * Sign out user
 */
export async function signout(req, res) {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Signed out successfully'
    });
  } catch (error) {
    console.error('Error in signout:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sign out'
    });
  }
}

/**
 * Get current user profile
 */
export async function getProfile(req, res) {
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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    res.json({
      success: true,
      data: {
        user,
        profile
      }
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
}

/**
 * Enable 2FA for user
 */
export async function enable2FA(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Enroll TOTP factor
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp'
    });

    if (error) {
      throw error;
    }

    // Update user profile
    await supabase
      .from('user_profiles')
      .update({ two_factor_enabled: true })
      .eq('id', user.id);

    res.json({
      success: true,
      data: {
        qr_code: data.totp.qr_code,
        secret: data.totp.secret,
        uri: data.totp.uri
      }
    });
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enable 2FA'
    });
  }
}

/**
 * Verify 2FA code
 */
export async function verify2FA(req, res) {
  try {
    const { code, factor_id } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    const { data, error } = await supabase.auth.mfa.challenge({
      factorId: factor_id
    });

    if (error) throw error;

    const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
      factorId: factor_id,
      challengeId: data.id,
      code
    });

    if (verifyError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid code'
      });
    }

    res.json({
      success: true,
      message: '2FA verified successfully'
    });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify 2FA'
    });
  }
}

/**
 * Request password reset
 */
export async function resetPassword(req, res) {
  try {
    const { email } = req.body;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.SITE_URL || 'http://localhost:5173'}/reset-password`
    });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send reset email'
    });
  }
}
