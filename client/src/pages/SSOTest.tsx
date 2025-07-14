import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, TestTube, ArrowRight } from 'lucide-react';

const SSOTest = () => {
  const [redirectUrl, setRedirectUrl] = useState('');

  const handleSSOTest = () => {
    const baseAuthUrl = '/auth';
    const finalUrl = redirectUrl 
      ? `${baseAuthUrl}?redirect=${encodeURIComponent(redirectUrl)}`
      : baseAuthUrl;
    
    window.location.href = finalUrl;
  };

  const testUrls = [
    { 
      label: 'Dashboard (Internal)', 
      url: `${window.location.origin}/dashboard`,
      description: 'Test redirect to internal dashboard'
    },
    { 
      label: 'Admin Dashboard (Internal)', 
      url: `${window.location.origin}/admin-dashboard`,
      description: 'Test redirect to admin dashboard'
    },
    { 
      label: 'Landing Page (Internal)', 
      url: `${window.location.origin}/`,
      description: 'Test redirect to landing page'
    },
    { 
      label: 'External Example', 
      url: 'https://example.com',
      description: 'Test external redirect (should be blocked for security)'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              SSO Integration Test
            </CardTitle>
            <CardDescription>
              Test the SSO authentication flow with different redirect URLs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <ExternalLink className="h-4 w-4" />
              <AlertDescription>
                This page helps you test the SSO integration between MapEase and the Akshat Mehta Identity Service.
                The SSO flow includes redirect URL handling for seamless user experience.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-redirect">Custom Redirect URL</Label>
                <Input
                  id="custom-redirect"
                  type="url"
                  placeholder="https://example.com/callback"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button 
                onClick={handleSSOTest}
                className="w-full"
                size="lg"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Test SSO Flow
                {redirectUrl && (
                  <span className="ml-2 text-xs opacity-75">
                    (with custom redirect)
                  </span>
                )}
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Quick Test URLs</h3>
              <div className="grid gap-3">
                {testUrls.map((test, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{test.label}</h4>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                        <p className="text-xs font-mono text-blue-600 mt-1">{test.url}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRedirectUrl(test.url);
                          setTimeout(() => handleSSOTest(), 100);
                        }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-2">How it works</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>1. <strong>Start SSO Flow:</strong> Click "Test SSO Flow" to redirect to the authentication page</p>
                <p>2. <strong>SSO Authentication:</strong> You'll be redirected to identity.akshatmehta.com for authentication</p>
                <p>3. <strong>Callback Handling:</strong> After authentication, the SSO system will redirect back with a token</p>
                <p>4. <strong>Final Redirect:</strong> You'll be automatically redirected to your specified URL or the dashboard</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SSOTest;
