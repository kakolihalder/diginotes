import { useEffect, useState } from 'react';
import Tesseract from 'tesseract.js';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Brain } from 'lucide-react';

interface OCRProcessorProps {
  imageFile: File | null;
  onTextExtracted: (text: string) => void;
  onProcessingComplete: () => void;
}

interface ProcessingStage {
  name: string;
  progress: number;
  status: 'pending' | 'processing' | 'complete';
}

export const OCRProcessor = ({ imageFile, onTextExtracted, onProcessingComplete }: OCRProcessorProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [stages, setStages] = useState<ProcessingStage[]>([
    { name: 'Loading Image', progress: 0, status: 'pending' },
    { name: 'Initializing OCR Engine', progress: 0, status: 'pending' },
    { name: 'Analyzing Handwriting', progress: 0, status: 'pending' },
    { name: 'Extracting Text', progress: 0, status: 'pending' },
    { name: 'Finalizing Results', progress: 0, status: 'pending' },
  ]);

  useEffect(() => {
    if (!imageFile) return;

    const processImage = async () => {
      try {
        const imageUrl = URL.createObjectURL(imageFile);
        
        const result = await Tesseract.recognize(imageUrl, 'eng', {
          logger: (m) => {
            setCurrentStage(m.status);
            setProgress(m.progress * 100);
            
            // Update stages based on progress
            setStages(prev => prev.map((stage, index) => {
              const stageProgress = Math.max(0, Math.min(100, (m.progress * 100 - index * 20)));
              let status: 'pending' | 'processing' | 'complete' = 'pending';
              
              if (stageProgress > 0 && stageProgress < 100) {
                status = 'processing';
              } else if (stageProgress >= 100) {
                status = 'complete';
              }
              
              return {
                ...stage,
                progress: stageProgress,
                status
              };
            }));
          },
        });

        onTextExtracted(result.data.text);
        
        // Mark all stages as complete
        setStages(prev => prev.map(stage => ({ ...stage, progress: 100, status: 'complete' })));
        
        setTimeout(() => {
          onProcessingComplete();
        }, 1000);
        
        URL.revokeObjectURL(imageUrl);
      } catch (error) {
        console.error('OCR processing failed:', error);
        setStages(prev => prev.map(stage => ({ ...stage, status: 'pending' })));
      }
    };

    processImage();
  }, [imageFile, onTextExtracted, onProcessingComplete]);

  if (!imageFile) return null;

  return (
    <Card className="document-card">
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            AI Processing in Progress
          </h3>
          <p className="text-muted-foreground">
            Our advanced OCR engine is analyzing your handwritten notes
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {Math.round(progress)}%
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <div className="space-y-3">
            {stages.map((stage, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center space-x-3">
                  {stage.status === 'complete' ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : stage.status === 'processing' ? (
                    <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <span className={`font-medium ${
                    stage.status === 'complete' ? 'text-success' :
                    stage.status === 'processing' ? 'text-primary' :
                    'text-muted-foreground'
                  }`}>
                    {stage.name}
                  </span>
                </div>
                
                <div className="text-sm font-medium text-muted-foreground">
                  {Math.round(stage.progress)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {currentStage && (
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <p className="text-sm text-primary font-medium">
              Current Status: {currentStage}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};