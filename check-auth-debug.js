// Script para debugar autenticação e permissões
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Usar service key para debug
);

async function checkAuth() {
  console.log('=== Debug de Autenticação e Permissões ===');
  
  try {
    // 1. Verificar se o usuário está na sessão
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Erro ao obter sessão:', sessionError);
      return;
    }
    
    if (!session) {
      console.log('❌ Nenhum usuário logado');
      return;
    }
    
    console.log('✅ Usuário logado:', session.user.email);
    console.log('User ID:', session.user.id);
    
    // 2. Verificar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
      
    if (profileError) {
      console.error('Erro ao buscar perfil:', profileError);
    } else {
      console.log('✅ Perfil encontrado:', profile);
    }
    
    // 3. Verificar unidades que o usuário tem acesso
    const { data: units, error: unitsError } = await supabase
      .from('unit_members')
      .select('*, units(*)')
      .eq('user_id', session.user.id);
      
    if (unitsError) {
      console.error('Erro ao buscar unidades:', unitsError);
    } else {
      console.log('✅ Unidades do usuário:', units);
      
      // 4. Testar acesso a appointments para cada unidade
      for (const unit of units) {
        console.log(`\n--- Testando acesso na unidade ${unit.units.name} (${unit.unit_id}) ---`);
        
        // Testar appointments
        const { data: appointments, error: apptError } = await supabase
          .from('appointments')
          .select('id, status, created_at')
          .eq('unit_id', unit.unit_id)
          .limit(1);
          
        if (apptError) {
          console.log(`❌ Erro ao buscar appointments:`, apptError.message);
        } else {
          console.log(`✅ Appointments acessíveis: ${appointments.length} registros`);
        }
        
        // Testar cashbox_transactions
        const { data: cashbox, error: cashboxError } = await supabase
          .from('cashbox_transactions')
          .select('id, amount_cents, type')
          .eq('unit_id', unit.unit_id)
          .limit(1);
          
        if (cashboxError) {
          console.log(`❌ Erro ao buscar cashbox_transactions:`, cashboxError.message);
        } else {
          console.log(`✅ Cashbox transactions acessíveis: ${cashbox.length} registros`);
        }
        
        // Testar appointment_services
        const { data: apptServices, error: apptServicesError } = await supabase
          .from('appointment_services')
          .select('id, appointment_id, service_id')
          .eq('unit_id', unit.unit_id)
          .limit(1);
          
        if (apptServicesError) {
          console.log(`❌ Erro ao buscar appointment_services:`, apptServicesError.message);
        } else {
          console.log(`✅ Appointment services acessíveis: ${apptServices.length} registros`);
        }
      }
    }
    
    // 5. Verificar roles do usuário
    const { data: roles, error: rolesError } = await supabase
      .from('role_assignments')
      .select('*, roles(*)')
      .eq('user_id', session.user.id);
      
    if (rolesError) {
      console.error('Erro ao buscar roles:', rolesError);
    } else {
      console.log('\n✅ Roles do usuário:', roles);
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

checkAuth();