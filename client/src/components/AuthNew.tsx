import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { LogIn } from 'lucide-react';

const Auth = () => {
  const { toast } = useToast();
  const { user, loading, login, getSSOLoginUrl } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Handle SSO callback token from URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      handleSSOCallback(token);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      navigate(redirectTo);
    }
  }, [user, loading, navigate, searchParams]);

  const handleSSOCallback = async (token: string) => {
    setIsLoading(true);
    try {
      await login(token);
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      navigate(redirectTo);
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
      const currentUrl = window.location.origin + window.location.pathname;
      const redirectParam = searchParams.get('redirect');
      const redirectUrl = redirectParam 
        ? `${currentUrl}?redirect=${encodeURIComponent(redirectParam)}`
        : currentUrl;
      
      const loginUrl = await getSSOLoginUrl(redirectUrl);
      window.location.href = loginUrl;
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
          <Button 
            onClick={handleSSOLogin}
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign in with SSO
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Secure authentication powered by</p>
            <p className="font-medium">Akshat Mehta Identity Service</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
