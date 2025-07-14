import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Upload, Shield, Activity } from 'lucide-react';
import { testService } from '@/services/testService';
import { useGetUserDashboard } from '@/hooks/useUser';
import { useGetAdminStats } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface SystemTest {
  name: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  result?: any;
  error?: string;
  icon: React.ReactNode;
}

export const SystemDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: userDashboard, isLoading: userLoading } = useGetUserDashboard();
  const { data: adminStats, isLoading: adminLoading } = useGetAdminStats();

  const [tests, setTests] = useState<SystemTest[]>([
    {
      name: 'Health Check',
      status: 'idle',
      icon: <Activity className="h-4 w-4" />,
    },
    {
      name: 'Database Connection',
      status: 'idle',
      icon: <Database className="h-4 w-4" />,
    },
    {
      name: 'Upload Configuration',
      status: 'idle',
      icon: <Upload className="h-4 w-4" />,
    },
    {
      name: 'SSO Configuration',
      status: 'idle',
      icon: <Shield className="h-4 w-4" />,
    },
  ]);

  const runSystemTests = async () => {
    // Reset all tests to loading
    setTests(prev => prev.map(test => ({ ...test, status: 'loading' as const })));

    try {
      // Health check
      try {
        const health = await testService.healthCheck();
        setTests(prev => prev.map(test => 
          test.name === 'Health Check' 
            ? { ...test, status: 'success' as const, result: health }
            : test
        ));
      } catch (error: any) {
        setTests(prev => prev.map(test => 
          test.name === 'Health Check' 
            ? { ...test, status: 'error' as const, error: error.message }
            : test
        ));
      }

      // Database test
      try {
        const database = await testService.testDatabase();
        setTests(prev => prev.map(test => 
          test.name === 'Database Connection' 
            ? { ...test, status: 'success' as const, result: database }
            : test
        ));
      } catch (error: any) {
        setTests(prev => prev.map(test => 
          test.name === 'Database Connection' 
            ? { ...test, status: 'error' as const, error: error.message }
            : test
        ));
      }

      // Upload test
      try {
        const upload = await testService.testUpload();
        setTests(prev => prev.map(test => 
          test.name === 'Upload Configuration' 
            ? { ...test, status: 'success' as const, result: upload }
            : test
        ));
      } catch (error: any) {
        setTests(prev => prev.map(test => 
          test.name === 'Upload Configuration' 
            ? { ...test, status: 'error' as const, error: error.message }
            : test
        ));
      }

      // SSO test
      try {
        const sso = await testService.testSSO();
        setTests(prev => prev.map(test => 
          test.name === 'SSO Configuration' 
            ? { ...test, status: 'success' as const, result: sso }
            : test
        ));
      } catch (error: any) {
        setTests(prev => prev.map(test => 
          test.name === 'SSO Configuration' 
            ? { ...test, status: 'error' as const, error: error.message }
            : test
        ));
      }

      toast({
        title: "System Tests Completed",
        description: "All backend integration tests have been executed.",
      });
    } catch (error: any) {
      toast({
        title: "System Test Error",
        description: error.message || "Failed to run system tests",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runSystemTests();
  }, []);

  return (
    <div className="space-y-6">
      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status Dashboard
          </CardTitle>
          <CardDescription>
            Backend integration status and user dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Current User</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> {user?.name || 'Not loaded'}</p>
                <p><strong>Email:</strong> {user?.email || 'Not loaded'}</p>
                <p><strong>Role:</strong> 
                  <Badge variant="outline" className="ml-2">
                    {user?.role || 'Unknown'}
                  </Badge>
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">API Configuration</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Backend URL:</strong> {import.meta.env.VITE_API_BASE_URL}</p>
                <p><strong>SSO URL:</strong> {import.meta.env.VITE_SSO_SERVICE_URL}</p>
                <p><strong>Base Domain:</strong> {import.meta.env.VITE_BASE_DOMAIN}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Tests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Backend Integration Tests</CardTitle>
              <CardDescription>
                Real-time status of backend services and configurations
              </CardDescription>
            </div>
            <Button onClick={runSystemTests} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Tests
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map((test, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {test.icon}
                    <span className="font-medium">{test.name}</span>
                  </div>
                  {getStatusIcon(test.status)}
                </div>
                
                {test.status === 'success' && test.result && (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                    <strong>Success:</strong> {test.result.message || 'Test passed'}
                    {test.result.stats && (
                      <div className="mt-1">
                        Users: {test.result.stats.users}, 
                        Tenants: {test.result.stats.tenants}, 
                        Events: {test.result.stats.events}
                      </div>
                    )}
                  </div>
                )}
                
                {test.status === 'error' && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    <strong>Error:</strong> {test.error}
                  </div>
                )}
                
                {test.status === 'loading' && (
                  <div className="text-xs text-blue-600">
                    Running test...
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Dashboard Data */}
      {userDashboard && (
        <Card>
          <CardHeader>
            <CardTitle>User Dashboard Data</CardTitle>
            <CardDescription>
              Data from backend API calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading user dashboard...
              </div>
            ) : (
              <div className="space-y-4">
                {userDashboard.stats && (
                  <div>
                    <h4 className="font-semibold mb-2">Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {Object.entries(userDashboard.stats).map(([key, value]) => (
                        <div key={key} className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-medium">{value as number}</div>
                          <div className="text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {userDashboard.managedTenants && userDashboard.managedTenants.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Managed Tenants</h4>
                    <div className="space-y-2">
                      {userDashboard.managedTenants.map((tenant) => (
                        <div key={tenant.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium">{tenant.placeName}</div>
                            <div className="text-sm text-muted-foreground">{tenant.subdomain}</div>
                          </div>
                          <div className="text-sm">
                            {tenant.eventsCount} events, {tenant.totalRegistrations} registrations
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin Stats (if super admin) */}
      {user?.role === 'SUPER_ADMIN' && adminStats && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard Stats</CardTitle>
            <CardDescription>
              System-wide statistics (Super Admin view)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {adminLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading admin stats...
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(adminStats).map(([key, value]) => (
                  <div key={key} className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{value as number}</div>
                    <div className="text-sm text-blue-800 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
