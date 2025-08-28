// Pequena action para POC de cobertura
'use server';

export async function ping(value: string = 'ok'): Promise<string> {
  if (!value) {
    throw new Error('valor vazio');
  }
  return `pong:${value}`;
}
