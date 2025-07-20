import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  q: string;
  type: 'text' | 'textarea' | 'single' | 'multi' | 'number' | 'date' | 'dateOrText';
  required?: boolean;
  options?: string[];
  step?: number;
  skipIfNoSymptoms?: boolean;
  conditionalOn?: { id: string; value: string[] };
  placeholder?: string;
  allowFreeText?: string[];
}

interface IntakeData {
  [key: string]: string | string[] | number;
}

export default function IntakeWizard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<IntakeData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;

  useEffect(() => {
    // Load intake questions using inline data
    try {
      const data = [
        {"id":"reason","q":"So, what brings you here? (select all that apply)","type":"multi","options":["Just curious","Planning for babies in the future","Experiencing symptoms","Actively trying to conceive","Thinking about egg freezing or IVF","Perimenopause concerns","Menopause advice"],"required":true},
        {"id":"dob","q":"What's your date of birth?","type":"date","required":true},
        {"id":"sex_at_birth","q":"Sex assigned at birth","type":"single","options":["Female","Male","Other"],"required":true},
        {"id":"identify_female","q":"Do you currently identify as female?","type":"single","options":["Yes","No","Prefer not to say"]},
        {"id":"sexual_orientation","q":"Sexual orientation (select all that apply)","type":"multi","options":["Prefer not to say","Heterosexual","Lesbian","Bisexual","Asexual","Demisexual","Pansexual","Fluid","Other"]},
        {"id":"ethnicity_group","q":"Which ethnicity group best describes you?","type":"single","options":["Asian / Asian British","Black / Black British","Indigenous / First Nations","Middle Eastern","Mixed or Other","White"]},
        {"id":"ethnicity_specific","q":"Specific ethnicity (optional)","type":"text"},
        {"id":"diagnoses","q":"Have you been diagnosed with any of the following reproductive-health conditions?","type":"multi","options":["None","Adenomyosis","Asherman's syndrome","Endometriosis","Fibroids","PCOS","Premature ovarian insufficiency (POI)","Perimenopause / Menopause","Other"]},
        {"id":"symptoms","q":"Which symptoms are you experiencing? (select all)","type":"multi","options":["None","Acne","Pelvic pain","Painful periods","Hot flushes","Hair loss","Low mood / anxiety","Night sweats","Vaginal dryness","Other"]},
        {"id":"symptom_timing","q":"When do you experience these symptoms?","type":"single","options":["Before period","During period","After period","No pattern"],"skipIfNoSymptoms":true},
        {"id":"stress_level","q":"How have you been feeling recently?","type":"single","options":["Calm / relaxed","Neutral","Somewhat stressed","Completely stressed / overwhelmed"]},
        {"id":"period_start","q":"When did your most recent period start?","type":"dateOrText","placeholder":"DD/MM/YYYY or select 'I don't remember'","allowFreeText":["I don't remember","I have never had a period"]},
        {"id":"cycle_regular","q":"How regular is your cycle?","type":"single","options":["Regular","Irregular","Not currently getting periods","I've never had a period"]},
        {"id":"contraception","q":"Current contraception (select all that apply)","type":"multi","options":["None","Combined pill","Progesterone-only pill","IUD / Coil","Implant","Condoms","Natural methods","Other"]},
        {"id":"medications","q":"What (other) medication(s) are you currently taking?","type":"multi","options":["None","HRT","Thyroid medication","SSRIs","Pain relief","Other"]},
        {"id":"ever_pregnant","q":"Have you ever been pregnant?","type":"single","options":["Yes – I have children","Yes – but no children","No"]},
        {"id":"breastfeeding","q":"Are you currently breastfeeding?","type":"single","options":["Yes","No"],"conditionalOn":{"id":"ever_pregnant","value":["Yes – I have children","Yes – but no children"]}},
        {"id":"sti_history","q":"Have you ever been treated for an STI?","type":"multi","options":["None / I don't know","Chlamydia","Genital herpes","HPV","Gonorrhoea","Syphilis","Other"]},
        {"id":"height","q":"Height (cm)","type":"number"},
        {"id":"weight","q":"Weight (kg)","type":"number"},
        {"id":"lifestyle_exercise","q":"How often do you exercise?","type":"single","options":["Never","1–2× / week","3–6× / week","Every day","More than once a day"]},
        {"id":"appointment_goal","q":"What's the #1 thing you hope to get out of this appointment?","type":"single","options":["More information about my hormones","A diagnosis","Answers about fertility","Help with symptoms"]}
      ];
      
      const questionsWithSteps = data.map((q: Question, index: number) => ({
        ...q,
        step: Math.floor(index / 6) + 1 > 4 ? 4 : Math.floor(index / 6) + 1
      }));
      setQuestions(questionsWithSteps);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load intake questions:', error);
      toast({
        title: "Error loading questions",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    }
  }, [toast]);

  const getCurrentStepQuestions = () => {
    return questions.filter(q => q.step === currentStep);
  };

  const isStepValid = () => {
    const stepQuestions = getCurrentStepQuestions();
    return stepQuestions.every(question => {
      // Skip conditional questions if condition not met
      if (question.conditionalOn) {
        const conditionValue = answers[question.conditionalOn.id];
        if (!question.conditionalOn.value.includes(conditionValue as string)) {
          return true;
        }
      }
      
      if (!question.required) return true;
      const answer = answers[question.id];
      if (question.type === 'multi') {
        return Array.isArray(answer) && answer.length > 0;
      }
      return answer !== undefined && answer !== '' && answer !== null;
    });
  };

  const handleAnswerChange = (questionId: string, value: string | string[] | number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isStepValid()) {
      toast({
        title: "Please complete all required fields",
        description: "Fill in all required information before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Store answers in sessionStorage for the loading page
      sessionStorage.setItem('intakeAnswers', JSON.stringify(answers));
      
      toast({
        title: "Assessment completed!",
        description: "Redirecting to results...",
      });
      
      setLocation('/loading');
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const value = answers[question.id];

    // Skip rendering if conditional question and condition not met
    if (question.conditionalOn) {
      const conditionValue = answers[question.conditionalOn.id];
      if (!question.conditionalOn.value.includes(conditionValue as string)) {
        return null;
      }
    }

    switch (question.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={value as string || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder || "Enter your answer..."}
            className="mt-2"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value as string || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder || "Enter number..."}
            className="mt-2"
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value as string || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="mt-2"
          />
        );

      case 'dateOrText':
        return (
          <div className="mt-2 space-y-2">
            <Input
              type="date"
              value={value as string || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={question.placeholder}
            />
            {question.allowFreeText && (
              <Select
                value={value as string || ''}
                onValueChange={(val) => handleAnswerChange(question.id, val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Or select..." />
                </SelectTrigger>
                <SelectContent>
                  {question.allowFreeText.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        );

      case 'single':
        return (
          <RadioGroup
            value={value as string || ''}
            onValueChange={(val) => handleAnswerChange(question.id, val)}
            className="mt-2"
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multi':
        const multiValues = (value as string[]) || [];
        return (
          <div className="mt-2 space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={multiValues.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleAnswerChange(question.id, [...multiValues, option]);
                    } else {
                      handleAnswerChange(question.id, multiValues.filter(v => v !== option));
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  const stepQuestions = getCurrentStepQuestions();
  const progress = ((currentStep - 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Assessment</h1>
          <p className="text-gray-600">Help us understand your health needs (4 minutes)</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Questions Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Step {currentStep}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {stepQuestions.map((question) => {
              // Skip rendering if conditional question and condition not met
              if (question.conditionalOn) {
                const conditionValue = answers[question.conditionalOn.id];
                if (!question.conditionalOn.value.includes(conditionValue as string)) {
                  return null;
                }
              }
              
              return (
                <div key={question.id}>
                  <Label className="text-base font-medium">
                    {question.q}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderQuestion(question)}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="min-h-[48px]"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="min-h-[48px]"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid() || isSubmitting}
              className="min-h-[48px]"
            >
              {isSubmitting ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
            </Button>
          )}
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i + 1 <= currentStep ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}