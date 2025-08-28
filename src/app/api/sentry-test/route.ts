import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Lança um erro para teste
    const error = new Error('Sentry server test error');

    // Captura o erro com Sentry antes de retornar
    Sentry.captureException(error);

    // Retorna resposta de erro
    return new Response('server error captured', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    // Fallback caso algo dê errado
    Sentry.captureException(error);
    return new Response('unexpected server error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
