import { createClient } from '@supabase/supabase-js';

declare global {
  interface Window {
    __SUPABASE_CLIENT__?: ReturnType<typeof createClient>;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
}

export const supabase = typeof window !== 'undefined'
  ? window.__SUPABASE_CLIENT__ ??= createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

// Reuse the same Supabase client for public access to avoid multiple GoTrueClient instances.
export const supabasePublic = supabase;

export const getSupabaseAccessToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting Supabase access token:', error.message || error);
    return null;
  }

  return session?.access_token ?? null;
};

// Helper function to get the current user
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting user:', error.message);
    return null;
  }

  return user;
};

// Helper function to check if user is admin
export const isAdmin = async () => {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error checking admin status:', error.message);
    return false;
  }

  return data?.role === 'admin';
};

// Server-side Supabase client for API routes
export const getSupabaseServerClient = (cookies: any) => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        cookie: cookies.toString(),
      },
    },
  });
};

