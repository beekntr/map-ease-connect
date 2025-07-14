import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const token = searchParams.get('token');
  const redirectUrl = searchParams.get('redirect');

  useEffect(() => {
    const handleAuth = async () => {
      if (token) {
        try {
          // Use the auth context login method to handle the token
          await login(token);
          
          toast({
            title: "Authentication Successful!",
            description: "You have been successfully logged in.",
          });

          // Redirect after successful login
          setTimeout(() => {
            if (redirectUrl) {
              // Validate redirect URL for security
              try {
                const url = new URL(redirectUrl, window.location.origin);
                const allowedOrigins = [window.location.origin, 'https://identity.akshatmehta.com'];
                if (allowedOrigins.includes(url.origin)) {
                  window.location.href = redirectUrl;
                  return;
                }
              } catch (error) {
                console.error('Invalid redirect URL:', error);
              }
            }
            // Default redirect to dashboard
            navigate('/dashboard');
          }, 2000);
        } catch (error: any) {
          console.error('Authentication error:', error);
          toast({
            title: "Authentication Error",
            description: error.message || "Failed to process authentication token.",
            variant: "destructive",
          });
          setTimeout(() => {
            navigate('/auth');
          }, 2000);
        }
      } else {
        toast({
          title: "Authentication Error",
          description: "No authentication token received.",
          variant: "destructive",
        });
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
      }
      setIsProcessing(false);
    };

    handleAuth();
  }, [token, redirectUrl, navigate, toast, login]);

  return (
    <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-success flex items-center justify-center">
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className="text-success-foreground"
            >
              <path d="M9 12l2 2 4-4"></path>
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
          </div>
          <CardTitle className="text-2xl">Authentication Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {isProcessing ? (
            <>
              <p className="text-muted-foreground">
                Processing your authentication...
              </p>
              <div className="flex justify-center space-x-1 pt-4">
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                You have been successfully logged in.
              </p>
              <p className="text-muted-foreground">
                Redirecting you to the main application...
              </p>
              <div className="flex justify-center space-x-1 pt-4">
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthSuccess;
