import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Heart, 
  Brain, 
  Pill, 
  Calendar,
  FileText,
  AlertCircle,
  Clock,
  User
} from "lucide-react";

interface IntakeData {
  answers: Record<string, any>;
  analysis?: string;
  recommendedSpecialty?: string;
  completedAt?: string;
}

interface IntakeSummaryProps {
  intakeData: IntakeData | null;
  patientName?: string;
}

export default function IntakeSummary({ intakeData, patientName }: IntakeSummaryProps) {
  if (!intakeData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No intake assessment data available</p>
      </div>
    );
  }

  const { answers, analysis, recommendedSpecialty, completedAt } = intakeData;

  // Extract key information from answers
  const symptoms = answers.symptoms || [];
  const diagnoses = answers.diagnoses || [];
  const medications = answers.medications || [];
  const allergies = answers.allergies || [];
  const surgeries = answers.surgeries || [];
  const familyHistory = answers.familyHistory || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Intake Assessment Summary</CardTitle>
            <CardDescription>
              {patientName && <span className="font-medium">{patientName} • </span>}
              {completedAt && (
                <span>Completed {new Date(completedAt).toLocaleDateString()}</span>
              )}
            </CardDescription>
          </div>
          {recommendedSpecialty && (
            <Badge variant="secondary" className="ml-4">
              {recommendedSpecialty}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* AI Analysis Summary */}
        {analysis && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">AI Clinical Summary</h4>
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              {analysis.split('\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          </div>
        )}

        <Tabs defaultValue="symptoms" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="symptoms" className="text-xs">Symptoms</TabsTrigger>
            <TabsTrigger value="medical" className="text-xs">Medical History</TabsTrigger>
            <TabsTrigger value="medications" className="text-xs">Medications</TabsTrigger>
            <TabsTrigger value="lifestyle" className="text-xs">Lifestyle</TabsTrigger>
          </TabsList>

          <TabsContent value="symptoms" className="mt-4 space-y-4">
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-gray-600" />
                Current Symptoms
              </h4>
              {symptoms.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((symptom: string, idx: number) => (
                    <Badge key={idx} variant="outline">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No symptoms reported</p>
              )}
            </div>

            {answers.symptomDuration && (
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  Duration
                </h4>
                <p className="text-sm">{answers.symptomDuration}</p>
              </div>
            )}

            {answers.symptomTriggers && (
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-gray-600" />
                  Triggers
                </h4>
                <p className="text-sm">{answers.symptomTriggers}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="medical" className="mt-4 space-y-4">
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-gray-600" />
                Existing Diagnoses
              </h4>
              {diagnoses.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {diagnoses.map((diagnosis: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {diagnosis}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No existing diagnoses</p>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2">Surgical History</h4>
              {surgeries.length > 0 ? (
                <ul className="text-sm space-y-1">
                  {surgeries.map((surgery: string, idx: number) => (
                    <li key={idx}>• {surgery}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No surgical history</p>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2">Family History</h4>
              {familyHistory.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {familyHistory.map((condition: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {condition}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No relevant family history</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="medications" className="mt-4 space-y-4">
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Pill className="w-4 h-4 text-gray-600" />
                Current Medications
              </h4>
              {medications.length > 0 ? (
                <div className="space-y-2">
                  {medications.map((med: string, idx: number) => (
                    <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <p className="text-sm font-medium">{med}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No current medications</p>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2">Allergies</h4>
              {allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {allergies.map((allergy: string, idx: number) => (
                    <Badge key={idx} variant="destructive" className="text-xs">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No known allergies</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="lifestyle" className="mt-4 space-y-4">
            {answers.smokingStatus && (
              <div>
                <h4 className="font-medium mb-1">Smoking Status</h4>
                <p className="text-sm">{answers.smokingStatus}</p>
              </div>
            )}

            {answers.alcoholConsumption && (
              <div>
                <h4 className="font-medium mb-1">Alcohol Consumption</h4>
                <p className="text-sm">{answers.alcoholConsumption}</p>
              </div>
            )}

            {answers.exerciseFrequency && (
              <div>
                <h4 className="font-medium mb-1">Exercise Frequency</h4>
                <p className="text-sm">{answers.exerciseFrequency}</p>
              </div>
            )}

            {answers.stressLevel && (
              <div>
                <h4 className="font-medium mb-1">Stress Level</h4>
                <p className="text-sm">{answers.stressLevel}</p>
              </div>
            )}

            {answers.sleepQuality && (
              <div>
                <h4 className="font-medium mb-1">Sleep Quality</h4>
                <p className="text-sm">{answers.sleepQuality}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}