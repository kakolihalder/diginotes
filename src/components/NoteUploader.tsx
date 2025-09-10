import { useCallback, useState } from 'react';
import { Upload, Camera, FileImage, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface NoteUploaderProps {
  onImageUpload: (file: File) => void;
  isProcessing: boolean;
}

export const NoteUploader = ({ onImageUpload, isProcessing }: NoteUploaderProps) => {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      } else {
        toast({
          title: "Invalid File",
          description: "Please upload an image file (PNG, JPG, JPEG)",
          variant: "destructive",
        });
      }
    }
  }, [onImageUpload, toast]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      } else {
        toast({
          title: "Invalid File",
          description: "Please upload an image file (PNG, JPG, JPEG)",
          variant: "destructive",
        });
      }
    }
  }, [onImageUpload, toast]);

  const handleCameraCapture = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        onImageUpload(target.files[0]);
      }
    };
    input.click();
  }, [onImageUpload]);

  return (
    <Card className="document-card">
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          {isProcessing ? (
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          ) : (
            <FileImage className="w-8 h-8 text-primary" />
          )}
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Upload Your Handwritten Notes
          </h2>
          <p className="text-muted-foreground">
            Convert your handwritten notes to editable digital text using AI-powered OCR
          </p>
        </div>

        <div
          className={`upload-zone ${dragActive ? 'border-primary bg-primary/5' : ''} ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">
            Drop your image here, or click to browse
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Supports PNG, JPG, JPEG up to 10MB
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('file-input')?.click()}
              disabled={isProcessing}
              className="transition-smooth"
            >
              <Upload className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCameraCapture}
              disabled={isProcessing}
              className="transition-smooth"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
          </div>
          
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {isProcessing && (
          <div className="bg-primary/10 rounded-lg p-4">
            <p className="text-sm text-primary font-medium">
              Processing your image with AI OCR technology...
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};