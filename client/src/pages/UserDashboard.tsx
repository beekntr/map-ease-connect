import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useGetUserDashboard, useGetUserEvents, useGetUserProfile } from "@/hooks/useUser";
import { RefreshCw, User, Calendar, CheckCircle, Clock, MapPin, Building, Users, ArrowRight } from "lucide-react";

const UserDashboard = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Backend API hooks
  const { data: userDashboard, isLoading: dashboardLoading } = useGetUserDashboard();
  const { data: userProfile, isLoading: profileLoading } = useGetUserProfile();
  const { data: userEvents, isLoading: eventsLoading } = useGetUserEvents();

  const handleLogout = async () => {
    await logout();
  };

  const getTabsBasedOnRole = () => {
    if (user?.role === 'SUPER_ADMIN') {
      return [
        { id: "overview", label: "Overview" },
        { id: "events", label: "Recent Events" },
        { id: "profile", label: "Profile" }
      ];
    } else if (user?.role === 'TENANT_ADMIN') {
      return [
        { id: "overview", label: "Overview" },
        { id: "tenants", label: "Managed Tenants" },
        { id: "events", label: "Recent Events" },
        { id: "profile", label: "Profile" }
      ];
    } else {
      return [
        { id: "overview", label: "Overview" },
        { id: "events", label: "My Events" },
        { id: "profile", label: "Profile" }
      ];
    }
  };

  const tabs = getTabsBasedOnRole();

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">User Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Personal analytics and activity
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {user?.role} - {user?.name}
              </span>
              {(user?.role === 'SUPER_ADMIN' || user?.role === 'TENANT_ADMIN') && (
                <div className="flex space-x-2">
                  {user?.role === 'SUPER_ADMIN' && (
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin-dashboard')}>
                      Admin Dashboard <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                  {user?.role === 'TENANT_ADMIN' && (
                    <Button variant="outline" size="sm" onClick={() => navigate('/tenant-dashboard')}>
                      Tenant Dashboard <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
              <p className="text-muted-foreground">
                Your personal statistics and activity summary.
              </p>
            </div>

            {/* Stats Cards */}
            {dashboardLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
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
            ) : userDashboard?.stats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {user?.role === 'SUPER_ADMIN' && (
                  <>
                    <Card className="shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <Building className="h-8 w-8 text-blue-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Total Tenants</p>
                            <p className="text-3xl font-bold">{userDashboard.stats.totalTenants || 0}</p>
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
                            <p className="text-3xl font-bold">{userDashboard.stats.totalUsers || 0}</p>
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
                            <p className="text-3xl font-bold">{userDashboard.stats.totalEvents || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {user?.role === 'TENANT_ADMIN' && (
                  <>
                    <Card className="shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <Building className="h-8 w-8 text-blue-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Managed Tenants</p>
                            <p className="text-3xl font-bold">{userDashboard.stats.managedTenants || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <Calendar className="h-8 w-8 text-green-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Total Events</p>
                            <p className="text-3xl font-bold">{userDashboard.stats.totalEvents || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <Users className="h-8 w-8 text-orange-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Total Registrations</p>
                            <p className="text-3xl font-bold">{userDashboard.stats.totalRegistrations || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {user?.role === 'GUEST' && (
                  <>
                    <Card className="shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <Calendar className="h-8 w-8 text-blue-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">My Registrations</p>
                            <p className="text-3xl font-bold">{userDashboard.stats.totalRegistrations || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <CheckCircle className="h-8 w-8 text-green-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Approved</p>
                            <p className="text-3xl font-bold">{userDashboard.stats.approvedRegistrations || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <Clock className="h-8 w-8 text-orange-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Pending</p>
                            <p className="text-3xl font-bold">{userDashboard.stats.pendingRegistrations || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Failed to load dashboard statistics</p>
              </div>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks based on your role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {user?.role === 'SUPER_ADMIN' && (
                    <>
                      <Button variant="outline" className="h-16" onClick={() => navigate('/admin-dashboard')}>
                        <div className="text-center">
                          <Building className="h-6 w-6 mx-auto mb-1" />
                          <div className="text-sm">Admin Dashboard</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-16">
                        <div className="text-center">
                          <Users className="h-6 w-6 mx-auto mb-1" />
                          <div className="text-sm">Manage Users</div>
                        </div>
                      </Button>
                    </>
                  )}
                  {user?.role === 'TENANT_ADMIN' && (
                    <>
                      <Button variant="outline" className="h-16" onClick={() => navigate('/tenant-dashboard')}>
                        <div className="text-center">
                          <Calendar className="h-6 w-6 mx-auto mb-1" />
                          <div className="text-sm">Tenant Dashboard</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="h-16">
                        <div className="text-center">
                          <Building className="h-6 w-6 mx-auto mb-1" />
                          <div className="text-sm">Manage Venues</div>
                        </div>
                      </Button>
                    </>
                  )}
                  <Button variant="outline" className="h-16">
                    <div className="text-center">
                      <MapPin className="h-6 w-6 mx-auto mb-1" />
                      <div className="text-sm">Find Events</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-16">
                    <div className="text-center">
                      <User className="h-6 w-6 mx-auto mb-1" />
                      <div className="text-sm">Update Profile</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Managed Tenants Tab (for Tenant Admins) */}
          {user?.role === 'TENANT_ADMIN' && (
            <TabsContent value="tenants" className="space-y-6">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Managed Tenants</h2>
                <p className="text-muted-foreground">
                  Venues you have administrative access to
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Your Tenants</CardTitle>
                  <CardDescription>
                    Venues where you have administrative privileges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      Loading tenants...
                    </div>
                  ) : userDashboard?.managedTenants && userDashboard.managedTenants.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Venue Name</TableHead>
                          <TableHead>Subdomain</TableHead>
                          <TableHead>Events</TableHead>
                          <TableHead>Registrations</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userDashboard.managedTenants.map((tenant) => (
                          <TableRow key={tenant.id}>
                            <TableCell className="font-medium">{tenant.placeName}</TableCell>
                            <TableCell>
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                {tenant.subdomain}.mapease.com
                              </code>
                            </TableCell>
                            <TableCell>{tenant.eventsCount}</TableCell>
                            <TableCell>{tenant.totalRegistrations}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                Manage
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">You don't manage any tenants yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">
                {user?.role === 'GUEST' ? 'My Events' : 'Recent Events'}
              </h2>
              <p className="text-muted-foreground">
                {user?.role === 'GUEST' 
                  ? 'Events you have registered for' 
                  : 'Latest events in the system'
                }
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {user?.role === 'GUEST' ? 'Registered Events' : 'Recent Events'}
                </CardTitle>
                <CardDescription>
                  {user?.role === 'GUEST' 
                    ? 'Your event registrations and their status'
                    : 'Latest events created in the system'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventsLoading || dashboardLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Loading events...
                  </div>
                ) : (user?.role === 'GUEST' ? userDashboard?.registeredEvents : userDashboard?.recentEvents)?.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Name</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead>Location</TableHead>
                        {user?.role === 'GUEST' && <TableHead>Status</TableHead>}
                        <TableHead>Date</TableHead>
                        {user?.role !== 'GUEST' && <TableHead>Registrations</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(user?.role === 'GUEST' ? userDashboard?.registeredEvents : userDashboard?.recentEvents)?.slice(0, 10).map((eventData) => {
                        const event = user?.role === 'GUEST' ? eventData.event : eventData;
                        return (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">{event.eventName}</TableCell>
                            <TableCell>{event.tenant?.placeName || 'N/A'}</TableCell>
                            <TableCell>{event.locationName}</TableCell>
                            {user?.role === 'GUEST' && (
                              <TableCell>
                                <Badge variant={eventData.status === 'APPROVED' ? 'default' : eventData.status === 'PENDING' ? 'secondary' : 'destructive'}>
                                  {eventData.status}
                                </Badge>
                              </TableCell>
                            )}
                            <TableCell>{new Date(event.createdAt).toLocaleDateString()}</TableCell>
                            {user?.role !== 'GUEST' && (
                              <TableCell>{event._count?.eventUsers || 0}</TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {user?.role === 'GUEST' ? 'No event registrations found' : 'No recent events found'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">User Profile</h2>
              <p className="text-muted-foreground">
                Your account information and settings
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Your personal account details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profileLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      Loading profile...
                    </div>
                  ) : userProfile ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={userProfile.user.avatar} alt="User Avatar" />
                          <AvatarFallback className="text-lg">
                            {userProfile.user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">{userProfile.user.name}</h3>
                          <p className="text-muted-foreground">{userProfile.user.email}</p>
                          <Badge variant="outline">{userProfile.user.role}</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <Badge variant={userProfile.user.isActive ? "default" : "secondary"}>
                            {userProfile.user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Member Since:</span>
                          <span className="text-sm">{new Date(userProfile.user.createdAt).toLocaleDateString()}</span>
                        </div>
                        {userProfile.user.managedTenants?.length > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Managed Venues:</span>
                            <span className="text-sm">{userProfile.user.managedTenants.length}</span>
                          </div>
                        )}
                        {userProfile.user.createdTenants?.length > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Created Venues:</span>
                            <span className="text-sm">{userProfile.user.createdTenants.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Failed to load profile information</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                  <CardDescription>
                    Manage your account settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    Update Profile
                  </Button>
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full">
                    Privacy Settings
                  </Button>
                  <Button variant="destructive" className="w-full" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UserDashboard;
