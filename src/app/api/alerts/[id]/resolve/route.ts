/**
 * Endpoint para resolver alertas específicos
 * Permite marcar alertas como resolvidos
 */

import { NextRequest, NextResponse } from 'next/server';
import { AlertManager } from '@/lib/monitoring/alert-manager';
import { CentralizedLogger } from '@/lib/monitoring/centralized-logger';

const alertManager = new AlertManager();
const logger = new CentralizedLogger('alerts-resolve-api');

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alert ID is required',
        },
        { status: 400 },
      );
    }

    logger.info('Resolving alert', { alertId: id });

    const resolved = alertManager.resolveAlert(id);

    if (!resolved) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alert not found or already resolved',
        },
        { status: 404 },
      );
    }

    logger.info('Alert resolved successfully', { alertId: id });

    return NextResponse.json({
      success: true,
      message: 'Alert resolved successfully',
      alertId: id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error resolving alert', {
      error: error instanceof Error ? error.message : 'Unknown error',
      alertId: params?.id,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to resolve alert',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
