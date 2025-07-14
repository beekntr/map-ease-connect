import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import QRCodeScanner from "@/components/QRCodeScanner";
import { useToast } from "@/hooks/use-toast";

const QRDemo = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'generate' | 'scan'>('generate');
  const [scanResults, setScanResults] = useState<string[]>([]);

  const handleScan = (data: string) => {
    setScanResults(prev => [data, ...prev.slice(0, 4)]); // Keep last 5 scans
    
    // Mock validation
    if (data.includes('event:') && data.includes('user:')) {
      toast({
        title: "Access Granted",
        description: "Valid QR code detected. Entry approved.",
      });
    } else {
      toast({
        title: "Invalid QR Code",
        description: "This QR code is not valid for this event.",
        variant: "destructive",
      });
    }
  };

  const mockQRData = `event:tech-conf-2024;user:user123;timestamp:${Date.now()}`;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-primary rounded-lg"></div>
            <div>
              <h1 className="text-xl font-bold">QR Code Demo</h1>
              <p className="text-sm text-muted-foreground">Test QR code generation and scanning</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-muted p-1 rounded-lg w-fit">
            <Button
              variant={activeTab === 'generate' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('generate')}
              size="sm"
            >
              Generate QR Code
            </Button>
            <Button
              variant={activeTab === 'scan' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('scan')}
              size="sm"
            >
              Scan QR Code
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* QR Code Generation */}
            {activeTab === 'generate' && (
              <>
                <div>
                  <QRCodeGenerator
                    data={mockQRData}
                    title="Event Access Code"
                    description="This is your unique access code for Tech Conference 2024"
                    size={250}
                  />
                </div>

                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>QR Code Information</CardTitle>
                    <CardDescription>
                      Details about the generated QR code
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Encoded Data:</h4>
                      <p className="text-sm text-muted-foreground font-mono bg-surface p-2 rounded break-all">
                        {mockQRData}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Usage Instructions:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Save the QR code to your device</li>
                        <li>• Present it at the venue entrance</li>
                        <li>• Staff will scan to validate your entry</li>
                        <li>• Code is valid for single use only</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-warning/10 border border-warning/20 rounded">
                      <p className="text-sm text-warning-foreground">
                        <strong>Important:</strong> Keep this QR code secure and don't share it with others.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* QR Code Scanning */}
            {activeTab === 'scan' && (
              <>
                <div>
                  <QRCodeScanner 
                    onScan={handleScan}
                    eventId="tech-conf-2024"
                  />
                </div>

                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Scan Results</CardTitle>
                    <CardDescription>
                      Recent QR code scan attempts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {scanResults.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-4xl mb-2">📱</div>
                        <p>No scans yet</p>
                        <p className="text-sm">Scan a QR code to see results here</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {scanResults.map((result, index) => (
                          <div key={index} className="p-3 bg-surface rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Scan #{scanResults.length - index}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date().toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm font-mono text-muted-foreground break-all">
                              {result}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Validation Rules:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• QR code must contain event ID</li>
                        <li>• User ID must be pre-approved</li>
                        <li>• Code expires after first scan</li>
                        <li>• Timestamp validates recency</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRDemo;