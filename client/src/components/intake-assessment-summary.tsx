import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import IntakeSummary from "./intake-summary";

interface IntakeAssessmentSummaryProps {
  bookingId: number;
}

export default function IntakeAssessmentSummary({ bookingId }: IntakeAssessmentSummaryProps) {
  const { data: intakeData, isLoading } = useQuery({
    queryKey: ['/api/bookings', bookingId, 'intake'],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/bookings/${bookingId}/intake`);
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  // Format the data to match what IntakeSummary expects
  const formattedData = intakeData?.intakeData ? {
    answers: intakeData.intakeData.answers || {},
    analysis: intakeData.intakeData.aiSummary || null,
    recommendedSpecialty: intakeData.intakeData.specialty || null,
    completedAt: intakeData.intakeData.timestamp || null
  } : null;

  return <IntakeSummary intakeData={formattedData} />;
}