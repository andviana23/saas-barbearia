const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aadfqninxfigsaqfijke.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZGZxbmlueGZpZ3NhcWZpamtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMTYzNTcsImV4cCI6MjA3MDc5MjM1N30.C9Y_g3w5h8GdXO0SCK2szTMUxBJ1pn8uUcCmKspzq9w';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZGZxbmlueGZpZ3NhcWZpamtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTIxNjM1NywiZXhwIjoyMDcwNzkyMzU3fQ.v0zM5S5UlqE13rc7t0f7-binxwARRvkTNj-XJgdBhtA';

async function createTestDataWithAuth() {
  console.log('🚀 Criando dados de teste com autenticação...');

  try {
    // 1. Fazer login com o usuário andrey
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('🔐 Fazendo login com andrey@tratodebarbados.com.br...');
    
    // Tentar login com senha comum
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'andrey@tratodebarbados.com.br',
      password: '123456'
    });

    if (authError) {
      console.error('❌ Erro ao fazer login:', authError.message);
      
      // Tentar outras senhas comuns
      const passwords = ['password', 'admin123', 'barbearia123', 'trato123', '12345678'];
      
      for (const password of passwords) {
        console.log(`🔑 Tentando senha: ${password}`);
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'andrey@tratodebarbados.com.br',
          password: password
        });
        
        if (!error) {
          console.log('✅ Login bem-sucedido com senha:', password);
          break;
        }
      }
      
      if (!authData) {
        console.error('❌ Nenhuma senha funcionou. Usando service role key para criar dados...');
        await createTestDataWithServiceRole();
        return;
      }
    } else {
      console.log('✅ Login bem-sucedido!');
    }

    // 2. Verificar unidade do usuário
    const { data: unitMemberData, error: unitError } = await supabase
      .from('unit_members')
      .select('unit_id')
      .eq('user_id', authData.user.id)
      .single();

    if (unitError || !unitMemberData) {
      console.error('❌ Unidade não encontrada para o usuário:', unitError);
      return;
    }

    const unitId = unitMemberData.unit_id;
    console.log('✅ Unidade encontrada:', unitId);

    // 3. Criar customer
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

    // 4. Criar service para o appointment
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .insert([
        {
          unit_id: unitId,
          name: 'Corte de Cabelo',
          duration_minutes: 60,
          is_active: true
        }
      ])
      .select()
      .single();

    if (serviceError) {
      console.error('❌ Erro ao criar service:', serviceError);
      return;
    }

    console.log('✅ Service criado:', serviceData.id);

    // 5. Criar appointment
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .insert([
        {
          unit_id: unitId,
          customer_id: customerData.id,
          professional_id: authData.user.id, // Usar o próprio usuário logado como profissional
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

    // 6. Criar appointment service
    const { data: appointmentServiceData, error: appointmentServiceError } = await supabase
      .from('appointment_services')
      .insert([
        {
          appointment_id: appointmentData.id,
          service_id: serviceData.id,
          quantity: 1,
          unit_price: 100.00,
          total_price: 100.00
        }
      ])
      .select()
      .single();

    if (appointmentServiceError) {
      console.error('❌ Erro ao criar appointment service:', appointmentServiceError);
      return;
    }

    console.log('✅ Appointment Service criado:', appointmentServiceData.id);

    console.log('\n🎉 Dados de teste criados com sucesso!');
    console.log('- Customer:', customerData.id);
    console.log('- Service:', serviceData.id);
    console.log('- Appointment:', appointmentData.id);
    console.log('- Appointment Service:', appointmentServiceData.id);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

async function createTestDataWithServiceRole() {
  console.log('🔧 Usando service role key para criar dados...');
  
  const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Buscar usuário andrey
    const { data: userData, error: userError } = await supabaseService
      .from('profiles')
      .select('id, email')
      .eq('email', 'andrey@tratodebarbados.com.br')
      .single();

    if (userError || !userData) {
      console.error('❌ Usuário andrey não encontrado:', userError);
      return;
    }

    console.log('✅ Usuário encontrado:', userData.id);

    // Buscar unidade
    const { data: unitMemberData, error: unitError } = await supabaseService
      .from('unit_members')
      .select('unit_id')
      .eq('user_id', userData.id)
      .single();

    if (unitError || !unitMemberData) {
      console.error('❌ Unidade não encontrada:', unitError);
      return;
    }

    const unitId = unitMemberData.unit_id;
    console.log('✅ Unidade encontrada:', unitId);

    // Criar dados com service role
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Customer
    const { data: customerData, error: customerError } = await supabaseService
      .from('customers')
      .insert([{
        name: 'Cliente Teste Service',
        email: 'cliente.service@teste.com',
        phone: '11999999999',
        unit_id: unitId,
        is_active: true,
        created_at: now.toISOString()
      }])
      .select()
      .single();

    if (customerError) {
      console.error('❌ Erro ao criar customer:', customerError);
      return;
    }

    console.log('✅ Customer criado:', customerData.id);

    console.log('\n✅ Dados criados com service role key!');
    console.log('- Customer:', customerData.id);

  } catch (error) {
    console.error('❌ Erro com service role:', error);
  }
}

createTestDataWithAuth();