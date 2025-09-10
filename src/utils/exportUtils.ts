import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export interface DocumentData {
  id: string;
  title: string;
  text: string;
  originalImage?: File;
  createdAt: Date;
  wordCount: number;
}

export const exportToPDF = async (text: string, title: string = 'Converted Document'): Promise<void> => {
  try {
    const doc = new jsPDF();
    
    // Set font and title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, 20);
    
    // Add creation date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Created: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Add content
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // Split text into lines that fit the page width
    const pageWidth = doc.internal.pageSize.getWidth();
    const margins = 20;
    const maxLineWidth = pageWidth - 2 * margins;
    
    const lines = doc.splitTextToSize(text, maxLineWidth);
    let yPosition = 45;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.getHeight();
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margins) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margins, yPosition);
      yPosition += lineHeight;
    });
    
    // Save the PDF
    doc.save(`${title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export PDF');
  }
};

export const exportToDOCX = async (text: string, title: string = 'Converted Document'): Promise<void> => {
  try {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: title,
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Created: ${new Date().toLocaleDateString()}`,
                size: 20,
                color: "666666",
              }),
            ],
          }),
          new Paragraph({
            children: [new TextRun("")], // Empty line
          }),
          ...text.split('\n').map(paragraph => 
            new Paragraph({
              children: [
                new TextRun({
                  text: paragraph,
                  size: 24,
                }),
              ],
            })
          ),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
    throw new Error('Failed to export DOCX');
  }
};

export const exportToTXT = (text: string, title: string = 'Converted Document'): void => {
  try {
    const content = `${title}\nCreated: ${new Date().toLocaleDateString()}\n\n${text}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to TXT:', error);
    throw new Error('Failed to export TXT');
  }
};

export const saveDocument = (documentData: Omit<DocumentData, 'id' | 'createdAt'>): DocumentData => {
  const doc: DocumentData = {
    id: generateId(),
    createdAt: new Date(),
    ...documentData,
  };
  
  // Get existing documents from localStorage
  const existingDocs = getStoredDocuments();
  const updatedDocs = [...existingDocs, doc];
  
  // Store in localStorage
  localStorage.setItem('handwritten_documents', JSON.stringify(updatedDocs));
  
  return doc;
};

export const getStoredDocuments = (): DocumentData[] => {
  try {
    const stored = localStorage.getItem('handwritten_documents');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading stored documents:', error);
    return [];
  }
};

export const deleteDocument = (id: string): void => {
  const existingDocs = getStoredDocuments();
  const updatedDocs = existingDocs.filter(doc => doc.id !== id);
  localStorage.setItem('handwritten_documents', JSON.stringify(updatedDocs));
};

const generateId = (): string => {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};