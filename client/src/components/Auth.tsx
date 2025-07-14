import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { LogIn, ExternalLink, Shield, Info } from 'lucide-react';

const Auth = () => {
  const { toast } = useToast();
  const { user, loading, login, getSSOLoginUrl } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Extract redirect parameter from URL
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      setRedirectUrl(decodeURIComponent(redirect));
    }
  }, [searchParams]);

  // Handle SSO callback token from URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      handleSSOCallback(token);
    }
  }, [searchParams]);

  // Handle redirect after authentication
  useEffect(() => {
    if (user && !loading) {
      // Small delay to show user info before redirecting
      const timer = setTimeout(() => {
        handleRedirect();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  const handleRedirect = () => {
    const targetUrl = redirectUrl || '/dashboard';
    
    // Validate redirect URL for security (basic validation)
    if (redirectUrl) {
      try {
        const url = new URL(redirectUrl, window.location.origin);
        // Only allow same origin or specific trusted domains
        const allowedOrigins = [window.location.origin, 'https://identity.akshatmehta.com'];
        if (allowedOrigins.includes(url.origin)) {
          window.location.href = redirectUrl;
          return;
        } else {
          toast({
            title: "Invalid redirect URL",
            description: "Redirecting to dashboard instead",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Invalid redirect URL format",
          description: "Redirecting to dashboard instead",
          variant: "destructive",
        });
      }
    }
    
    // Fallback to dashboard
    navigate('/dashboard');
  };

  const handleSSOCallback = async (token: string) => {
    setIsLoading(true);
    try {
      await login(token);
      toast({
        title: "Authentication successful",
        description: "Welcome to MapEase!",
        variant: "default",
      });
    } catch (error: any) {
      console.error('SSO callback error:', error);
      toast({
        title: "Authentication failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLogin = async () => {
    setIsLoading(true);
    try {
      const currentUrl = `${window.location.origin}/auth`;
      const redirectParam = redirectUrl;
      const callbackUrl = redirectParam 
        ? `${currentUrl}?redirect=${encodeURIComponent(redirectParam)}`
        : currentUrl;
      
      const loginUrl = await getSSOLoginUrl(callbackUrl);
      
      // Add redirect parameter to SSO URL if present
      const finalLoginUrl = redirectParam 
        ? `${loginUrl}&redirect=${encodeURIComponent(redirectParam)}`
        : loginUrl;
      
      window.location.href = finalLoginUrl;
    } catch (error: any) {
      console.error('SSO login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Unable to connect to authentication service",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  // If user is authenticated, show success state with redirect info
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-green-700">
              Authentication Successful!
            </CardTitle>
            <CardDescription className="text-center">
              Welcome to MapEase, {user.name || user.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                Logged in via: <span className="font-medium">{'provider' in user ? (user as any).provider : 'SSO'}</span>
              </p>
            </div>

            {redirectUrl && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Redirect destination:</strong><br />
                  <span className="text-sm font-mono break-all">{redirectUrl}</span>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button 
                onClick={handleRedirect}
                className="w-full"
                size="lg"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {redirectUrl ? 'Go to Application' : 'Go to Dashboard'}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                You will be redirected automatically in a few seconds...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome to MapEase</CardTitle>
          <CardDescription className="text-center">
            Sign in to manage your events and venues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {redirectUrl && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>You will be redirected to:</strong><br />
                <span className="text-sm font-mono break-all">{redirectUrl}</span>
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleSSOLogin}
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign in with SSO
          </Button>
          
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Secure authentication powered by</p>
            <p className="font-medium">Akshat Mehta Identity Service</p>
            {redirectUrl && (
              <p className="text-xs">After authentication, you'll be redirected back to your application</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
