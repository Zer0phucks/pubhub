// Authentication API endpoints
import { Hono } from 'hono';
import { createClient } from '../lib/supabase/server';

const app = new Hono();

// POST /api/auth/signup - Create new user account
app.post('/signup', async (c) => {
  try {
    const { email, password, displayName } = await c.req.json();

    const supabase = createClient();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return c.json({ error: authError.message }, 400);
    }

    if (!authData.user) {
      return c.json({ error: 'Failed to create user' }, 500);
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        display_name: displayName,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail signup if profile creation fails, user can update later
    }

    return c.json({
      user: authData.user,
      session: authData.session,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to sign up' }, 500);
  }
});

// POST /api/auth/login - Sign in existing user
app.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return c.json({ error: error.message }, 401);
    }

    return c.json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Failed to log in' }, 500);
  }
});

// POST /api/auth/logout - Sign out user
app.post('/logout', async (c) => {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: 'Failed to log out' }, 500);
  }
});

// GET /api/auth/session - Get current session
app.get('/session', async (c) => {
  try {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ session });
  } catch (error) {
    console.error('Session error:', error);
    return c.json({ error: 'Failed to get session' }, 500);
  }
});

// POST /api/auth/reset-password - Request password reset
app.post('/reset-password', async (c) => {
  try {
    const { email } = await c.req.json();

    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.APP_URL}/reset-password`,
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    return c.json({ error: 'Failed to send reset email' }, 500);
  }
});

// POST /api/auth/update-password - Update user password
app.post('/update-password', async (c) => {
  try {
    const { password } = await c.req.json();

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    return c.json({ error: 'Failed to update password' }, 500);
  }
});

// GET /api/auth/google - Initiate Google OAuth
app.get('/google', async (c) => {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.APP_URL}/auth/callback`,
      },
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ url: data.url });
  } catch (error) {
    console.error('Google OAuth error:', error);
    return c.json({ error: 'Failed to initiate Google sign-in' }, 500);
  }
});

// GET /api/auth/callback - Handle OAuth callback
app.get('/callback', async (c) => {
  try {
    const code = c.req.query('code');

    if (!code) {
      return c.json({ error: 'No authorization code provided' }, 400);
    }

    const supabase = createClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    // Check if user profile exists, create if not
    if (data.user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        await supabase.from('user_profiles').insert({
          id: data.user.id,
          email: data.user.email,
          display_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          avatar_url: data.user.user_metadata?.avatar_url,
        });
      }
    }

    return c.json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return c.json({ error: 'Failed to complete sign-in' }, 500);
  }
});

export default app;
