import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    placeName: "",
    subdomain: "",
    svgFile: null as File | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement tenant creation
    toast({
      title: "Tenant Created",
      description: `Successfully created ${formData.placeName} at ${formData.subdomain}.mapease.com`,
    });
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
              <span className="text-sm text-muted-foreground">Super Admin</span>
              <Button variant="outline" size="sm">Logout</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
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
                  <div className="flex">
                    <Input
                      id="subdomain"
                      placeholder="e.g. downtown-center"
                      value={formData.subdomain}
                      onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                      className="rounded-r-none"
                      required
                    />
                    <div className="px-3 py-2 bg-muted border border-l-0 rounded-r-md text-sm text-muted-foreground flex items-center">
                      .mapease.com
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="svgFile">Venue Map (SVG)</Label>
                  <Input
                    id="svgFile"
                    type="file"
                    accept=".svg"
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary-dark"
                    required
                  />
                  {formData.svgFile && (
                    <p className="text-sm text-success">
                      Selected: {formData.svgFile.name}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" variant="gradient" size="lg">
                  Create Tenant
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Tenants */}
          <Card className="mt-8 shadow-md">
            <CardHeader>
              <CardTitle>Recent Tenants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Example tenants */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium">Campus Convention Center</h4>
                    <p className="text-sm text-muted-foreground">campus-center.mapease.com</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium">Tech Hub Building</h4>
                    <p className="text-sm text-muted-foreground">tech-hub.mapease.com</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;