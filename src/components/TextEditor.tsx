import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Copy, 
  RotateCcw, 
  Save,
  FileDown,
  PenTool 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TextEditorProps {
  extractedText: string;
  onExport: (text: string, format: 'pdf' | 'txt' | 'docx') => void;
  onSave: (text: string) => void;
  originalImage?: File;
}

export const TextEditor = ({ extractedText, onExport, onSave, originalImage }: TextEditorProps) => {
  const [editedText, setEditedText] = useState(extractedText);
  const [wordCount, setWordCount] = useState(extractedText.split(/\s+/).filter(Boolean).length);
  const { toast } = useToast();

  const handleTextChange = useCallback((value: string) => {
    setEditedText(value);
    setWordCount(value.split(/\s+/).filter(Boolean).length);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(editedText);
    toast({
      title: "Text Copied",
      description: "The text has been copied to your clipboard",
    });
  }, [editedText, toast]);

  const handleReset = useCallback(() => {
    setEditedText(extractedText);
    setWordCount(extractedText.split(/\s+/).filter(Boolean).length);
    toast({
      title: "Text Reset",
      description: "Text has been reset to original OCR result",
    });
  }, [extractedText, toast]);

  const handleSave = useCallback(() => {
    onSave(editedText);
    toast({
      title: "Document Saved",
      description: "Your document has been saved successfully",
    });
  }, [editedText, onSave, toast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="document-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <PenTool className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Edit Extracted Text</h3>
              <p className="text-sm text-muted-foreground">
                Review and edit the OCR results before exporting
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-sm">
              {wordCount} words
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {editedText.length} characters
            </Badge>
          </div>
        </div>
      </Card>

      {/* Text Editor */}
      <Card className="document-card">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Extracted Text</h4>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="transition-smooth"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="transition-smooth"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>
          
          <Textarea
            value={editedText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="min-h-[300px] bg-editor-bg font-mono text-sm leading-relaxed resize-none"
            placeholder="Your extracted text will appear here..."
          />
        </div>
      </Card>

      {/* Export Options */}
      <Card className="document-card">
        <div className="space-y-4">
          <h4 className="font-medium text-foreground mb-4">Export Options</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Button
              onClick={handleSave}
              className="gradient-primary text-primary-foreground transition-smooth hover:shadow-glow"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Document
            </Button>
            
            <Button
              variant="outline"
              onClick={() => onExport(editedText, 'pdf')}
              className="transition-smooth hover:bg-primary/5"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            
            <Button
              variant="outline"
              onClick={() => onExport(editedText, 'docx')}
              className="transition-smooth hover:bg-primary/5"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export DOCX
            </Button>
            
            <Button
              variant="outline"
              onClick={() => onExport(editedText, 'txt')}
              className="transition-smooth hover:bg-primary/5"
            >
              <Download className="w-4 h-4 mr-2" />
              Export TXT
            </Button>
          </div>
          
          <div className="text-center pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Your documents are processed locally and never stored on our servers
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};