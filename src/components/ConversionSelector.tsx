import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileImage, 
  FileText, 
  File, 
  Scan,
  Zap,
  ArrowRight
} from 'lucide-react';

export type ConversionType = 'image-to-pdf' | 'image-to-ocr' | 'image-to-doc' | 'image-to-txt';

interface ConversionOption {
  type: ConversionType;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  popular?: boolean;
}

interface ConversionSelectorProps {
  onConversionTypeSelect: (type: ConversionType) => void;
  uploadedImage: File;
}

export const ConversionSelector = ({ onConversionTypeSelect, uploadedImage }: ConversionSelectorProps) => {
  const conversionOptions: ConversionOption[] = [
    {
      type: 'image-to-pdf',
      title: 'Image to PDF',
      description: 'Convert your image directly to PDF format without text extraction',
      icon: <FileImage className="w-6 h-6" />,
      badge: 'Fast',
      popular: true,
    },
    {
      type: 'image-to-ocr',
      title: 'Extract Text (OCR)',
      description: 'Use AI to extract editable text from your handwritten notes',
      icon: <Scan className="w-6 h-6" />,
      badge: 'AI Powered',
    },
    {
      type: 'image-to-doc',
      title: 'Image to Document',
      description: 'Extract text and export directly to DOCX format',
      icon: <File className="w-6 h-6" />,
      badge: 'Smart',
    },
    {
      type: 'image-to-txt',
      title: 'Image to Text File',
      description: 'Extract text and save as plain text (.txt) file',
      icon: <FileText className="w-6 h-6" />,
      badge: 'Simple',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="document-card">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Choose Conversion Type
          </h2>
          <p className="text-muted-foreground">
            Select how you'd like to process your uploaded image
          </p>
        </div>
      </Card>

      {/* Image Preview */}
      <Card className="document-card">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-muted/30 rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              src={URL.createObjectURL(uploadedImage)} 
              alt="Uploaded note"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{uploadedImage.name}</h3>
            <p className="text-sm text-muted-foreground">
              {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      </Card>

      {/* Conversion Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {conversionOptions.map((option) => (
          <Card 
            key={option.type} 
            className={`document-card cursor-pointer transition-smooth hover:shadow-glow hover:-translate-y-1 ${
              option.popular ? 'ring-2 ring-primary/20' : ''
            }`}
            onClick={() => onConversionTypeSelect(option.type)}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-foreground">{option.title}</h3>
                      {option.badge && (
                        <Badge 
                          variant={option.popular ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {option.badge}
                        </Badge>
                      )}
                      {option.popular && (
                        <Badge variant="default" className="text-xs gradient-primary">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-smooth" />
              </div>

              <Button 
                className="w-full transition-smooth"
                variant={option.popular ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation();
                  onConversionTypeSelect(option.type);
                }}
              >
                {option.popular ? 'Convert Now' : 'Select'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Features Info */}
      <Card className="document-card">
        <div className="text-center">
          <h4 className="font-medium text-foreground mb-3">Why Choose Our Converter?</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
            <div>✓ Instant Processing</div>
            <div>✓ Privacy Protected</div>
            <div>✓ Multiple Formats</div>
            <div>✓ High Quality Output</div>
          </div>
        </div>
      </Card>
    </div>
  );
};