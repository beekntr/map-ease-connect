import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import TenantDashboard from "./TenantDashboard";
import UserDashboard from "./UserDashboard";
import LoadingSpinner from "@/components/LoadingSpinner";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not authenticated, redirect to auth page
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading spinner while authentication is being checked
  if (loading) {
    return <LoadingSpinner />;
  }

  // If no user, return null (redirect will happen in useEffect)
  if (!user) {
    return null;
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'SUPER_ADMIN':
      return <AdminDashboard />;
    
    case 'TENANT_ADMIN':
      // Check if user is accessing a specific tenant subdomain
      const hostname = window.location.hostname;
      if (hostname.includes('.') && !hostname.includes('localhost')) {
        // User is on a tenant subdomain, show tenant dashboard
        return <TenantDashboard />;
      } else {
        // User is on main domain, show user dashboard with tenant management
        return <UserDashboard />;
      }
    
    case 'GUEST':
    default:
      return <UserDashboard />;
  }
};

export default Dashboard;
