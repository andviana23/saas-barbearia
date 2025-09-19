// Script para debugar autenticação com login simulado
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Usar anon key para login
);

async function checkAuthWithLogin() {
  console.log('=== Debug de Autenticação com Login ===');
  
  try {
    // 1. Fazer login com as credenciais do .env.test
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'andrey@tratodebarbados.com.br',
      password: 'senha123'
    });
    
    if (loginError) {
      console.error('❌ Erro ao fazer login:', loginError);
      return;
    }
    
    console.log('✅ Login realizado com sucesso');
    console.log('User ID:', loginData.user.id);
    console.log('Email:', loginData.user.email);
    
    // 2. Verificar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', loginData.user.id)
      .single();
      
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
    } else {
      console.log('✅ Perfil encontrado:', profile.full_name, '-', profile.role);
    }
    
    // 3. Verificar unidades que o usuário tem acesso
    const { data: units, error: unitsError } = await supabase
      .from('unit_members')
      .select('*, units(*)')
      .eq('user_id', loginData.user.id);
      
    if (unitsError) {
      console.error('❌ Erro ao buscar unidades:', unitsError);
    } else {
      console.log('✅ Unidades do usuário:', units.length);
      
      // 4. Testar acesso a dados para cada unidade
      for (const unit of units) {
        console.log(`\n--- Testando acesso na unidade ${unit.units.name} (${unit.unit_id}) ---`);
        
        // Testar appointments
        const { data: appointments, error: apptError } = await supabase
          .from('appointments')
          .select('id, status, created_at')
          .eq('unit_id', unit.unit_id)
          .gte('created_at', '2025-08-18T20:01:46.088Z')
          .lte('created_at', '2025-09-17T20:01:46.088Z')
          .limit(1);
          
        if (apptError) {
          console.log(`❌ Erro ao buscar appointments:`, apptError.message);
          console.log(`   Código: ${apptError.code}, Detalhes:`, apptError.details);
        } else {
          console.log(`✅ Appointments acessíveis: ${appointments.length} registros`);
        }
        
        // Testar cashbox_transactions
        const { data: cashbox, error: cashboxError } = await supabase
          .from('cashbox_transactions')
          .select('id, amount_cents, type')
          .eq('unit_id', unit.unit_id)
          .gte('created_at', '2025-08-18T20:01:46.088Z')
          .lte('created_at', '2025-09-17T20:01:46.088Z')
          .limit(1);
          
        if (cashboxError) {
          console.log(`❌ Erro ao buscar cashbox_transactions:`, cashboxError.message);
          console.log(`   Código: ${cashboxError.code}, Detalhes:`, cashboxError.details);
        } else {
          console.log(`✅ Cashbox transactions acessíveis: ${cashbox.length} registros`);
        }
        
        // Testar appointment_services
        const { data: apptServices, error: apptServicesError } = await supabase
          .from('appointment_services')
          .select('id, appointment_id, service_id')
          .eq('unit_id', unit.unit_id)
          .gte('appointments.created_at', '2025-08-18T20:01:46.088Z')
          .lte('appointments.created_at', '2025-09-17T20:01:46.088Z')
          .limit(1);
          
        if (apptServicesError) {
          console.log(`❌ Erro ao buscar appointment_services:`, apptServicesError.message);
          console.log(`   Código: ${apptServicesError.code}, Detalhes:`, apptServicesError.details);
        } else {
          console.log(`✅ Appointment services acessíveis: ${apptServices.length} registros`);
        }
      }
    }
    
    // 5. Verificar roles do usuário
    const { data: roles, error: rolesError } = await supabase
      .from('role_assignments')
      .select('*, roles(*)')
      .eq('user_id', loginData.user.id);
      
    if (rolesError) {
      console.error('❌ Erro ao buscar roles:', rolesError);
    } else {
      console.log('\n✅ Roles do usuário:', roles.map(r => r.roles.name));
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkAuthWithLogin();