const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aadfqninxfigsaqfijke.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZGZxbmlueGZpZ3NhcWZpamtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTIxNjM1NywiZXhwIjoyMDcwNzkyMzU3fQ.v0zM5S5UlqE13rc7t0f7-binxwARRvkTNj-XJgdBhtA';

async function createTestDataWithServiceRole() {
  console.log('🔧 Criando dados de teste com service role key...');
  
  const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Dados do usuário andrey
    const userId = '79ea3d72-e17b-45bd-956a-f3605da43b23';
    const unitId = '11111111-2222-3333-4444-555555555555';
    
    console.log('✅ Usuário andrey encontrado:', userId);
    console.log('✅ Unidade encontrada:', unitId);

    // 1. Criar customer
    const { data: customerData, error: customerError } = await supabaseService
      .from('customers')
      .insert([{
        name: 'Cliente Teste',
        email: 'cliente.teste@example.com',
        phone: '11999999999',
        unit_id: unitId,
        is_active: true,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (customerError) {
      console.error('❌ Erro ao criar customer:', customerError);
      return;
    }

    console.log('✅ Customer criado:', customerData.id);

    // 2. Buscar ou criar service
    let serviceData;
    
    // Primeiro tentar buscar um service existente
    const { data: existingService } = await supabaseService
      .from('services')
      .select('id')
      .eq('unit_id', unitId)
      .eq('name', 'Corte de Cabelo')
      .single();
    
    if (existingService) {
      serviceData = existingService;
      console.log('✅ Service já existente encontrado:', serviceData.id);
    } else {
      // Se não existir, criar novo
      const { data: newService, error: serviceError } = await supabaseService
        .from('services')
        .insert([{
          unit_id: unitId,
          name: 'Corte de Cabelo',
          duration_minutes: 60,
          is_active: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (serviceError) {
        console.error('❌ Erro ao criar service:', serviceError);
        return;
      }
      
      serviceData = newService;
      console.log('✅ Service criado:', serviceData.id);
    }



    // 3. Criar appointment (aqui é onde dava erro de permissão)
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const endTime = new Date(tomorrow.getTime() + 60 * 60 * 1000);
    
    const { data: appointmentData, error: appointmentError } = await supabaseService
      .from('appointments')
      .insert([{
        unit_id: unitId,
        customer_id: customerData.id,
        professional_id: userId, // Usar o próprio andrey como profissional
        start_time: tomorrow.toISOString(),
        end_time: endTime.toISOString(),
        status: 'scheduled',
        source: 'manual',
        total_price: 100.00,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }])
      .select()
      .single();

    if (appointmentError) {
      console.error('❌ Erro ao criar appointment:', appointmentError);
      console.error('Detalhes do erro:', JSON.stringify(appointmentError, null, 2));
      return;
    }

    console.log('✅ Appointment criado:', appointmentData.id);

    // 4. Criar appointment service
    const { data: appointmentServiceData, error: appointmentServiceError } = await supabaseService
      .from('appointment_services')
      .insert([{
        appointment_id: appointmentData.id,
        service_id: serviceData.id,
        quantity: 1,
        unit_price: 100.00,
        total_price: 100.00
      }])
      .select()
      .single();

    if (appointmentServiceError) {
      console.error('❌ Erro ao criar appointment service:', appointmentServiceError);
      return;
    }

    console.log('✅ Appointment Service criado:', appointmentServiceData.id);

    // 5. Criar professional service (relacionamento entre profissional e serviço)
    const { data: professionalServiceData, error: professionalServiceError } = await supabaseService
      .from('professional_services')
      .insert([{
        service_id: serviceData.id,
        professional_id: userId,
        unit_id: unitId,
        is_active: true,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (professionalServiceError) {
      console.error('❌ Erro ao criar professional service:', professionalServiceError);
      return;
    }

    console.log('✅ Professional Service criado:', professionalServiceData.id);

    console.log('\n🎉 Todos os dados de teste criados com sucesso!');
    console.log('📋 Resumo:');
    console.log('  - Customer:', customerData.id);
    console.log('  - Service:', serviceData.id);
    console.log('  - Appointment:', appointmentData.id);
    console.log('  - Appointment Service:', appointmentServiceData.id);
    console.log('  - Professional Service:', professionalServiceData.id);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createTestDataWithServiceRole();