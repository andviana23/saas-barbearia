import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = createServerSupabase();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Erro ao verificar usuário no dashboard:', error);
      redirect(`/login?redirectTo=${encodeURIComponent('/dashboard')}`);
    }

    if (!user) {
      redirect(`/login?redirectTo=${encodeURIComponent('/dashboard')}`);
    }

    return <DashboardClient />;
  } catch (error) {
    console.error('Erro inesperado no dashboard:', error);
    redirect(`/login?redirectTo=${encodeURIComponent('/dashboard')}`);
  }
}
