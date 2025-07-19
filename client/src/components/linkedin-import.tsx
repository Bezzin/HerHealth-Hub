import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Linkedin, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LinkedInImportProps {
  onImportComplete: (data: {
    firstName: string;
    lastName: string;
    qualifications: string;
    experience: string;
    bio: string;
  }) => void;
}

export default function LinkedInImport({ onImportComplete }: LinkedInImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLinkedInImport = async () => {
    setIsImporting(true);
    setImportError(null);

    try {
      // For development, use mock endpoint
      const response = await apiRequest("POST", "/api/auth/linkedin/mock");
      const linkedInData = await response.json();

      onImportComplete(linkedInData);
      
      toast({
        title: "LinkedIn Import Successful",
        description: "Your professional information has been imported",
      });

      setIsOpen(false);
    } catch (error) {
      setImportError("Failed to import from LinkedIn. Please try again or enter details manually.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setIsOpen(true)}
      >
        <Linkedin className="w-4 h-4 mr-2" />
        Import from LinkedIn
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import from LinkedIn</DialogTitle>
            <DialogDescription>
              Quickly import your professional information from LinkedIn
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!isImporting && !importError && (
              <>
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Linkedin className="w-10 h-10 text-blue-600" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold">What we'll import:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Your name and professional title</li>
                      <li>✓ Education and qualifications</li>
                      <li>✓ Work experience and specialties</li>
                      <li>✓ Professional summary</li>
                    </ul>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      This will open LinkedIn login in a new window. Make sure pop-ups are enabled.
                    </AlertDescription>
                  </Alert>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleLinkedInImport}
                >
                  Continue with LinkedIn
                </Button>
              </>
            )}

            {isImporting && (
              <div className="text-center py-8">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                <p className="text-gray-600">Importing your professional information...</p>
              </div>
            )}

            {importError && (
              <div className="space-y-4">
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {importError}
                  </AlertDescription>
                </Alert>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Enter Details Manually
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}