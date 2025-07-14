import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface QRCodeGeneratorProps {
  data: string;
  title?: string;
  description?: string;
  size?: number;
}

const QRCodeGenerator = ({ 
  data, 
  title = "Your Access QR Code", 
  description = "Present this code at the venue entrance",
  size = 200 
}: QRCodeGeneratorProps) => {
  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = function() {
        canvas.width = size;
        canvas.height = size;
        ctx?.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = 'qr-code.png';
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex justify-center p-4 bg-background rounded-lg">
          <QRCodeSVG
            id="qr-code"
            value={data}
            size={size}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
            includeMargin={true}
          />
        </div>
        
        <div className="space-y-2">
          <Button onClick={downloadQRCode} variant="gradient" className="w-full">
            Download QR Code
          </Button>
          <p className="text-xs text-muted-foreground">
            Keep this QR code safe. You'll need it to enter the venue.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;