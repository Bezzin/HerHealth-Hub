import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function LoadingTailor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Get answers from sessionStorage (set by intake wizard)
    const storedAnswers = sessionStorage.getItem('intakeAnswers');
    
    if (!storedAnswers) {
      // No answers found, redirect to intake
      setLocation('/intake');
      return;
    }

    let answers;
    try {
      answers = JSON.parse(storedAnswers);
    } catch (error) {
      console.error('Invalid answers format:', error);
      setLocation('/intake');
      return;
    }

    // Simulate progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Submit answers to backend after 2 seconds
    const submitTimeout = setTimeout(async () => {
      try {
        const response = await apiRequest('POST', '/api/intake', { answers });
        const result = await response.json();
        
        // Complete progress
        setProgress(100);
        
        // Clear stored answers
        sessionStorage.removeItem('intakeAnswers');
        
        // Navigate to recommendation page with specialty
        setTimeout(() => {
          const specialtySlug = result.specialty.toLowerCase().replace(/\s+/g, '-');
          setLocation(`/recommendation?specialty=${encodeURIComponent(specialtySlug)}`);
        }, 500);
        
      } catch (error: any) {
        console.error('Error submitting intake:', error);
        toast({
          title: "Processing failed",
          description: "Please try completing the assessment again",
          variant: "destructive",
        });
        setLocation('/intake');
      } finally {
        clearInterval(progressInterval);
        setIsProcessing(false);
      }
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(submitTimeout);
    };
  }, [setLocation, toast]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-2xl opacity-20"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center text-white max-w-lg px-6">
        <div className="mb-8">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Hold tight while we tailor your consult
          </h1>
          
          <p className="text-lg text-white/80 mb-8">
            We're analyzing your responses to find the perfect specialist for your needs
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto">
          <div className="flex justify-between text-sm text-white/70 mb-2">
            <span>Processing assessment...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-3 bg-white/20" 
          />
        </div>

        {/* Status Messages */}
        <div className="mt-8 space-y-2">
          {progress < 30 && (
            <p className="text-white/60 animate-pulse">Analyzing your health profile...</p>
          )}
          {progress >= 30 && progress < 70 && (
            <p className="text-white/60 animate-pulse">Matching with specialists...</p>
          )}
          {progress >= 70 && progress < 100 && (
            <p className="text-white/60 animate-pulse">Preparing your recommendations...</p>
          )}
          {progress === 100 && (
            <p className="text-white font-medium">Complete! Redirecting...</p>
          )}
        </div>
      </div>
    </div>
  );
}