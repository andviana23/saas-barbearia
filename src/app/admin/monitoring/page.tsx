/**
 * Dashboard de Monitoramento e Observabilidade
 * Interface para visualizar métricas, alertas e saúde do sistema
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface Metrics {
  performance: {
    responseTime: number;
    cpuUsage: number;
    memoryUsage: number;
    activeConnections: number;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
    recent: Array<{
      timestamp: string;
      type: string;
      message: string;
      component: string;
    }>;
  };
  business: {
    totalAppointments: number;
    appointmentsToday: number;
    activeUsers: number;
    revenue: number;
    conversionRate: number;
  };
  system: {
    uptime: number;
    version: string;
    environment: string;
    databaseStatus: 'healthy' | 'degraded' | 'unhealthy';
    externalServices: Record<string, 'healthy' | 'degraded' | 'unhealthy'>;
  };
}

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: string;
  component: string;
  resolved: boolean;
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<
    'all' | 'performance' | 'business' | 'system' | 'health'
  >('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Buscar métricas
  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/metrics?type=${selectedMetric}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_METRICS_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data = await response.json();
      setMetrics(data.data);
      setAlerts(data.alerts ? data.alerts.active : []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar alertas ativos
  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  // Resolver alerta
  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchAlerts(); // Recarregar alertas
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  // Auto refresh
  useEffect(() => {
    fetchMetrics();
    fetchAlerts();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchMetrics();
        fetchAlerts();
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [selectedMetric, autoRefresh]);

  // Formatação de tempo
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Status badge
  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      healthy: {
        variant: 'default' as const,
        icon: <CheckCircle className="w-3 h-3" />,
        text: 'Healthy',
      },
      degraded: {
        variant: 'secondary' as const,
        icon: <AlertTriangle className="w-3 h-3" />,
        text: 'Degraded',
      },
      unhealthy: {
        variant: 'destructive' as const,
        icon: <XCircle className="w-3 h-3" />,
        text: 'Unhealthy',
      },
    };

    const config = variants[status as keyof typeof variants] || variants.healthy;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">Real-time system metrics and alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Last update: {lastUpdate.toLocaleTimeString()}</Badge>
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Clock className="w-4 h-4 mr-1" />
            Auto Refresh
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{alert.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{alert.component}</span>
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      <span>
                        {alert.metric}: {alert.value} (threshold: {alert.threshold})
                      </span>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <Button variant="outline" size="sm" onClick={() => resolveAlert(alert.id)}>
                      Resolve
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas por Categoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metrics?.performance && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Response Time</span>
                  <span>{metrics.performance.responseTime.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>CPU Usage</span>
                  <span>{metrics.performance.cpuUsage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Memory</span>
                  <span>{metrics.performance.memoryUsage.toFixed(0)}MB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Connections</span>
                  <span>{metrics.performance.activeConnections}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metrics?.business && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Appointments</span>
                  <span>{metrics.business.totalAppointments}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Today's Appointments</span>
                  <span>{metrics.business.appointmentsToday}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Users</span>
                  <span>{metrics.business.activeUsers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Conversion Rate</span>
                  <span>{(metrics.business.conversionRate * 100).toFixed(1)}%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metrics?.system && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <StatusBadge status={metrics.system.databaseStatus} />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Uptime</span>
                  <span>{formatUptime(metrics.system.uptime)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Version</span>
                  <span>{metrics.system.version}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Environment</span>
                  <Badge variant="outline">{metrics.system.environment}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* External Services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">External Services</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metrics?.system.externalServices && (
              <div className="space-y-2">
                {Object.entries(metrics.system.externalServices).map(([service, status]) => (
                  <div key={service} className="flex justify-between text-sm">
                    <span className="capitalize">{service}</span>
                    <StatusBadge status={status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Response Time Trend</CardTitle>
            <CardDescription>API response times over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[
                  { time: '00:00', responseTime: 120 },
                  { time: '04:00', responseTime: 95 },
                  { time: '08:00', responseTime: 150 },
                  { time: '12:00', responseTime: 200 },
                  { time: '16:00', responseTime: 180 },
                  { time: '20:00', responseTime: 140 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="responseTime" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Error Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Error Distribution</CardTitle>
            <CardDescription>Errors by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { type: 'Database', count: metrics?.errors.byType.database || 0 },
                  { type: 'Network', count: metrics?.errors.byType.network || 0 },
                  { type: 'Validation', count: metrics?.errors.byType.validation || 0 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
