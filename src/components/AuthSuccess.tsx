import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkAuthStatus } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const token = searchParams.get('token');

  useEffect(() => {
    const handleAuth = async () => {
      if (token) {
        localStorage.setItem('authToken', token);
        
        // Refresh auth status to get user data
        await checkAuthStatus();
        
        toast({
          title: "Authentication Successful!",
          description: "You have been successfully logged in.",
        });

        setTimeout(() => {
          navigate('/');
        }, 2000);
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
  }, [token, navigate, toast, checkAuthStatus]);

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
