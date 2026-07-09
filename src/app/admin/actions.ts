'use server';

import { supabaseAdmin } from '@/lib/db-server';

// Create a Supabase admin client using the service role key (server-side only)
const getAdminClient = () => {
  return supabaseAdmin;
};

/**
 * Creates a user in Supabase Auth using the admin client.
 * Returns the created user object or an existing user if email is already registered.
 */
export async function createStudentAuth(email: string, password?: string) {
  const adminClient = getAdminClient();
  if (!adminClient) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not set. Skipping Auth user creation.");
    return null;
  }

  try {
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password: password || 'password',
      email_confirm: true
    });
    
    if (error) {
      // If user already exists, retrieve and return that user
      if (error.message.includes("already registered") || error.status === 422) {
        const { data: list, error: listError } = await adminClient.auth.admin.listUsers();
        if (!listError && list?.users) {
          const u = list.users.find(user => user.email?.toLowerCase() === email.toLowerCase());
          if (u) return u;
        }
      }
      throw error;
    }
    return data.user;
  } catch (err: any) {
    console.error("Failed to create Auth user:", err);
    throw err;
  }
}

/**
 * Updates a user's password and/or email in Supabase Auth.
 */
export async function updateStudentAuth(email: string, password?: string) {
  const adminClient = getAdminClient();
  if (!adminClient) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not set. Skipping Auth user update.");
    return null;
  }

  try {
    // Find user by email
    const { data: list, error: listError } = await adminClient.auth.admin.listUsers();
    if (listError) throw listError;
    
    const u = list?.users?.find(user => user.email?.toLowerCase() === email.toLowerCase());
    if (!u) {
      // If user doesn't exist in Auth yet, create them now
      return await createStudentAuth(email, password);
    }

    if (password) {
      const { data, error } = await adminClient.auth.admin.updateUserById(u.id, {
        password: password
      });
      if (error) throw error;
      return data.user;
    }
    return u;
  } catch (err: any) {
    console.error("Failed to update Auth user:", err);
    throw err;
  }
}
