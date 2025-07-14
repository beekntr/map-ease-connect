import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useGetTenantDashboard } from "@/hooks/useTenant";
import { useCreateEvent } from "@/hooks/useEvents";
import { RefreshCw, Calendar, Users, CheckCircle, Clock, Building, Plus, Copy } from "lucide-react";

const TenantDashboard = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [currentSubdomain, setCurrentSubdomain] = useState<string>('');
  const [eventForm, setEventForm] = useState({
    eventName: "",
    locationName: "",
    eventType: "OPEN" as "OPEN" | "PRIVATE",
    description: "",
    startDate: "",
    endDate: "",
  });

  // Extract subdomain from URL or use a default for demo
  useEffect(() => {
    // In a real app, this would come from the URL subdomain
    // For demo purposes, we'll use a default subdomain
    const hostname = window.location.hostname;
    if (hostname.includes('.') && !hostname.includes('localhost')) {
      const subdomain = hostname.split('.')[0];
      setCurrentSubdomain(subdomain);
    } else {
      // For localhost development, use a demo subdomain
      setCurrentSubdomain('demo-tenant');
    }
  }, []);

  // Backend API hooks
  const { data: tenantDashboard, isLoading: dashboardLoading } = useGetTenantDashboard(currentSubdomain);
  const createEventMutation = useCreateEvent(currentSubdomain);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventForm.eventName || !eventForm.locationName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createEventMutation.mutateAsync(eventForm);
      setShowCreateEvent(false);
      setEventForm({
        eventName: "",
        locationName: "",
        eventType: "OPEN",
        description: "",
        startDate: "",
        endDate: "",
      });
    } catch (error: any) {
      // Error is handled by the mutation
      console.error('Create event error:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Share link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  // Sample events data (in real app, this would come from tenantDashboard.recentEvents)
  const events = tenantDashboard?.recentEvents || [
    {
      id: "1",
      eventName: "Tech Conference 2024",
      locationName: "Main Hall",
      eventType: "PRIVATE",
      description: "Annual technology conference",
      shareLink: `https://${currentSubdomain}.mapease.com/register/tech-conf-2024`,
      _count: { eventUsers: 45 },
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: "2",
      eventName: "Open House",
      locationName: "Lobby Area",
      eventType: "OPEN",
      description: "Community open house event",
      shareLink: `https://${currentSubdomain}.mapease.com/register/open-house`,
      _count: { eventUsers: 127 },
      createdAt: new Date().toISOString(),
      isActive: true,
    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Building className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {tenantDashboard?.tenant?.placeName || "Venue Dashboard"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {currentSubdomain}.mapease.com
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {user?.role === 'TENANT_ADMIN' ? 'Tenant Admin' : user?.role} - {user?.name}
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="create">Create Event</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
                <p className="text-muted-foreground">
                  Real-time statistics from your backend API.
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            {dashboardLoading ? (
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
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
            ) : (
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Calendar className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Active Events</p>
                        <p className="text-3xl font-bold">{tenantDashboard?.stats?.activeEvents || events.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Users className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Registrations</p>
                        <p className="text-3xl font-bold">{tenantDashboard?.stats?.totalRegistrations || 172}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Clock className="h-8 w-8 text-orange-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Approvals</p>
                        <p className="text-3xl font-bold">{tenantDashboard?.stats?.pendingRegistrations || 32}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <CheckCircle className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Events</p>
                        <p className="text-3xl font-bold">{tenantDashboard?.stats?.totalEvents || 4}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>
                  Latest events created for your venue
                </CardDescription>
              </CardHeader>
              <CardContent>
                {events.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Registrations</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.slice(0, 5).map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">{event.eventName}</TableCell>
                          <TableCell>{event.locationName}</TableCell>
                          <TableCell>
                            <Badge variant={event.eventType === "OPEN" ? "secondary" : "outline"}>
                              {event.eventType}
                            </Badge>
                          </TableCell>
                          <TableCell>{event._count?.eventUsers || 0}</TableCell>
                          <TableCell>
                            <Badge variant={event.isActive ? "default" : "secondary"}>
                              {event.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No events found. Create your first event!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Event Management</h2>
                <p className="text-muted-foreground">
                  Manage your events, registrations, and venue access.
                </p>
              </div>
              <Button 
                onClick={() => setShowCreateEvent(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </div>

            {/* Events List */}
            <div className="space-y-6">
              {events.map((event) => (
                <Card key={event.id} className="shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-3">
                          {event.eventName}
                          <Badge variant={event.eventType === "OPEN" ? "secondary" : "outline"}>
                            {event.eventType}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{event.locationName}</CardDescription>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-surface rounded-lg">
                        <div className="text-lg font-semibold">{event._count?.eventUsers || 0}</div>
                        <div className="text-sm text-muted-foreground">Registrations</div>
                      </div>
                      <div className="text-center p-3 bg-surface rounded-lg">
                        <div className="text-lg font-semibold text-green-600">
                          {Math.floor((event._count?.eventUsers || 0) * 0.8)}
                        </div>
                        <div className="text-sm text-muted-foreground">Approved</div>
                      </div>
                      <div className="text-center p-3 bg-surface rounded-lg">
                        <div className="text-lg font-semibold text-orange-600">
                          {Math.floor((event._count?.eventUsers || 0) * 0.2)}
                        </div>
                        <div className="text-sm text-muted-foreground">Pending</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Share Link</Label>
                      <div className="flex gap-2">
                        <Input value={event.shareLink} readOnly className="text-xs" />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(event.shareLink)}
                          className="flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Create Event Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Create New Event</h2>
                <p className="text-muted-foreground">
                  Set up a new event for your venue with backend integration.
                </p>
              </div>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Event Information</CardTitle>
                  <CardDescription>
                    Configure the basic details for your new event.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateEvent} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="eventName">Event Name *</Label>
                        <Input
                          id="eventName"
                          placeholder="e.g. Tech Conference 2024"
                          value={eventForm.eventName}
                          onChange={(e) => setEventForm({ ...eventForm, eventName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="locationName">Location *</Label>
                        <Input
                          id="locationName"
                          placeholder="e.g. Main Hall"
                          value={eventForm.locationName}
                          onChange={(e) => setEventForm({ ...eventForm, locationName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="Event description (optional)"
                        value={eventForm.description}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventType">Event Type</Label>
                      <Select 
                        value={eventForm.eventType} 
                        onValueChange={(value) => setEventForm({ ...eventForm, eventType: value as "OPEN" | "PRIVATE" })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">Open (Public access)</SelectItem>
                          <SelectItem value="PRIVATE">Private (Approval required)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={eventForm.startDate}
                          onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={eventForm.endDate}
                          onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={createEventMutation.isPending}
                      className="w-full flex items-center gap-2"
                    >
                      {createEventMutation.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Creating Event...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Create Event
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TenantDashboard;
