import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { testService } from '@/services/testService';
import { authService } from '@/services/authService';
import { adminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';

export const BackendTestPage: React.FC = () => {
  const [results, setResults] = React.useState<any>({});
  const [loading, setLoading] = React.useState<string>('');

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(testName);
    try {
      const result = await testFn();
      setResults(prev => ({ ...prev, [testName]: { success: true, data: result } }));
      toast({
        title: `${testName} Success`,
        description: "Test completed successfully",
      });
    } catch (error: any) {
      setResults(prev => ({ ...prev, [testName]: { success: false, error: error.message } }));
      toast({
        title: `${testName} Failed`,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading('');
    }
  };

  const tests = [
    {
      name: 'Health Check',
      fn: () => testService.healthCheck(),
    },
    {
      name: 'Database Test',
      fn: () => testService.testDatabase(),
    },
    {
      name: 'Upload Test',
      fn: () => testService.testUpload(),
    },
    {
      name: 'SSO Test',
      fn: () => testService.testSSO(),
    },
    {
      name: 'Get Admin Stats',
      fn: () => adminService.getDashboardStats(),
    },
    {
      name: 'Get SSO Login URL',
      fn: () => authService.getSSOLoginUrl(),
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Backend Integration Tests</h1>
        <p className="text-muted-foreground">
          Test all backend API endpoints and services.
        </p>
        <Badge variant="outline" className="mt-2">
          API URL: {import.meta.env.VITE_API_BASE_URL}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map((test) => (
          <Card key={test.name}>
            <CardHeader>
              <CardTitle className="text-lg">{test.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => runTest(test.name, test.fn)}
                disabled={loading === test.name}
                className="w-full"
              >
                {loading === test.name ? 'Testing...' : 'Run Test'}
              </Button>

              {results[test.name] && (
                <div className={`p-3 rounded text-sm ${
                  results[test.name].success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {results[test.name].success ? (
                    <div>
                      <div className="font-semibold text-green-800">✅ Success</div>
                      <pre className="mt-2 text-xs overflow-auto">
                        {JSON.stringify(results[test.name].data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div>
                      <div className="font-semibold text-red-800">❌ Failed</div>
                      <div className="mt-1 text-red-700">{results[test.name].error}</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Full System Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => runTest('Full System Test', () => testService.fullSystemTest())}
            disabled={loading === 'Full System Test'}
            className="w-full"
            variant="outline"
          >
            {loading === 'Full System Test' ? 'Running All Tests...' : 'Run All Tests'}
          </Button>

          {results['Full System Test'] && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">System Test Results</h4>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(results['Full System Test'], null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
