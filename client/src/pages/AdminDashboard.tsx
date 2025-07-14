import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateTenant, useGetTenants, useGetUsers, useGetAdminStats } from "@/hooks/useAdmin";
import { SystemDashboard } from "@/components/SystemDashboard";
import { RefreshCw, Users, Building, Calendar, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    placeName: "",
    subdomain: "",
    svgFile: null as File | null,
  });

  // Backend API hooks
  const createTenantMutation = useCreateTenant();
  const { data: tenantsData, isLoading: tenantsLoading } = useGetTenants();
  const { data: usersData, isLoading: usersLoading } = useGetUsers();
  const { data: adminStats, isLoading: statsLoading } = useGetAdminStats();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.placeName || !formData.subdomain) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTenantMutation.mutateAsync({
        placeName: formData.placeName,
        subdomain: formData.subdomain,
        svgMap: formData.svgFile || undefined,
      });

      // Reset form
      setFormData({
        placeName: "",
        subdomain: "",
        svgFile: null,
      });
    } catch (error: any) {
      // Error is handled by the mutation
      console.error('Create tenant error:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "image/svg+xml") {
      setFormData({ ...formData, svgFile: file });
    } else {
      toast({
        title: "Invalid File",
        description: "Please select an SVG file.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg"></div>
              <h1 className="text-xl font-bold">MapEase Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {user?.role} - {user?.name}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="create-tenant">Create Tenant</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
              <p className="text-muted-foreground">
                System overview and statistics from the backend.
              </p>
            </div>

            {/* Stats Cards */}
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                        <div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : adminStats ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Building className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Tenants</p>
                        <p className="text-3xl font-bold">{adminStats.totalTenants}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Users className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                        <p className="text-3xl font-bold">{adminStats.totalUsers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Calendar className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Events</p>
                        <p className="text-3xl font-bold">{adminStats.totalEvents}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <TrendingUp className="h-8 w-8 text-orange-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Active Tenants</p>
                        <p className="text-3xl font-bold">{adminStats.activeTenants || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Failed to load statistics</p>
              </div>
            )}
          </TabsContent>

          {/* Create Tenant Tab */}
          <TabsContent value="create-tenant" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Create New Tenant</h2>
                <p className="text-muted-foreground">
                  Set up a new venue with its own subdomain and management dashboard.
                </p>
              </div>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Tenant Information</CardTitle>
                  <CardDescription>
                    Configure the basic details for the new venue tenant.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="placeName">Place Name</Label>
                      <Input
                        id="placeName"
                        placeholder="e.g. Downtown Convention Center"
                        value={formData.placeName}
                        onChange={(e) => setFormData({ ...formData, placeName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subdomain">Subdomain</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="subdomain"
                          placeholder="e.g. downtown-center"
                          value={formData.subdomain}
                          onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                          required
                        />
                        <span className="text-muted-foreground">.mapease.com</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This will be the unique URL for this venue
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="svgFile">Venue Map (SVG)</Label>
                      <Input
                        id="svgFile"
                        type="file"
                        accept=".svg"
                        onChange={handleFileChange}
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload an SVG file of the venue layout (optional)
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createTenantMutation.isPending}
                    >
                      {createTenantMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Creating Tenant...
                        </>
                      ) : (
                        'Create Tenant'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tenants Tab */}
          <TabsContent value="tenants" className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Manage Tenants</h2>
              <p className="text-muted-foreground">
                View and manage all venue tenants in the system.
              </p>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>All Tenants</CardTitle>
                <CardDescription>
                  List of all registered venue tenants
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tenantsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Loading tenants...
                  </div>
                ) : tenantsData?.tenants && tenantsData.tenants.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Place Name</TableHead>
                        <TableHead>Subdomain</TableHead>
                        <TableHead>Creator</TableHead>
                        <TableHead>Events</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenantsData.tenants.map((tenant) => (
                        <TableRow key={tenant.id}>
                          <TableCell className="font-medium">{tenant.placeName}</TableCell>
                          <TableCell>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {tenant.subdomain}.mapease.com
                            </code>
                          </TableCell>
                          <TableCell>{tenant.creator.name}</TableCell>
                          <TableCell>{tenant._count?.events || 0}</TableCell>
                          <TableCell>
                            <Badge variant={tenant.isActive ? "default" : "secondary"}>
                              {tenant.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No tenants found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Manage Users</h2>
              <p className="text-muted-foreground">
                View and manage all system users.
              </p>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  List of all registered users in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Loading users...
                  </div>
                ) : usersData?.users && usersData.users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tenants</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData.users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.tenantAdmins?.length || 0}</TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <SystemDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;