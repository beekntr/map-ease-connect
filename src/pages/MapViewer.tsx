import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const MapViewer = () => {
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);

  // Mock SVG map data - in real implementation, this would come from the backend
  const destinations = [
    { id: "main-hall", name: "Main Hall", x: 300, y: 200 },
    { id: "lobby", name: "Lobby", x: 150, y: 100 },
    { id: "restroom", name: "Restroom", x: 400, y: 150 },
    { id: "cafe", name: "Café", x: 250, y: 350 },
    { id: "exit", name: "Exit", x: 100, y: 300 },
  ];

  const handleDestinationClick = (destination: string) => {
    setSelectedDestination(destination);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg"></div>
              <div>
                <h1 className="text-xl font-bold">Campus Convention Center</h1>
                <p className="text-sm text-muted-foreground">Interactive Map</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-sm text-success">Access Granted</span>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Message */}
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-success rounded-full flex items-center justify-center">
                <div className="text-success-foreground text-xl">✓</div>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Welcome to Tech Conference 2024!</h2>
                <p className="text-muted-foreground">
                  Your QR code has been verified. Navigate the venue using the interactive map below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map Container */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Venue Map</CardTitle>
                <CardDescription>
                  Click on any location below to get directions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gradient-secondary rounded-lg p-4">
                  {/* Mock SVG Map */}
                  <svg
                    viewBox="0 0 500 400"
                    className="w-full h-auto max-h-96 border border-border rounded"
                    style={{ backgroundColor: '#f8fafc' }}
                  >
                    {/* Building outline */}
                    <rect
                      x="50"
                      y="50"
                      width="400"
                      height="300"
                      fill="none"
                      stroke="#334155"
                      strokeWidth="2"
                    />
                    
                    {/* Rooms */}
                    <rect x="80" y="80" width="120" height="80" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
                    <text x="140" y="125" textAnchor="middle" fontSize="12" fill="#475569">Lobby</text>
                    
                    <rect x="220" y="80" width="180" height="120" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
                    <text x="310" y="145" textAnchor="middle" fontSize="14" fill="#1e40af" fontWeight="bold">Main Hall</text>
                    
                    <rect x="80" y="180" width="80" height="60" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
                    <text x="120" y="215" textAnchor="middle" fontSize="10" fill="#92400e">Restroom</text>
                    
                    <rect x="220" y="220" width="100" height="80" fill="#d1fae5" stroke="#10b981" strokeWidth="1" />
                    <text x="270" y="265" textAnchor="middle" fontSize="12" fill="#047857">Café</text>
                    
                    <rect x="350" y="220" width="80" height="60" fill="#fecaca" stroke="#ef4444" strokeWidth="1" />
                    <text x="390" y="255" textAnchor="middle" fontSize="12" fill="#dc2626">Exit</text>

                    {/* Interactive points */}
                    {destinations.map((dest) => (
                      <circle
                        key={dest.id}
                        cx={dest.x}
                        cy={dest.y}
                        r="8"
                        fill={selectedDestination === dest.id ? "#3b82f6" : "#6366f1"}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="cursor-pointer hover:fill-primary transition-colors"
                        onClick={() => handleDestinationClick(dest.id)}
                      />
                    ))}

                    {/* Current location */}
                    <circle cx="140" cy="320" r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="3">
                      <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <text x="140" y="340" textAnchor="middle" fontSize="10" fill="#dc2626" fontWeight="bold">You are here</text>
                  </svg>
                </div>

                {selectedDestination && (
                  <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <h4 className="font-medium text-primary mb-2">
                      Navigation to {destinations.find(d => d.id === selectedDestination)?.name}
                    </h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>🚶 Walk straight from your current location</p>
                      <p>➡️ Turn right at the main corridor</p>
                      <p>📍 Destination will be on your left</p>
                      <p className="text-primary font-medium">Estimated time: 2 minutes</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {destinations.map((dest) => (
                  <Button
                    key={dest.id}
                    variant={selectedDestination === dest.id ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleDestinationClick(dest.id)}
                  >
                    📍 {dest.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Event Info */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium">Current Event</div>
                  <div className="text-sm text-muted-foreground">Tech Conference 2024</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Time</div>
                  <div className="text-sm text-muted-foreground">9:00 AM - 6:00 PM</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Main Location</div>
                  <div className="text-sm text-muted-foreground">Main Hall</div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Event Schedule
                </Button>
              </CardContent>
            </Card>

            {/* Help */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  Find Staff
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Emergency Info
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapViewer;