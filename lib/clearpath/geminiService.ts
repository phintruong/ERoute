import { GoogleGenerativeAI } from '@google/generative-ai';
import { VitalsPayload, SymptomsPayload, TriageResponse } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `
You are a Canadian emergency triage classifier. NOT a doctor.
Given vitals and symptoms, classify urgency as one of:
  critical   = immediate ER required
  urgent     = ER today, nearest with capacity
  non-urgent = route to least congested ER
Respond ONLY in valid JSON: { severity, reasoning }
reasoning must be plain language, max 2 sentences.
Always end with: 'This is guidance only — not a medical diagnosis.'
`;

export async function classifyTriage(
  vitals: VitalsPayload,
  symptoms: SymptomsPayload
): Promise<TriageResponse> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `${SYSTEM_PROMPT}
Vitals: HR=${vitals.heartRate} RR=${vitals.respiratoryRate} Stress=${vitals.stressIndex}
Symptoms: ${JSON.stringify(symptoms)}`;
  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, '').trim();
  return JSON.parse(text);
}
