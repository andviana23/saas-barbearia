const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://aadfqninxfigsaqfijke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZGZxbmlueGZpZ3NhcWZpamtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTIxNjM1NywiZXhwIjoyMDcwNzkyMzU3fQ.v0zM5S5UlqE13rc7t0f7-binxwARRvkTNj-XJgdBhtA'
);

async function createTestData() {
  console.log('🚀 Criando dados de teste...');

  try {
    // 1. Buscar informações do usuário andrey
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'andrey@tratodebarbados.com.br')
      .single();

    if (userError || !userData) {
      console.error('❌ Usuário andrey não encontrado:', userError);
      return;
    }

    console.log('✅ Usuário encontrado:', userData.id);

    // 2. Buscar unidade do usuário
    let unitId;
    const { data: unitMemberData, error: unitError } = await supabase
      .from('unit_members')
      .select('unit_id')
      .eq('user_id', userData.id)
      .single();

    if (unitError || !unitMemberData) {
      console.log('⚠️  Unidade não encontrada para o usuário, criando associação...');
      
      // Buscar a unidade "Trato de Barbados"
      const { data: unitData, error: unitSearchError } = await supabase
        .from('units')
        .select('id')
        .eq('name', 'Trato de Barbados')
        .single();

      if (unitSearchError || !unitData) {
        console.error('❌ Unidade "Trato de Barbados" não encontrada:', unitSearchError);
        return;
      }

      unitId = unitData.id;

      // Criar associação na unit_members
      const { error: createUnitMemberError } = await supabase
        .from('unit_members')
        .insert([
          {
            unit_id: unitId,
            user_id: userData.id,
            is_active: true
          }
        ]);

      if (createUnitMemberError) {
        console.error('❌ Erro ao criar associação na unit_members:', createUnitMemberError);
        return;
      }

      console.log('✅ Associação criada com sucesso');
    } else {
      unitId = unitMemberData.unit_id;
      console.log('✅ Unidade encontrada:', unitId);
    }

    // 3. Criar um customer de teste
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert([
        {
          name: 'Cliente Teste',
          email: 'cliente@teste.com',
          phone: '11999999999',
          unit_id: unitId,
          is_active: true,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (customerError) {
      console.error('❌ Erro ao criar customer:', customerError);
      return;
    }

    console.log('✅ Customer criado:', customerData.id);

    // 4. Criar um profile de professional de teste
    const { data: professionalProfile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: '00000000-0000-0000-0000-000000000001', // ID fictício para o profissional
          name: 'Profissional Teste',
          email: 'profissional@teste.com',
          phone: '11888888888',
          unit_default_id: unitId,
          role: 'professional',
          is_active: true,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error('❌ Erro ao criar profile do professional:', profileError);
      return;
    }

    console.log('✅ Profile de Professional criado:', professionalProfile.id);

    // 5. Criar role assignment para o professional
    const { data: roleData, error: roleError } = await supabase
      .from('role_assignments')
      .insert([
        {
          user_id: professionalProfile.user_id,
          unit_id: unitId,
          role_id: '04e48863-1db8-4d81-8cdb-3cb8402eec6f', // ID do role 'professional'
          is_active: true,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (roleError) {
      console.error('❌ Erro ao criar role assignment:', roleError);
      return;
    }

    console.log('✅ Role assignment criado:', roleData.id);

    // 6. Criar um appointment de teste
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .insert([
        {
          unit_id: unitId,
          customer_id: customerData.id,
          professional_id: professionalProfile.user_id,
          start_time: tomorrow.toISOString(),
          end_time: new Date(tomorrow.getTime() + 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          source: 'manual',
          total_price: 100.00
        }
      ])
      .select()
      .single();

    if (appointmentError) {
      console.error('❌ Erro ao criar appointment:', appointmentError);
      return;
    }

    console.log('✅ Appointment criado:', appointmentData.id);

    // 7. Criar um cashbox de teste
    const { data: cashboxData, error: cashboxError } = await supabase
      .from('cashboxes')
      .insert([
        {
          unit_id: unitId,
          name: 'Caixa Principal',
          is_active: true
        }
      ])
      .select()
      .single();

    if (cashboxError) {
      console.error('❌ Erro ao criar cashbox:', cashboxError);
      return;
    }

    console.log('✅ Cashbox criado:', cashboxData.id);

    // 8. Criar um cashbox_session de teste
    const { data: sessionData, error: sessionError } = await supabase
      .from('cashbox_sessions')
      .insert([
        {
          cashbox_id: cashboxData.id,
          opened_by: userData.id,
          opened_at: now.toISOString(),
          is_closed: false
        }
      ])
      .select()
      .single();

    if (sessionError) {
      console.error('❌ Erro ao criar cashbox session:', sessionError);
      return;
    }

    console.log('✅ Cashbox session criada:', sessionData.id);

    // 9. Criar uma cashbox_transaction de teste
    const { data: transactionData, error: transactionError } = await supabase
      .from('cashbox_transactions')
      .insert([
        {
          cashbox_session_id: sessionData.id,
          type: 'income',
          amount: 50.00,
          description: 'Pagamento de serviço',
          reference_type: 'appointment',
          reference_id: appointmentData.id,
          performed_by: userData.id,
          occurred_at: now.toISOString()
        }
      ])
      .select()
      .single();

    if (transactionError) {
      console.error('❌ Erro ao criar cashbox transaction:', transactionError);
      return;
    }

    console.log('✅ Cashbox transaction criada:', transactionData.id);

    console.log('\n🎉 Dados de teste criados com sucesso!');
    console.log('- Customer:', customerData.id);
    console.log('- Professional Profile:', professionalProfile.id);
    console.log('- Role Assignment:', roleData.id);
    console.log('- Appointment:', appointmentData.id);
    console.log('- Cashbox:', cashboxData.id);
    console.log('- Cashbox Session:', sessionData.id);
    console.log('- Cashbox Transaction:', transactionData.id);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createTestData();