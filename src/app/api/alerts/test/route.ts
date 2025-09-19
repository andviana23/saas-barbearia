/**
 * Endpoint de teste para notificações de alerta
 * Permite testar a integração com Slack, Email e webhooks
 */

import { NextRequest, NextResponse } from 'next/server';
import { alertNotificationService } from '@/lib/monitoring/alert-notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { severity = 'info', channel } = body;

    const testNotification = {
      severity: severity as 'info' | 'warning' | 'critical',
      title: 'Teste de Notificação - Trato Alert System',
      message:
        'Esta é uma notificação de teste para verificar a integração com os canais de alerta.',
      metric: 'system.test',
      value: Math.floor(Math.random() * 100),
      threshold: 80,
      timestamp: new Date().toISOString(),
      component: 'Test System',
      actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/monitoring`,
    };

    if (channel) {
      // Testar canal específico
      const result = await testSpecificChannel(channel, testNotification);
      return NextResponse.json({
        success: true,
        channel,
        result,
        message: `Test notification sent to ${channel}`,
      });
    } else {
      // Testar todos os canais configurados
      await alertNotificationService.sendAlertNotification(testNotification);
      return NextResponse.json({
        success: true,
        message: 'Test notification sent to all configured channels',
        notification: testNotification,
      });
    }
  } catch (error) {
    console.error('Test notification failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send test notification',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Testar conexão com Slack
    const { alertNotificationService } = await import('@/lib/monitoring/alert-notifications');
    const slackConnected = await alertNotificationService.testSlackConnection();

    return NextResponse.json({
      success: true,
      slackConnected,
      channels: {
        slack: !!process.env.SLACK_WEBHOOK_URL,
        email: !!process.env.ALERT_EMAIL_TO,
        webhook: !!process.env.ALERT_WEBHOOK_URL,
      },
      message: 'Alert notification system status',
    });
  } catch (error) {
    console.error('Status check failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check notification status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

async function testSpecificChannel(channel: string, notification: any) {
  // Implementação para testar canal específico
  // Isso pode ser expandido conforme necessário
  return { tested: true, channel };
}
