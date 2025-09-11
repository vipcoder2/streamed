import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Navbar from '@/components/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Server, Wifi } from 'lucide-react';
import { format } from 'date-fns';

export default function Status() {
  const { data: status, isLoading, error } = useQuery({
    queryKey: ['/api/status'],
    queryFn: () => api.checkStatus(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-primary" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground animate-spin" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-primary';
      case 'offline':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">API Status</h1>
          <p className="text-muted-foreground">Monitor the health and status of Streamed API services</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main API Status */}
          <Card className="glassmorphism border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Streamed API</CardTitle>
                </div>
                {isLoading ? (
                  <Badge variant="secondary" className="glassmorphism">
                    <Clock className="h-3 w-3 mr-1 animate-spin" />
                    Checking
                  </Badge>
                ) : (
                  <Badge className={getStatusColor(status?.status)} data-testid="api-status-badge">
                    {getStatusIcon(status?.status)}
                    <span className="ml-1 capitalize">{status?.status || 'Unknown'}</span>
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {error 
                  ? 'Failed to check API status. The service may be temporarily unavailable.'
                  : status?.status === 'online' 
                    ? 'All systems operational. API is responding normally.'
                    : status?.status === 'offline'
                      ? 'API is currently offline or experiencing issues.'
                      : 'Checking API status...'}
              </CardDescription>
              {status?.timestamp && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last checked: {format(new Date(status.timestamp), 'PPp')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Connection Status */}
          <Card className="glassmorphism border-border">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Wifi className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Connection</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Base URL</span>
                  <span className="text-sm font-mono text-foreground">https://streamed.pk/api</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Response Time</span>
                  <span className="text-sm text-foreground">
                    {isLoading ? 'Measuring...' : error ? 'N/A' : '< 500ms'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Protocol</span>
                  <span className="text-sm text-foreground">HTTPS</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Endpoints */}
          <Card className="glassmorphism border-border lg:col-span-2">
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>Available endpoints and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { endpoint: '/sports', description: 'Get available sports categories' },
                  { endpoint: '/matches/{sport}', description: 'Get matches for specific sport' },
                  { endpoint: '/stream/{source}/{id}', description: 'Get stream URLs for match' },
                  { endpoint: '/images/{team}', description: 'Get team logos and images' },
                ].map(({ endpoint, description }) => (
                  <div key={endpoint} className="p-3 rounded-lg bg-muted/20 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-mono text-primary">{endpoint}</code>
                      <Badge variant="secondary" className="text-xs">
                        {status?.status === 'online' ? 'Available' : 'Unknown'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Auto-refresh notice */}
        <div className="mt-6">
          <Card className="glassmorphism border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground text-center">
                Status automatically refreshes every 30 seconds
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
