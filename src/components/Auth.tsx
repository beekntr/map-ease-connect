import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Auth = () => {
  const { toast } = useToast();
  const { user, loading, login, logout } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'oauth'>('login');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API Base URL from environment variables
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://identity.akshatmehta.com';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleTraditionalAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (authMode === 'register' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = authMode === 'login' 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user);
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        toast({
          title: "Success",
          description: `Successfully ${authMode === 'login' ? 'logged in' : 'created account'}!`,
        });
      } else {
        setError(data.error || 'Authentication failed');
        toast({
          title: "Error",
          description: data.error || 'Authentication failed',
          variant: "destructive",
        });
      }
    } catch (error) {
      setError('Network error. Please try again.');
      toast({
        title: "Error",
        description: 'Network error. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = (provider: string) => {
    window.location.href = `${API_BASE_URL}/api/oauth/${provider}`;
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-primary rounded-lg"></div>
            <h1 className="text-xl font-bold">MapEase</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {user ? 'Welcome Back!' : 'Authentication'}
              </CardTitle>
              {!user && (
                <CardDescription>
                  Sign in to your MapEase account
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {user ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.avatar_url} alt="User Avatar" />
                      <AvatarFallback className="text-lg">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h2 className="text-xl font-semibold">{user.name}</h2>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Login Method:</span>
                      <Badge>{user.provider}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last Login:</span>
                      <span className="text-sm">{new Date(user.last_login).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleLogout} 
                    className="w-full px-4 py-2 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Auth Mode Toggle */}
                  <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                    <button
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        authMode === 'login' 
                          ? 'bg-primary text-primary-foreground hover:bg-primary-dark shadow-sm' 
                          : 'hover:bg-surface hover:text-surface-foreground'
                      }`}
                      onClick={() => {setAuthMode('login'); setError('');}}
                    >
                      Login
                    </button>
                    <button
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        authMode === 'register' 
                          ? 'bg-primary text-primary-foreground hover:bg-primary-dark shadow-sm' 
                          : 'hover:bg-surface hover:text-surface-foreground'
                      }`}
                      onClick={() => {setAuthMode('register'); setError('');}}
                    >
                      Sign Up
                    </button>
                    <button
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        authMode === 'oauth' 
                          ? 'bg-primary text-primary-foreground hover:bg-primary-dark shadow-sm' 
                          : 'hover:bg-surface hover:text-surface-foreground'
                      }`}
                      onClick={() => {setAuthMode('oauth'); setError('');}}
                    >
                      Social
                    </button>
                  </div>

                  {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                      {error}
                    </div>
                  )}

                  {authMode === 'oauth' ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="font-medium mb-2">Sign in with Social Media</h3>
                        <p className="text-sm text-muted-foreground">Choose your preferred authentication method</p>
                      </div>
                      
                      <div className="space-y-3">
                        <button 
                          onClick={() => handleOAuthLogin('google')} 
                          className="w-full flex items-center justify-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-md transition-colors"
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Continue with Google
                        </button>
                        
                        <button 
                          onClick={() => handleOAuthLogin('github')} 
                          className="w-full flex items-center justify-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md transition-colors"
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                          Continue with GitHub
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleTraditionalAuth} className="space-y-4">
                      {authMode === 'register' && (
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          minLength={6}
                          disabled={isSubmitting}
                        />
                      </div>

                      {authMode === 'register' && (
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                            minLength={6}
                            disabled={isSubmitting}
                          />
                        </div>
                      )}

                      <button 
                        type="submit" 
                        className="w-full px-4 py-2 bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-brand rounded-md transition-all disabled:opacity-50 disabled:pointer-events-none"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;
