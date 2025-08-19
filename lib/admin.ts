import { supabaseServer } from './supabase-server';

export const getAdminEmails = async (): Promise<string[]> => {
  const { data: users, error } = await supabaseServer.auth.admin.listUsers();

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  const adminEmails = users.users
    .filter(user => user.user_metadata?.is_admin)
    .map(user => user.email as string);

  return adminEmails;
};
