import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { SystemDashboard } from "@/components/SystemDashboard";
import { Badge } from "@/components/ui/badge";

const Landing = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (user) {
      // User is logged in, go to smart dashboard
      navigate('/dashboard');
    } else {
      // User is not logged in, go to auth page
      navigate('/auth');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg"></div>
              <h1 className="text-xl font-bold">MapEase</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user.name}
                  </span>
                  <Button onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button onClick={handleAuthAction}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="secondary">Backend Integrated</Badge>
            <Badge variant="outline">Live API: {import.meta.env.VITE_API_BASE_URL}</Badge>
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Intelligent Venue Management & Navigation
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create events, manage registrations, and provide seamless indoor navigation 
            with our comprehensive multi-tenant platform. Backend fully integrated!
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleAuthAction}>
              {user ? 'Go to Dashboard' : 'Get Started'}
            </Button>
            <Button variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="container mx-auto px-4 py-16">
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="system">System Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="features" className="mt-8">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 shadow-lg">
                <div className="h-12 w-12 bg-gradient-primary rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-primary-foreground">🗺️</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Interactive Maps</h3>
                <p className="text-muted-foreground">
                  Upload SVG venue maps and provide real-time indoor navigation to your visitors.
                </p>
              </Card>

              <Card className="p-6 shadow-lg">
                <div className="h-12 w-12 bg-gradient-primary rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-primary-foreground">🎫</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Event Management</h3>
                <p className="text-muted-foreground">
                  Create events, manage registrations, and control access with QR code validation.
                </p>
              </Card>

              <Card className="p-6 shadow-lg">
                <div className="h-12 w-12 bg-gradient-primary rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-primary-foreground">🏢</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Multi-Tenant</h3>
                <p className="text-muted-foreground">
                  Each venue gets their own subdomain and complete management dashboard.
                </p>
              </Card>
            </div>

            {/* Backend Features */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-center mb-8">Backend Integration Features</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-4 text-center">
                  <div className="text-2xl mb-2">🔐</div>
                  <h4 className="font-semibold">SSO Authentication</h4>
                  <p className="text-sm text-muted-foreground">Secure single sign-on integration</p>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl mb-2">🏗️</div>
                  <h4 className="font-semibold">Multi-Tenant Architecture</h4>
                  <p className="text-sm text-muted-foreground">Subdomain-based tenant isolation</p>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <h4 className="font-semibold">Real-time Dashboard</h4>
                  <p className="text-sm text-muted-foreground">Live data from PostgreSQL</p>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl mb-2">🔄</div>
                  <h4 className="font-semibold">RESTful API</h4>
                  <p className="text-sm text-muted-foreground">Complete CRUD operations</p>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="system" className="mt-8">
            <SystemDashboard />
          </TabsContent>
        </Tabs>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 MapEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;