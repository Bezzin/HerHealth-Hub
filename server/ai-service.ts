import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface QuestionnaireData {
  age: string;
  primarySymptoms: string;
  symptomOnset: string;
  symptomSeverity: string;
  currentMedications: string;
  allergies: string;
  previousTreatments: string;
  additionalConcerns: string;
}

interface IntakeAssessmentData {
  reason?: string[];
  dob?: string;
  sex_at_birth?: string;
  identify_female?: string;
  sexual_orientation?: string[];
  ethnicity_group?: string;
  ethnicity_specific?: string;
  diagnoses?: string[];
  symptoms?: string[];
  symptom_timing?: string;
  stress_level?: string;
  period_start?: string;
  cycle_regular?: string;
  contraception?: string[];
  medications?: string[];
  ever_pregnant?: string;
  breastfeeding?: string;
  sti_history?: string[];
  height?: number;
  weight?: number;
  lifestyle_exercise?: string;
  appointment_goal?: string;
}

export async function generateSymptomSummary(questionnaireData: QuestionnaireData): Promise<string> {
  try {
    const prompt = `You are a clinical assistant summarizing patient symptoms for a gynecologist/women's health specialist. 

Patient Information:
- Age: ${questionnaireData.age}
- Primary Symptoms: ${questionnaireData.primarySymptoms}
- Symptom Onset: ${questionnaireData.symptomOnset}
- Severity: ${questionnaireData.symptomSeverity}
- Current Medications: ${questionnaireData.currentMedications}
- Allergies: ${questionnaireData.allergies}
- Previous Treatments: ${questionnaireData.previousTreatments}
- Additional Concerns: ${questionnaireData.additionalConcerns}

Create a concise clinical summary in exactly 3 bullet points for the doctor to review before the consultation. Focus on:
1. Primary symptoms and duration
2. Relevant medical history and current medications
3. Key concerns requiring attention

Format as JSON with a "summary" field containing an array of 3 strings.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a medical professional summarizing patient symptoms for healthcare providers. Provide accurate, concise clinical summaries."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
      temperature: 0.1, // Low temperature for consistent medical summaries
    });

    const result = JSON.parse(response.choices[0].message.content || '{"summary": []}');
    
    if (!result.summary || !Array.isArray(result.summary) || result.summary.length !== 3) {
      throw new Error("Invalid AI response format");
    }

    return result.summary.map((point: string, index: number) => `${index + 1}. ${point}`).join('\n');
  } catch (error: any) {
    console.error("Error generating symptom summary:", error);
    
    // Fallback summary if AI fails
    return `1. Patient reports ${questionnaireData.primarySymptoms} with ${questionnaireData.symptomSeverity} severity
2. Symptoms began ${questionnaireData.symptomOnset}, currently taking ${questionnaireData.currentMedications || 'no medications'}
3. Patient has concerns about ${questionnaireData.additionalConcerns || 'general women\'s health'} - requires clinical assessment`;
  }
}

export async function analyzeIntakeAssessment(intakeData: IntakeAssessmentData): Promise<{ summary: string; recommendation: string; priority: string }> {
  try {
    // Calculate age from DOB
    const age = intakeData.dob ? Math.floor((Date.now() - new Date(intakeData.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 'Unknown';
    
    // Process arrays to strings
    const reasons = Array.isArray(intakeData.reason) ? intakeData.reason.join(', ') : 'Not specified';
    const diagnoses = Array.isArray(intakeData.diagnoses) ? intakeData.diagnoses.filter(d => d !== 'None').join(', ') : 'None';
    const symptoms = Array.isArray(intakeData.symptoms) ? intakeData.symptoms.filter(s => s !== 'None').join(', ') : 'None';
    const medications = Array.isArray(intakeData.medications) ? intakeData.medications.filter(m => m !== 'None').join(', ') : 'None';
    const contraception = Array.isArray(intakeData.contraception) ? intakeData.contraception.filter(c => c !== 'None').join(', ') : 'None';

    const prompt = `You are analyzing a women's health intake assessment for a specialist consultation. Create a clinical summary for the doctor.

Patient Profile:
- Age: ${age} years
- Sex at birth: ${intakeData.sex_at_birth || 'Not specified'}
- Reason for visit: ${reasons}
- Primary goal: ${intakeData.appointment_goal || 'Not specified'}

Medical History:
- Diagnosed conditions: ${diagnoses || 'None'}
- Current symptoms: ${symptoms || 'None'}
- Symptom timing: ${intakeData.symptom_timing || 'Not applicable'}
- Stress level: ${intakeData.stress_level || 'Not specified'}

Reproductive Health:
- Last period: ${intakeData.period_start || 'Not specified'}
- Cycle regularity: ${intakeData.cycle_regular || 'Not specified'}
- Pregnancy history: ${intakeData.ever_pregnant || 'Not specified'}
- Currently breastfeeding: ${intakeData.breastfeeding || 'N/A'}
- Contraception: ${contraception || 'None'}

Current Management:
- Medications: ${medications || 'None'}
- STI history: ${Array.isArray(intakeData.sti_history) ? intakeData.sti_history.filter(s => s !== 'None / I don\'t know').join(', ') || 'None' : 'None'}

Lifestyle:
- Exercise: ${intakeData.lifestyle_exercise || 'Not specified'}
- BMI: ${intakeData.height && intakeData.weight ? ((intakeData.weight / Math.pow(intakeData.height / 100, 2)).toFixed(1)) : 'Not calculated'}

Create a response in JSON format with:
1. "summary": Array of 3-4 bullet points highlighting key clinical information
2. "recommendation": Specific recommendations for the consultation focus
3. "priority": "high", "medium", or "low" based on symptom severity and urgency`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a women's health specialist analyzing patient intake assessments. Provide clinically relevant summaries that help doctors prepare for consultations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Format the summary
    const formattedSummary = result.summary && Array.isArray(result.summary) 
      ? result.summary.map((point: string, index: number) => `${index + 1}. ${point}`).join('\n')
      : 'Unable to generate summary';

    return {
      summary: formattedSummary,
      recommendation: result.recommendation || 'Standard consultation recommended',
      priority: result.priority || 'medium'
    };
  } catch (error: any) {
    console.error("Error analyzing intake assessment:", error);
    
    // Fallback analysis
    const hasSymptoms = intakeData.symptoms && intakeData.symptoms.length > 0 && !intakeData.symptoms.includes('None');
    const hasDiagnoses = intakeData.diagnoses && intakeData.diagnoses.length > 0 && !intakeData.diagnoses.includes('None');
    
    return {
      summary: `1. Patient seeking consultation for: ${Array.isArray(intakeData.reason) ? intakeData.reason.join(', ') : 'general women\'s health'}
2. ${hasDiagnoses ? `Known conditions: ${intakeData.diagnoses?.join(', ')}` : 'No diagnosed conditions'}
3. ${hasSymptoms ? `Current symptoms: ${intakeData.symptoms?.join(', ')}` : 'No acute symptoms reported'}
4. Goal: ${intakeData.appointment_goal || 'General consultation'}`,
      recommendation: 'Review patient history and conduct comprehensive assessment',
      priority: hasSymptoms ? 'medium' : 'low'
    };
  }
}