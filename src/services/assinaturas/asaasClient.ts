// Usa fetch nativo (Node 18+ / Next.js). Se precisar de polyfill, adicionar em jest.setup.

export interface AsaasClientConfig {
  apiKey: string;
  baseUrl?: string;
}

export class AsaasClient {
  private apiKey: string;
  private baseUrl: string;
  constructor(cfg: AsaasClientConfig) {
    this.apiKey = cfg.apiKey;
    this.baseUrl = cfg.baseUrl || 'https://api.asaas.com/v3';
  }

  private headers() {
    return {
      'Content-Type': 'application/json',
      'User-Agent': 'Trato-SaaS-Barbearia/1.0',
      access_token: this.apiKey,
    };
  }

  async getSubscription(id: string) {
    const res = await fetch(`${this.baseUrl}/subscriptions/${id}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`ASAAS getSubscription failed ${res.status}`);
    return res.json();
  }
}
