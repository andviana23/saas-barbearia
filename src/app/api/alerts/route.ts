import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/centralized-logger';

/**
 * Endpoint de Alertas e Notificações
 * Gerencia sistema de alertas baseado em thresholds
 */

interface AlertThreshold {
  metric: string;
  threshold: number;
  operator: '>' | '<' | '=' | '>=' | '<=';
  severity: 'info' | 'warning' | 'critical';
  window: string; // 1m, 5m, 1h, 1d
  message: string;
}

const ALERT_THRESHOLDS: AlertThreshold[] = [
  // Performance
  {
    metric: 'api.responseTime',
    threshold: 2000, // 2 segundos
    operator: '>',
    severity: 'warning',
    window: '5m',
    message: 'Tempo de resposta da API acima de 2 segundos',
  },
  {
    metric: 'api.responseTime',
    threshold: 5000, // 5 segundos
    operator: '>',
    severity: 'critical',
    window: '1m',
    message: 'Tempo de resposta da API crítico - acima de 5 segundos',
  },
  {
    metric: 'database.avgQueryTime',
    threshold: 1000, // 1 segundo
    operator: '>',
    severity: 'warning',
    window: '5m',
    message: 'Tempo médio de consulta ao banco acima de 1 segundo',
  },

  // Erros
  {
    metric: 'errors.errorRate',
    threshold: 0.05, // 5%
    operator: '>',
    severity: 'warning',
    window: '5m',
    message: 'Taxa de erro acima de 5%',
  },
  {
    metric: 'errors.errorRate',
    threshold: 0.1, // 10%
    operator: '>',
    severity: 'critical',
    window: '1m',
    message: 'Taxa de erro crítica - acima de 10%',
  },

  // Negócio
  {
    metric: 'appointments.noShowRate',
    threshold: 0.15, // 15%
    operator: '>',
    severity: 'warning',
    window: '1d',
    message: 'Taxa de no-show acima de 15%',
  },
  {
    metric: 'customers.retentionRate',
    threshold: 0.7, // 70%
    operator: '<',
    severity: 'warning',
    window: '7d',
    message: 'Taxa de retenção abaixo de 70%',
  },

  // Sistema
  {
    metric: 'system.memory.heapUsed',
    threshold: 0.8, // 80%
    operator: '>',
    severity: 'warning',
    window: '1m',
    message: 'Uso de memória heap acima de 80%',
  },
  {
    metric: 'system.memory.heapUsed',
    threshold: 0.9, // 90%
    operator: '>',
    severity: 'critical',
    window: '1m',
    message: 'Uso de memória heap crítico - acima de 90%',
  },
];

interface Alert {
  id: string;
  metric: string;
  value: number;
  threshold: AlertThreshold;
  timestamp: string;
  status: 'active' | 'resolved';
}

class AlertManager {
  private static instance: AlertManager;
  private alerts: Alert[] = [];
  private logger = logger;

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  checkMetric(metric: string, value: number): Alert[] {
    const triggeredAlerts: Alert[] = [];

    ALERT_THRESHOLDS.forEach((threshold) => {
      if (threshold.metric === metric) {
        const triggered = this.evaluateThreshold(value, threshold);

        if (triggered) {
          const alert: Alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            metric,
            value,
            threshold,
            timestamp: new Date().toISOString(),
            status: 'active',
          };

          this.alerts.push(alert);
          triggeredAlerts.push(alert);

          // Log do alerta
          this.logger.warn(`Alert triggered: ${threshold.message}`, {
            component: 'AlertManager',
            operation: 'checkMetric',
            metadata: {
              metric,
              value,
              threshold: threshold.threshold,
              severity: threshold.severity,
            },
          });

          // Notificar se for crítico
          if (threshold.severity === 'critical') {
            this.notifyCriticalAlert(alert);
          }
        }
      }
    });

    return triggeredAlerts;
  }

  private evaluateThreshold(value: number, threshold: AlertThreshold): boolean {
    switch (threshold.operator) {
      case '>':
        return value > threshold.threshold;
      case '<':
        return value < threshold.threshold;
      case '=':
        return value === threshold.threshold;
      case '>=':
        return value >= threshold.threshold;
      case '<=':
        return value <= threshold.threshold;
      default:
        return false;
    }
  }

  private async notifyCriticalAlert(alert: Alert): Promise<void> {
    this.logger.critical(`ALERT: ${alert.metric} - ${alert.threshold.message}`, {
      operation: 'notifyCriticalAlert',
      component: 'AlertManager',
      metadata: {
        alertId: alert.id,
        severity: alert.threshold.severity,
        value: alert.value,
        threshold: alert.threshold,
      },
    });

    // Enviar notificação para canais configurados
    try {
      const { alertNotificationService } = await import('@/lib/monitoring/alert-notifications');

      await alertNotificationService.sendAlertNotification({
        severity: alert.threshold.severity,
        title: alert.threshold.message,
        message: alert.threshold.message,
        metric: alert.metric,
        value: alert.value,
        threshold: alert.threshold.threshold,
        timestamp: alert.timestamp,
        component: alert.metric.split('.')[0],
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/monitoring/alerts/${alert.id}`,
      });
    } catch (error) {
      this.logger.error('Failed to send alert notification', {
        operation: 'notifyCriticalAlert',
        component: 'AlertManager',
        error: error as Error,
      });
    }
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter((alert) => alert.status === 'active');
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';

      this.logger.info(`Alert resolved: ${alert.threshold.message}`, {
        component: 'AlertManager',
        operation: 'resolveAlert',
        metadata: { alertId },
      });

      return true;
    }
    return false;
  }
}

// Instância global do AlertManager (usando singleton)
const alertManager = AlertManager.getInstance();

export { AlertManager };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metric, value, checkAlerts = true } = body;

    if (!metric || value === undefined) {
      return NextResponse.json({ error: 'metric and value are required' }, { status: 400 });
    }

    let triggeredAlerts: Alert[] = [];

    if (checkAlerts) {
      triggeredAlerts = alertManager.checkMetric(metric, value);
    }

    return NextResponse.json({
      status: 'success',
      metric,
      value,
      alertsTriggered: triggeredAlerts.length,
      alerts: triggeredAlerts,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const activeAlerts = alertManager.getActiveAlerts();

    return NextResponse.json({
      status: 'success',
      alerts: activeAlerts,
      count: activeAlerts.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
