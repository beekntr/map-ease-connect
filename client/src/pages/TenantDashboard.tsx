import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const TenantDashboard = () => {
  const { toast } = useToast();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [eventForm, setEventForm] = useState({
    name: "",
    location: "",
    type: "",
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement event creation
    toast({
      title: "Event Created",
      description: `Successfully created ${eventForm.name}`,
    });
    setShowCreateEvent(false);
    setEventForm({ name: "", location: "", type: "" });
  };

  const events = [
    {
      id: 1,
      name: "Tech Conference 2024",
      location: "Main Hall",
      type: "Closed",
      registrations: 45,
      approved: 42,
      pending: 3,
      shareLink: "https://campus-center.mapease.com/register/tech-conf-2024",
    },
    {
      id: 2,
      name: "Open House",
      location: "Lobby Area",
      type: "Open",
      registrations: 127,
      approved: 98,
      pending: 29,
      shareLink: "https://campus-center.mapease.com/register/open-house",
    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg"></div>
              <div>
                <h1 className="text-xl font-bold">Campus Convention Center</h1>
                <p className="text-sm text-muted-foreground">campus-center.mapease.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Tenant Admin</span>
              <Button variant="outline" size="sm">Logout</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Event Dashboard</h2>
            <p className="text-muted-foreground">
              Manage your events, registrations, and venue access.
            </p>
          </div>
          <Button 
            variant="gradient" 
            onClick={() => setShowCreateEvent(true)}
          >
            Create Event
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">2</div>
              <p className="text-sm text-muted-foreground">Active Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-success">172</div>
              <p className="text-sm text-muted-foreground">Total Registrations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-warning">32</div>
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-secondary">89</div>
              <p className="text-sm text-muted-foreground">Scanned Entries</p>
            </CardContent>
          </Card>
        </div>

        {/* Create Event Form */}
        {showCreateEvent && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle>Create New Event</CardTitle>
              <CardDescription>Set up a new event for your venue.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventName">Event Name</Label>
                    <Input
                      id="eventName"
                      placeholder="e.g. Tech Conference 2024"
                      value={eventForm.name}
                      onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g. Main Hall"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select value={eventForm.type} onValueChange={(value) => setEventForm({ ...eventForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open (Public access)</SelectItem>
                      <SelectItem value="closed">Closed (Approval required)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" variant="gradient">Create Event</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateEvent(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Events List */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Your Events</h3>
          <div className="grid gap-6">
            {events.map((event) => (
              <Card key={event.id} className="shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        {event.name}
                        <Badge variant={event.type === "Open" ? "secondary" : "outline"}>
                          {event.type}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{event.location}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-surface rounded-lg">
                      <div className="text-lg font-semibold">{event.registrations}</div>
                      <div className="text-sm text-muted-foreground">Registrations</div>
                    </div>
                    <div className="text-center p-3 bg-surface rounded-lg">
                      <div className="text-lg font-semibold text-success">{event.approved}</div>
                      <div className="text-sm text-muted-foreground">Approved</div>
                    </div>
                    <div className="text-center p-3 bg-surface rounded-lg">
                      <div className="text-lg font-semibold text-warning">{event.pending}</div>
                      <div className="text-sm text-muted-foreground">Pending</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Share Link</Label>
                    <div className="flex gap-2">
                      <Input value={event.shareLink} readOnly className="text-xs" />
                      <Button size="sm" variant="outline">Copy</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TenantDashboard;