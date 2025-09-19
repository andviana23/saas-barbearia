export interface AsaasWebhookEvent {
  id: string;
  event: string;
  dateCreated: string;
  subscription?: { id: string };
  payment?: { id: string };
  [k: string]: unknown;
}

export interface WebhookProcessResult {
  success: boolean;
  error?: string;
  alreadyProcessed?: boolean;
}
