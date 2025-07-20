import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface QuestionnaireAnswers {
  age: string;
  primarySymptoms: string;
  symptomOnset: string;
  symptomSeverity: string;
  currentMedications: string;
  allergies: string;
  previousTreatments: string;
  additionalConcerns: string;
}

const questions = [
  {
    id: "age",
    title: "What is your age?",
    type: "select",
    options: ["18-25", "26-35", "36-45", "46-55", "56+"],
    required: true
  },
  {
    id: "primarySymptoms",
    title: "What are your main symptoms or concerns?",
    type: "textarea",
    placeholder: "Please describe your primary symptoms in detail...",
    required: true
  },
  {
    id: "symptomOnset",
    title: "When did your symptoms start?",
    type: "select",
    options: ["Within the last week", "1-4 weeks ago", "1-3 months ago", "3-6 months ago", "More than 6 months ago"],
    required: true
  },
  {
    id: "symptomSeverity",
    title: "How would you rate the severity of your symptoms?",
    type: "radio",
    options: ["Mild - doesn't interfere with daily activities", "Moderate - sometimes affects daily activities", "Severe - significantly impacts daily life"],
    required: true
  },
  {
    id: "currentMedications",
    title: "Are you currently taking any medications?",
    type: "textarea",
    placeholder: "List all medications, supplements, and birth control. If none, write 'None'.",
    required: true
  },
  {
    id: "allergies",
    title: "Do you have any known allergies?",
    type: "textarea",
    placeholder: "List any drug allergies, food allergies, or other known allergies. If none, write 'None'.",
    required: true
  },
  {
    id: "previousTreatments",
    title: "Have you tried any treatments for these symptoms?",
    type: "textarea",
    placeholder: "Describe any previous treatments, medications, or therapies you've tried. If none, write 'None'.",
    required: true
  },
  {
    id: "additionalConcerns",
    title: "Is there anything else you'd like your doctor to know?",
    type: "textarea",
    placeholder: "Any additional concerns, questions, or information that might be relevant...",
    required: false
  }
];

export default function Questionnaire() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const slotId = params.slotId;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    age: "",
    primarySymptoms: "",
    symptomOnset: "",
    symptomSeverity: "",
    currentMedications: "",
    allergies: "",
    previousTreatments: "",
    additionalConcerns: ""
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async (formData: { bookingId: number; answers: QuestionnaireAnswers }) => {
      const response = await apiRequest("POST", "/api/questionnaire", formData);
      return response.json();
    },
    onSuccess: (data) => {
      setIsSubmitted(true);
      toast({
        title: "Questionnaire Submitted",
        description: "Your symptom information has been shared with your doctor.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAnswerChange = (questionId: keyof QuestionnaireAnswers, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const isCurrentQuestionValid = () => {
    const question = questions[currentQuestion];
    const answer = answers[question.id as keyof QuestionnaireAnswers];
    return !question.required || (answer && answer.trim() !== "");
  };

  const goToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // For demo purposes, using a mock booking ID
    // In real app, this would come from the booking process
    const mockBookingId = 1;
    
    submitMutation.mutate({
      bookingId: mockBookingId,
      answers
    });
  };

  const progressPercentage = (currentQuestion / questions.length) * 100;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h1 className="text-2xl font-bold text-gray-900">Questionnaire Complete</h1>
              <p className="text-gray-600">
                Thank you for providing your symptom information. Your doctor will review this before your consultation.
              </p>
              <Button 
                onClick={() => setLocation("/my-bookings")}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                View My Bookings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQ.id as keyof QuestionnaireAnswers];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Pre-Consultation Questionnaire</h1>
            <span className="text-sm text-gray-500">
              {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-teal-600" />
              {currentQ.title}
            </CardTitle>
            <CardDescription>
              This information will help your doctor provide better care during your consultation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQ.type === "select" && (
              <div className="space-y-2">
                <Label htmlFor={currentQ.id}>Select an option</Label>
                <Select value={currentAnswer} onValueChange={(value) => handleAnswerChange(currentQ.id as keyof QuestionnaireAnswers, value)}>
                  <SelectTrigger id={currentQ.id}>
                    <SelectValue placeholder="Choose an option..." />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQ.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {currentQ.type === "radio" && (
              <div className="space-y-3">
                <Label>Select one option</Label>
                <RadioGroup 
                  value={currentAnswer} 
                  onValueChange={(value) => handleAnswerChange(currentQ.id as keyof QuestionnaireAnswers, value)}
                >
                  {currentQ.options?.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="text-sm font-normal cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {currentQ.type === "textarea" && (
              <div className="space-y-2">
                <Label htmlFor={currentQ.id}>Your response</Label>
                <Textarea
                  id={currentQ.id}
                  placeholder={currentQ.placeholder}
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(currentQ.id as keyof QuestionnaireAnswers, e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={goToPrevious}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentQuestion < questions.length - 1 ? (
                <Button
                  onClick={goToNext}
                  disabled={!isCurrentQuestionValid()}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isCurrentQuestionValid() || submitMutation.isPending}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Questionnaire"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            All information is confidential and will only be shared with your assigned doctor.
          </p>
        </div>
      </div>
    </div>
  );
}