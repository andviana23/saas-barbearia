/**
 * Testes para o serviço de notificações de alerta
 */

import { AlertNotificationService } from '@//lib/monitoring/alert-notifications';

// Mock do fetch global
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// Mock do logger
jest.mock('@/lib/logging/centralized-logger', () => ({
  CentralizedLogger: {
    getInstance: () => ({
      info: jest.fn(),
      error: jest.fn(),
      critical: jest.fn(),
    }),
  },
}));

describe('AlertNotificationService', () => {
  let service: AlertNotificationService;

  beforeEach(() => {
    mockFetch.mockClear();
    jest.clearAllMocks();

    // Limpar variáveis de ambiente
    delete process.env.SLACK_WEBHOOK_URL;
    delete process.env.ALERT_WEBHOOK_URL;
    delete process.env.ALERT_EMAIL_TO;

    // Criar nova instância para cada teste
    service = new AlertNotificationService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic functionality', () => {
    it('should be created successfully', () => {
      expect(service).toBeDefined();
    });

    it('should not throw when sending notification with no channels configured', async () => {
      const notification = {
        severity: 'info' as const,
        title: 'Test Notification',
        message: 'Test message',
        metric: 'system.test',
        value: 50,
        threshold: 100,
        timestamp: new Date().toISOString(),
      };

      await expect(service.sendAlertNotification(notification)).resolves.not.toThrow();
    });
  });

  describe('Slack notifications', () => {
    beforeEach(() => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';
      process.env.SLACK_ALERT_CHANNEL = '#alerts';
      process.env.SLACK_BOT_NAME = 'Test Bot';

      // Recriar serviço com novas variáveis de ambiente
      service = new AlertNotificationService();
    });

    it('should send Slack notification successfully', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const notification = {
        severity: 'critical' as const,
        title: 'Critical Alert',
        message: 'Critical system error',
        metric: 'system.error',
        value: 1,
        threshold: 0,
        timestamp: new Date().toISOString(),
        component: 'System',
      };

      await service.sendAlertNotification(notification);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/test',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.channel).toBe('#alerts');
      expect(callBody.username).toBe('Test Bot');
      expect(callBody.attachments[0].color).toBe('danger');
    });

    it('should handle Slack webhook failure gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Slack webhook failed'));

      const notification = {
        severity: 'warning' as const,
        title: 'Warning Alert',
        message: 'System warning',
        metric: 'system.warning',
        value: 75,
        threshold: 70,
        timestamp: new Date().toISOString(),
      };

      // Should not throw even if Slack fails
      await expect(service.sendAlertNotification(notification)).resolves.not.toThrow();
    });
  });

  describe('Webhook notifications', () => {
    beforeEach(() => {
      process.env.ALERT_WEBHOOK_URL = 'https://api.example.com/alerts';
      process.env.ALERT_WEBHOOK_HEADERS = '{"Authorization": "Bearer token123"}';

      // Recriar serviço com novas variáveis de ambiente
      service = new AlertNotificationService();
    });

    it('should send webhook notification successfully', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const notification = {
        severity: 'info' as const,
        title: 'Info Alert',
        message: 'System info',
        metric: 'system.info',
        value: 50,
        threshold: 100,
        timestamp: new Date().toISOString(),
        component: 'System',
      };

      await service.sendAlertNotification(notification);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/alerts',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer token123',
          }),
        }),
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.alert).toEqual(notification);
      expect(callBody.metadata.service).toBe('trato-alerts');
    });
  });

  describe('Severity levels', () => {
    beforeEach(() => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';
      service = new AlertNotificationService();
    });

    it('should use correct colors and emojis for different severities', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      const severities = [
        { severity: 'critical', color: 'danger', emoji: '🚨' },
        { severity: 'warning', color: 'warning', emoji: '⚠️' },
        { severity: 'info', color: 'good', emoji: 'ℹ️' },
      ];

      for (const { severity, color, emoji } of severities) {
        mockFetch.mockClear();

        const notification = {
          severity: severity as any,
          title: `${severity} alert`,
          message: `This is a ${severity} alert`,
          metric: 'system.test',
          value: 50,
          threshold: 100,
          timestamp: new Date().toISOString(),
        };

        await service.sendAlertNotification(notification);

        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(callBody.attachments[0].color).toBe(color);
        expect(callBody.attachments[0].fields[0].title).toContain(emoji);
      }
    });
  });

  describe('testSlackConnection', () => {
    it('should return true when Slack connection succeeds', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';
      service = new AlertNotificationService();

      mockFetch.mockResolvedValue({ ok: true });

      const result = await service.testSlackConnection();

      expect(result).toBe(true);
    });

    it('should return false when Slack connection fails', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';
      service = new AlertNotificationService();

      mockFetch.mockRejectedValue(new Error('Connection failed'));

      const result = await service.testSlackConnection();

      expect(result).toBe(false);
    });

    it('should return false when no Slack webhook is configured', async () => {
      delete process.env.SLACK_WEBHOOK_URL;
      service = new AlertNotificationService();

      const result = await service.testSlackConnection();

      expect(result).toBe(false);
    });
  });
});
