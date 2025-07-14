import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (user) {
      // User is logged in, go to dashboard
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
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Intelligent Venue Management & Navigation
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create events, manage registrations, and provide seamless indoor navigation 
            with our comprehensive multi-tenant platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleAuthAction}>
              {user ? 'Go to Dashboard' : 'Get Started'}
            </Button>
            <Button>
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
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