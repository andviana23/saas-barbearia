/**
 * Serviço de Notificações para Alertas
 * Integração com Slack, Email e outros canais de notificação
 */

import { CentralizedLogger } from '@/lib/logging/centralized-logger';

export interface NotificationChannel {
  type: 'slack' | 'email' | 'webhook';
  enabled: boolean;
  config: Record<string, any>;
}

export interface AlertNotification {
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: string;
  component?: string;
  actionUrl?: string;
}

export class AlertNotificationService {
  private static instance: AlertNotificationService;
  private logger = CentralizedLogger.getInstance();
  private channels: NotificationChannel[] = [];

  constructor() {
    this.initializeChannels();
  }

  static getInstance(): AlertNotificationService {
    if (!AlertNotificationService.instance) {
      AlertNotificationService.instance = new AlertNotificationService();
    }
    return AlertNotificationService.instance;
  }

  private initializeChannels(): void {
    // Configurar canais baseado em variáveis de ambiente
    if (process.env.SLACK_WEBHOOK_URL) {
      this.channels.push({
        type: 'slack',
        enabled: true,
        config: {
          webhookUrl: process.env.SLACK_WEBHOOK_URL,
          channel: process.env.SLACK_ALERT_CHANNEL || '#alerts',
          username: process.env.SLACK_BOT_NAME || 'Trato Alerts',
        },
      });
    }

    if (process.env.ALERT_EMAIL_TO) {
      this.channels.push({
        type: 'email',
        enabled: true,
        config: {
          to: process.env.ALERT_EMAIL_TO,
          from: process.env.ALERT_EMAIL_FROM || 'alerts@trato.com.br',
          smtp: {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          },
        },
      });
    }

    if (process.env.ALERT_WEBHOOK_URL) {
      this.channels.push({
        type: 'webhook',
        enabled: true,
        config: {
          url: process.env.ALERT_WEBHOOK_URL,
          headers: process.env.ALERT_WEBHOOK_HEADERS
            ? JSON.parse(process.env.ALERT_WEBHOOK_HEADERS)
            : {},
        },
      });
    }
  }

  async sendAlertNotification(notification: AlertNotification): Promise<void> {
    this.logger.info('Sending alert notification', {
      operation: 'sendAlertNotification',
      component: 'AlertNotificationService',
      metadata: {
        severity: notification.severity,
        metric: notification.metric,
        value: notification.value,
        threshold: notification.threshold,
      },
    });

    // Enviar para todos os canais habilitados
    const promises = this.channels
      .filter((channel) => channel.enabled)
      .map((channel) => this.sendToChannel(channel, notification));

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      this.logger.error('Failed to send alert notifications', {
        operation: 'sendAlertNotification',
        component: 'AlertNotificationService',
        error: error as Error,
      });
    }
  }

  private async sendToChannel(
    channel: NotificationChannel,
    notification: AlertNotification,
  ): Promise<void> {
    try {
      switch (channel.type) {
        case 'slack':
          await this.sendSlackNotification(channel, notification);
          break;
        case 'email':
          await this.sendEmailNotification(channel, notification);
          break;
        case 'webhook':
          await this.sendWebhookNotification(channel, notification);
          break;
      }
    } catch (error) {
      this.logger.error(`Failed to send notification to ${channel.type}`, {
        operation: 'sendToChannel',
        component: 'AlertNotificationService',
        metadata: { channelType: channel.type },
        error: error as Error,
      });
    }
  }

  private async sendSlackNotification(
    channel: NotificationChannel,
    notification: AlertNotification,
  ): Promise<void> {
    const { webhookUrl, channel: slackChannel, username } = channel.config;

    const color = this.getSlackColor(notification.severity);
    const emoji = this.getSeverityEmoji(notification.severity);

    const payload = {
      channel: slackChannel,
      username,
      attachments: [
        {
          color,
          fields: [
            {
              title: `${emoji} ${notification.title}`,
              value: notification.message,
              short: false,
            },
            {
              title: 'Métrica',
              value: notification.metric,
              short: true,
            },
            {
              title: 'Valor Atual',
              value: notification.value.toString(),
              short: true,
            },
            {
              title: 'Threshold',
              value: notification.threshold.toString(),
              short: true,
            },
            {
              title: 'Componente',
              value: notification.component || 'Sistema',
              short: true,
            },
            {
              title: 'Horário',
              value: new Date(notification.timestamp).toLocaleString('pt-BR'),
              short: true,
            },
          ],
          footer: 'Trato Alert System',
          ts: Math.floor(new Date(notification.timestamp).getTime() / 1000),
        },
      ],
    };

    if (notification.actionUrl) {
      payload.attachments[0].actions = [
        {
          type: 'button',
          text: 'Ver Detalhes',
          url: notification.actionUrl,
          style: 'primary',
        },
      ];
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.statusText}`);
    }
  }

  private async sendEmailNotification(
    channel: NotificationChannel,
    notification: AlertNotification,
  ): Promise<void> {
    // Implementação simplificada - em produção usar um serviço de email como SendGrid
    this.logger.info('Email notification would be sent', {
      operation: 'sendEmailNotification',
      component: 'AlertNotificationService',
      metadata: {
        to: channel.config.to,
        subject: `[${notification.severity.toUpperCase()}] ${notification.title}`,
        message: notification.message,
      },
    });

    // Aqui você implementaria o envio real de email
    // usando SendGrid, AWS SES, ou outro serviço
  }

  private async sendWebhookNotification(
    channel: NotificationChannel,
    notification: AlertNotification,
  ): Promise<void> {
    const { url, headers } = channel.config;

    const payload = {
      alert: notification,
      metadata: {
        service: 'trato-alerts',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook notification failed: ${response.statusText}`);
    }
  }

  private getSlackColor(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'good';
      default:
        return '#808080';
    }
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📊';
    }
  }

  // Métodos utilitários para testes
  async testSlackConnection(): Promise<boolean> {
    const slackChannel = this.channels.find((c) => c.type === 'slack');
    if (!slackChannel) return false;

    try {
      await this.sendSlackNotification(slackChannel, {
        severity: 'info',
        title: 'Teste de Conexão',
        message: 'Conexão com Slack estabelecida com sucesso!',
        metric: 'system.test',
        value: 1,
        threshold: 0,
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch {
      return false;
    }
  }
}

// Exportar instância singleton para uso geral
export const alertNotificationService = AlertNotificationService.getInstance();
