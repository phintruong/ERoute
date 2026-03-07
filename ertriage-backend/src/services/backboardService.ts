import { VitalsPayload, SymptomsPayload } from '../../../shared/types';

const BACKBOARD_API_URL = 'https://api.backboard.io';
const BACKBOARD_API_KEY = process.env.BACKBOARD_API_KEY || '';

interface BackboardResponse {
  guidelinesCheck: string;
  riskScore: number;
  historyFlags: string[];
}

export async function getBackboardContext(
  vitals: VitalsPayload,
  symptoms: SymptomsPayload,
  memberId?: string
): Promise<string> {
  try {
    const response = await fetch(`${BACKBOARD_API_URL}/agents/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BACKBOARD_API_KEY}`,
      },
      body: JSON.stringify({
        agents: [
          { name: 'medical-guidelines', input: { vitals, symptoms } },
          { name: 'risk-scoring', input: { vitals, symptoms } },
          { name: 'patient-history', input: { memberId } },
        ],
      }),
    });

    if (!response.ok) {
      console.warn('Backboard returned non-200, proceeding without context');
      return '';
    }

    const data = (await response.json()) as BackboardResponse;
    return formatBackboardContext(data);
  } catch (err) {
    console.warn('Backboard unavailable, proceeding without multi-agent context');
    return '';
  }
}

function formatBackboardContext(data: BackboardResponse): string {
  const parts: string[] = [];

  if (data.guidelinesCheck) {
    parts.push(`CTAS Guidelines: ${data.guidelinesCheck}`);
  }
  if (data.riskScore !== undefined) {
    parts.push(`Weighted Risk Score: ${data.riskScore}/100`);
  }
  if (data.historyFlags?.length > 0) {
    parts.push(`History Flags: ${data.historyFlags.join(', ')}`);
  }

  return parts.join('\n');
}

export async function queryAgents(question: string, context: object) {
  const response = await fetch(`${BACKBOARD_API_URL}/agents/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${BACKBOARD_API_KEY}`,
    },
    body: JSON.stringify({ question, context }),
  });

  if (!response.ok) {
    throw new Error('Backboard agent query failed');
  }

  return response.json();
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKBOARD_API_URL}/health`, {
      headers: { Authorization: `Bearer ${BACKBOARD_API_KEY}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}
