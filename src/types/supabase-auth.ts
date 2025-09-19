import { Session, User } from '@supabase/supabase-js';

export interface SupabaseSession extends Session {
  user: User;
}

export interface SupabaseAuthResponse {
  data: {
    user: User | null;
    session: SupabaseSession | null;
  };
  error: Error | null;
}

export interface ProfileData {
  id: string;
  user_id: string;
  name: string | null;
  phone: string | null;
  unit_default_id: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

export interface SignInResponse {
  user: User | null;
  session: SupabaseSession | null;
}
