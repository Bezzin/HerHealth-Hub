import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface IntakeSummaryProps {
  bookingId: number;
}

export default function IntakeSummary({ bookingId }: IntakeSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: intakeData, isLoading } = useQuery({
    queryKey: ['/api/bookings', bookingId, 'intake'],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/bookings/${bookingId}/intake`);
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
            <span className="text-sm text-gray-600">Loading intake assessment...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!intakeData?.hasIntake) {
    return null;
  }

  const intake = intakeData.intakeData;
  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'bg-red-100 text-red-800';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="w-5 h-5 text-purple-600" />
          Pre-Assessment Summary
        </CardTitle>
        <CardDescription>
          AI-generated analysis from patient intake form
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Summary */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-purple-900">Clinical Summary</h4>
            <Badge className={getPriorityColor(intake.priority)}>
              {intake.priority.charAt(0).toUpperCase() + intake.priority.slice(1)} Priority
            </Badge>
          </div>
          <div className="text-sm text-purple-800 whitespace-pre-line">
            {intake.aiSummary}
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Consultation Focus
          </h4>
          <p className="text-sm text-blue-800">{intake.recommendation}</p>
        </div>

        {/* Collapsible Raw Data */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span>View Full Assessment Responses</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-4">
            <div className="text-sm space-y-2 bg-gray-50 p-3 rounded-md">
              {intake.answers && Object.entries(intake.answers).map(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0)) return null;
                
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
                
                return (
                  <div key={key} className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {label}
                    </span>
                    <span className="text-gray-700">{displayValue}</span>
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}