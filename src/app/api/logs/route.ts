import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET /api/logs - Retorna logs simples para teste
export async function GET(request: NextRequest) {
  try {
    // Validação simples para desenvolvimento
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Para desenvolvimento, aceitar chave de teste
    if (process.env.NODE_ENV === 'development' && token !== 'test-key') {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Logs de exemplo para teste
    const logs = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Sistema de monitoramento iniciado',
        context: { service: 'monitoring' },
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: 'warn',
        message: 'Alerta de performance detectado',
        context: { service: 'alerts', metric: 'responseTime' },
      },
    ];

    return NextResponse.json({
      status: 'success',
      logs,
      count: logs.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao obter logs:', error);
    return NextResponse.json({ error: 'Erro interno ao obter logs' }, { status: 500 });
  }
}

// POST /api/logs - Criar novo log (para testes)
export async function POST(request: NextRequest) {
  try {
    // Validação simples para desenvolvimento
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Para desenvolvimento, aceitar chave de teste
    if (process.env.NODE_ENV === 'development' && token !== 'test-key') {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const body = await request.json();
    const { level, message, context } = body;

    if (!level || !message) {
      return NextResponse.json({ error: 'Level e message são obrigatórios' }, { status: 400 });
    }

    // Simular criação de log
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context || {},
    };

    return NextResponse.json({
      status: 'success',
      message: 'Log criado com sucesso',
      log: newLog,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao criar log:', error);
    return NextResponse.json({ error: 'Erro interno ao criar log' }, { status: 500 });
  }
}
