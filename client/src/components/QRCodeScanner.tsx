import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  eventId?: string;
}

const QRCodeScanner = ({ onScan, eventId }: QRCodeScannerProps) => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to scan QR codes.",
        variant: "destructive",
      });
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScanResult = (data: string) => {
    // TODO: Implement actual QR code detection
    // This is a placeholder - you'd need a proper QR code detection library
    setLastScanned(data);
    onScan(data);
    toast({
      title: "QR Code Scanned",
      description: "Validating entry...",
    });
  };

  // Mock scan for demo purposes
  const mockScan = () => {
    const mockData = `event:${eventId || 'demo'};user:user123;timestamp:${Date.now()}`;
    handleScanResult(mockData);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle>QR Code Scanner</CardTitle>
        <CardDescription>
          Scan attendee QR codes to grant venue access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isScanning ? (
          <div className="text-center space-y-4">
            <div className="h-64 bg-surface rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-4xl mb-2">📷</div>
                <p>Camera preview will appear here</p>
              </div>
            </div>
            <Button onClick={startScanning} variant="gradient" className="w-full">
              Start Scanning
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-black rounded-lg"
              />
              <div className="absolute inset-4 border-2 border-primary rounded-lg pointer-events-none">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={stopScanning} variant="outline" className="flex-1">
                Stop Scanning
              </Button>
              <Button onClick={mockScan} variant="secondary" className="flex-1">
                Mock Scan (Demo)
              </Button>
            </div>
          </div>
        )}

        {lastScanned && (
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
            <h4 className="font-medium text-success mb-2">Last Scanned:</h4>
            <p className="text-sm text-muted-foreground font-mono break-all">
              {lastScanned}
            </p>
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Position the QR code within the frame to scan
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;