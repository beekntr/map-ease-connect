import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const EventRegistration = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement registration submission
    toast({
      title: "Registration Submitted",
      description: "Your registration has been submitted for approval.",
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-success-foreground text-2xl">✓</div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Registration Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for registering. Your application is now pending approval. 
              You'll receive a QR code via email once approved.
            </p>
            <div className="p-4 bg-surface rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Next Steps:</strong><br />
                1. Wait for approval notification<br />
                2. Download your QR code<br />
                3. Present it at the venue entrance
              </p>
            </div>
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
            <div>
              <h1 className="text-xl font-bold">MapEase</h1>
              <p className="text-sm text-muted-foreground">Campus Convention Center</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Event Info */}
          <Card className="mb-8 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Tech Conference 2024</CardTitle>
              <CardDescription>Main Hall • March 15, 2024</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-warning/10 text-warning">
                <span className="w-2 h-2 bg-warning rounded-full mr-2"></span>
                Closed Event - Approval Required
              </div>
              <p className="mt-4 text-muted-foreground">
                Join us for an exciting day of technology talks, networking, and innovation. 
                Please complete the registration form below to request access.
              </p>
            </CardContent>
          </Card>

          {/* Registration Form */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Event Registration</CardTitle>
              <CardDescription>
                Please provide your details to register for this event.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="p-4 bg-surface rounded-lg">
                  <h4 className="font-medium mb-2">What happens next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your registration will be reviewed by event organizers</li>
                    <li>• You'll receive an email notification with approval status</li>
                    <li>• Approved attendees get a unique QR code for venue entry</li>
                    <li>• Present your QR code at the entrance on event day</li>
                  </ul>
                </div>

                <Button type="submit" className="w-full" variant="gradient" size="lg">
                  Submit Registration
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card className="mt-8 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time:</span>
                <span>March 15, 2024 • 9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span>Main Hall, Campus Convention Center</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event Type:</span>
                <span>Closed (Approval Required)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Organizer:</span>
                <span>Campus Convention Center</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EventRegistration;