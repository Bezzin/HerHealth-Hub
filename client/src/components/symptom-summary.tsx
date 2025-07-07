import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SymptomSummaryProps {
  bookingId: number;
}

interface SymptomData {
  age: string;
  primarySymptoms: string;
  symptomOnset: string;
  symptomSeverity: string;
  currentMedications: string;
  allergies: string;
  previousTreatments: string;
  additionalConcerns: string;
}

export default function SymptomSummary({ bookingId }: SymptomSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: symptoms, isLoading } = useQuery({
    queryKey: ['/api/bookings', bookingId, 'symptoms'],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/bookings/${bookingId}/symptoms`);
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="border-teal-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full"></div>
            <span className="text-sm text-gray-600">Loading symptom summary...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!symptoms?.hasSymptoms) {
    return (
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-gray-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">No symptom questionnaire completed</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSeverityColor = (severity: string) => {
    if (severity.includes('Mild')) return 'bg-green-100 text-green-800';
    if (severity.includes('Moderate')) return 'bg-yellow-100 text-yellow-800';
    if (severity.includes('Severe')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="border-teal-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-teal-600" />
          Pre-Consultation Summary
        </CardTitle>
        <CardDescription>
          AI-generated clinical summary from patient questionnaire
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Summary */}
        <div className="bg-teal-50 p-4 rounded-lg">
          <h4 className="font-semibold text-teal-900 mb-2">Clinical Summary</h4>
          <div className="text-sm text-teal-800 whitespace-pre-line">
            {symptoms.symptomSummary}
          </div>
        </div>

        {/* Quick Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Age</span>
            <p className="text-sm font-medium">{symptoms.symptomData.age}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Severity</span>
            <Badge className={getSeverityColor(symptoms.symptomData.symptomSeverity)}>
              {symptoms.symptomData.symptomSeverity.split(' - ')[0]}
            </Badge>
          </div>
        </div>

        {/* Detailed Information - Collapsible */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="text-sm font-medium">View Detailed Responses</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Primary Symptoms</span>
                <p className="text-sm mt-1">{symptoms.symptomData.primarySymptoms}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Onset</span>
                  <p className="text-sm mt-1">{symptoms.symptomData.symptomOnset}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Medications</span>
                  <p className="text-sm mt-1">{symptoms.symptomData.currentMedications}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Allergies</span>
                  <p className="text-sm mt-1">{symptoms.symptomData.allergies}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Previous Treatments</span>
                  <p className="text-sm mt-1">{symptoms.symptomData.previousTreatments}</p>
                </div>
              </div>

              {symptoms.symptomData.additionalConcerns && (
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Additional Concerns</span>
                  <p className="text-sm mt-1">{symptoms.symptomData.additionalConcerns}</p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}