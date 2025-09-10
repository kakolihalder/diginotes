import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  MoreVertical, 
  Trash2, 
  Download,
  Edit,
  Eye,
  FolderOpen
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DocumentData, getStoredDocuments, deleteDocument } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';

interface DocumentGalleryProps {
  onDocumentSelect?: (document: DocumentData) => void;
}

export const DocumentGallery = ({ onDocumentSelect }: DocumentGalleryProps) => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    const docs = getStoredDocuments();
    setDocuments(docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const handleDelete = (id: string, title: string) => {
    deleteDocument(id);
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast({
      title: "Document Deleted",
      description: `"${title}" has been deleted successfully`,
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (documents.length === 0) {
    return (
      <Card className="document-card text-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
          <FolderOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No Documents Yet</h3>
        <p className="text-muted-foreground">
          Start by uploading your first handwritten note to see it here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Documents</h2>
          <p className="text-muted-foreground">
            {documents.length} document{documents.length !== 1 ? 's' : ''} saved locally
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadDocuments}
          className="transition-smooth"
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <Card key={doc.id} className="document-card group hover:shadow-medium">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {truncateText(doc.text)}
                  </p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-smooth"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onDocumentSelect?.(doc)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDocumentSelect?.(doc)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(doc.id, doc.title)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(doc.createdAt)}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {doc.wordCount} words
                  </Badge>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDocumentSelect?.(doc)}
                  className="transition-smooth"
                >
                  <FileText className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};