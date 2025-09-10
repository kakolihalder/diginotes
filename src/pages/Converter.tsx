import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  FileText, 
  Images, 
  Sparkles,
  RefreshCw 
} from 'lucide-react';
import { NoteUploader } from '@/components/NoteUploader';
import { ConversionSelector, ConversionType } from '@/components/ConversionSelector';
import { DirectConverter } from '@/components/DirectConverter';
import { OCRProcessor } from '@/components/OCRProcessor';
import { TextEditor } from '@/components/TextEditor';
import { DocumentGallery } from '@/components/DocumentGallery';
import { useToast } from '@/hooks/use-toast';
import { 
  exportToPDF, 
  exportToDOCX, 
  exportToTXT, 
  saveDocument,
  DocumentData 
} from '@/utils/exportUtils';

type ProcessingStage = 'upload' | 'select-conversion' | 'direct-processing' | 'ocr-processing' | 'editing';

export default function Converter() {
  const [currentStage, setCurrentStage] = useState<ProcessingStage>('upload');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedConversionType, setSelectedConversionType] = useState<ConversionType | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('converter');
  const { toast } = useToast();

  const handleImageUpload = (file: File) => {
    setSelectedImage(file);
    setCurrentStage('select-conversion');
  };

  const handleConversionTypeSelect = (type: ConversionType) => {
    setSelectedConversionType(type);
    
    if (type === 'image-to-pdf') {
      setCurrentStage('direct-processing');
    } else {
      // For OCR-based conversions
      setCurrentStage('ocr-processing');
      setIsProcessing(true);
    }
  };

  const handleTextExtracted = (text: string) => {
    setExtractedText(text);
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    
    if (selectedConversionType === 'image-to-ocr') {
      setCurrentStage('editing');
      toast({
        title: "OCR Complete!",
        description: "Your handwritten text has been successfully extracted and is ready for editing.",
      });
    } else {
      // For direct conversions or auto-export OCR
      resetToUpload();
    }
  };

  const handleDirectConversionComplete = () => {
    resetToUpload();
  };

  const handleBackToSelector = () => {
    setCurrentStage('select-conversion');
    setSelectedConversionType(null);
  };

  const handleExport = async (text: string, format: 'pdf' | 'txt' | 'docx') => {
    try {
      const title = `Handwritten Notes - ${new Date().toLocaleDateString()}`;
      
      switch (format) {
        case 'pdf':
          await exportToPDF(text, title);
          break;
        case 'docx':
          await exportToDOCX(text, title);
          break;
        case 'txt':
          exportToTXT(text, title);
          break;
      }
      
      toast({
        title: "Export Successful",
        description: `Your document has been exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your document. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle direct OCR-to-format exports
  const handleDirectOCRExport = async (text: string) => {
    if (!selectedConversionType) return;
    
    try {
      const title = `Handwritten Notes - ${new Date().toLocaleDateString()}`;
      
      if (selectedConversionType === 'image-to-doc') {
        await exportToDOCX(text, title);
        toast({
          title: "DOCX Created!",
          description: "Your handwritten notes have been converted to a Word document.",
        });
      } else if (selectedConversionType === 'image-to-txt') {
        exportToTXT(text, title);
        toast({
          title: "Text File Created!",
          description: "Your handwritten notes have been converted to a text file.",
        });
      }
      
      // Auto-complete and reset
      setTimeout(() => {
        handleProcessingComplete();
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error creating your document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = (text: string) => {
    const title = `Document ${new Date().toLocaleDateString()}`;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    
    saveDocument({
      title,
      text,
      originalImage: selectedImage || undefined,
      wordCount,
    });
  };

  const handleDocumentSelect = (document: DocumentData) => {
    setExtractedText(document.text);
    setCurrentStage('editing');
    setActiveTab('converter');
    toast({
      title: "Document Loaded",
      description: `"${document.title}" has been loaded for editing`,
    });
  };

  const resetToUpload = () => {
    setCurrentStage('upload');
    setSelectedImage(null);
    setSelectedConversionType(null);
    setExtractedText('');
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
            Smart Document Converter
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Convert images to PDF instantly, or extract text with AI-powered OCR. Multiple formats, instant processing.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="converter" className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Converter
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center">
                <Images className="w-4 h-4 mr-2" />
                My Documents
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="converter" className="space-y-8">
            {currentStage !== 'upload' && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={resetToUpload}
                  className="transition-smooth"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Start New Conversion
                </Button>
              </div>
            )}

            {currentStage === 'upload' && (
              <NoteUploader
                onImageUpload={handleImageUpload}
                isProcessing={isProcessing}
              />
            )}

            {currentStage === 'select-conversion' && selectedImage && (
              <ConversionSelector
                onConversionTypeSelect={handleConversionTypeSelect}
                uploadedImage={selectedImage}
              />
            )}

            {currentStage === 'direct-processing' && selectedImage && selectedConversionType && (
              <DirectConverter
                imageFile={selectedImage}
                conversionType={selectedConversionType}
                onConversionComplete={handleDirectConversionComplete}
                onBack={handleBackToSelector}
              />
            )}

            {currentStage === 'ocr-processing' && selectedImage && (
              <div className="max-w-2xl mx-auto">
                <OCRProcessor
                  imageFile={selectedImage}
                  onTextExtracted={(text) => {
                    handleTextExtracted(text);
                    // Auto-export for direct conversions
                    if (selectedConversionType !== 'image-to-ocr') {
                      handleDirectOCRExport(text);
                    }
                  }}
                  onProcessingComplete={handleProcessingComplete}
                />
              </div>
            )}

            {currentStage === 'editing' && extractedText && (
              <div className="max-w-4xl mx-auto">
                <TextEditor
                  extractedText={extractedText}
                  onExport={handleExport}
                  onSave={handleSave}
                  originalImage={selectedImage || undefined}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="space-y-8">
            <DocumentGallery onDocumentSelect={handleDocumentSelect} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 text-center border-t border-border pt-8">
          <p className="text-sm text-muted-foreground mb-4">
            Multiple conversion options • AI-powered OCR • Instant PDF creation • All processing happens locally
          </p>
          <div className="flex justify-center space-x-8 text-xs text-muted-foreground">
            <span>✓ Image to PDF</span>
            <span>✓ OCR Text Extraction</span>
            <span>✓ Multiple Export Formats</span>
            <span>✓ Privacy Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}