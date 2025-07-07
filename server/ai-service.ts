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