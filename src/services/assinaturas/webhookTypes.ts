export interface AsaasWebhookEvent {
  id: string;
  event: string;
  dateCreated: string;
  subscription?: { id: string };
  payment?: { id: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any;
}

export interface WebhookProcessResult {
  success: boolean;
  error?: string;
  alreadyProcessed?: boolean;
}
