import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  FileImage, 
  Download, 
  CheckCircle, 
  Settings,
  Loader2
} from 'lucide-react';
import { ConversionType } from './ConversionSelector';
import { useToast } from '@/hooks/use-toast';

interface DirectConverterProps {
  imageFile: File;
  conversionType: ConversionType;
  onConversionComplete: () => void;
  onBack: () => void;
}

export const DirectConverter = ({ 
  imageFile, 
  conversionType, 
  onConversionComplete,
  onBack 
}: DirectConverterProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const getConversionInfo = (type: ConversionType) => {
    switch (type) {
      case 'image-to-pdf':
        return {
          title: 'Converting Image to PDF',
          description: 'Creating high-quality PDF document from your image',
          outputFormat: 'PDF Document',
        };
      case 'image-to-ocr':
        return {
          title: 'Extracting Text with OCR',
          description: 'Using AI to read and extract text from your handwriting',
          outputFormat: 'Editable Text',
        };
      case 'image-to-doc':
        return {
          title: 'Creating DOCX Document',
          description: 'Extracting text and formatting as Word document',
          outputFormat: 'DOCX Document',
        };
      case 'image-to-txt':
        return {
          title: 'Extracting Plain Text',
          description: 'Converting handwriting to plain text format',
          outputFormat: 'Text File',
        };
      default:
        return {
          title: 'Processing Document',
          description: 'Converting your document',
          outputFormat: 'Document',
        };
    }
  };

  const handleDirectImageToPDF = async () => {
    const { jsPDF } = await import('jspdf');
    
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Calculate scaling to fit image on page
        const imgAspectRatio = img.width / img.height;
        const pageAspectRatio = pageWidth / pageHeight;
        
        let imgWidth, imgHeight, xOffset, yOffset;
        
        if (imgAspectRatio > pageAspectRatio) {
          // Image is wider, scale by width
          imgWidth = pageWidth - 20; // 10mm margin on each side
          imgHeight = imgWidth / imgAspectRatio;
          xOffset = 10;
          yOffset = (pageHeight - imgHeight) / 2;
        } else {
          // Image is taller, scale by height
          imgHeight = pageHeight - 20; // 10mm margin on top/bottom
          imgWidth = imgHeight * imgAspectRatio;
          xOffset = (pageWidth - imgWidth) / 2;
          yOffset = 10;
        }
        
        doc.addImage(img, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);
        doc.save(`handwritten-notes-${Date.now()}.pdf`);
        resolve();
      };
      img.src = URL.createObjectURL(imageFile);
    });
  };

  const startConversion = async () => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      if (conversionType === 'image-to-pdf') {
        await handleDirectImageToPDF();
      } else {
        // For OCR-based conversions, we'll need to redirect to the OCR component
        // This is handled in the parent component
      }

      clearInterval(progressInterval);
      setProgress(100);
      setIsComplete(true);
      
      toast({
        title: "Conversion Complete!",
        description: `Your ${getConversionInfo(conversionType).outputFormat} has been created successfully.`,
      });

      setTimeout(() => {
        onConversionComplete();
      }, 1500);

    } catch (error) {
      console.error('Conversion failed:', error);
      toast({
        title: "Conversion Failed",
        description: "There was an error processing your document. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const conversionInfo = getConversionInfo(conversionType);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="document-card">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            {isComplete ? (
              <CheckCircle className="w-8 h-8 text-success" />
            ) : isProcessing ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <FileImage className="w-8 h-8 text-primary" />
            )}
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {conversionInfo.title}
            </h2>
            <p className="text-muted-foreground">
              {conversionInfo.description}
            </p>
          </div>
        </div>
      </Card>

      {/* Image Preview */}
      <Card className="document-card">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">Source Image</h3>
            <Badge variant="secondary">{conversionInfo.outputFormat}</Badge>
          </div>
          
          <div className="relative">
            <img 
              src={URL.createObjectURL(imageFile)} 
              alt="Source document"
              className="w-full max-h-64 object-contain rounded-lg border border-border"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  <p className="text-sm font-medium text-primary">Processing...</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{imageFile.name}</span>
            <span>{(imageFile.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        </div>
      </Card>

      {/* Progress */}
      {isProcessing && (
        <Card className="document-card">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {Math.round(progress)}%
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {progress < 30 ? 'Initializing conversion...' :
                 progress < 60 ? 'Processing image...' :
                 progress < 90 ? 'Creating output file...' :
                 'Finalizing document...'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Success Message */}
      {isComplete && (
        <Card className="document-card">
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-success mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Conversion Complete!
              </h3>
              <p className="text-muted-foreground">
                Your {conversionInfo.outputFormat.toLowerCase()} has been downloaded successfully.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
          className="transition-smooth"
        >
          Back to Options
        </Button>
        
        {!isProcessing && !isComplete && (
          <Button
            onClick={startConversion}
            className="gradient-primary text-primary-foreground transition-smooth hover:shadow-glow"
          >
            <Settings className="w-4 h-4 mr-2" />
            Start Conversion
          </Button>
        )}

        {isComplete && (
          <Button
            onClick={onConversionComplete}
            className="gradient-primary text-primary-foreground transition-smooth"
          >
            <Download className="w-4 h-4 mr-2" />
            Convert Another
          </Button>
        )}
      </div>
    </div>
  );
};