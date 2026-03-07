export interface VitalsPayload {
  heartRate: number;
  respiratoryRate: number;
  stressIndex: number;
  emotionState: string;
}

export interface SymptomsPayload {
  chestPain: boolean;
  shortnessOfBreath: boolean;
  fever: boolean;
  feverDays?: number;
  dizziness: boolean;
  severeHeadache: boolean;
  injuryOrBleeding: boolean;
}

export interface TriageRequest {
  vitals: VitalsPayload;
  symptoms: SymptomsPayload;
  city: string;
  memberId?: string;
}

export interface ClinicResult {
  name: string;
  address: string;
  distance: string;
  hours: string;
  phone?: string;
  type: 'urgent_care' | 'er' | 'virtual' | 'pharmacy';
}

export interface TriageResponse {
  riskLevel: 'green' | 'yellow' | 'red';
  recommendation: string;
  explanation: string;
  waitTimeEstimate?: string;
  nearbyClinics: ClinicResult[];
}

export interface FamilyMember {
  id: string;
  name: string;
  dob?: string;
  relation: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  language: string;
}

export interface TriageSession {
  id: string;
  userId: string;
  memberId?: string;
  vitals: VitalsPayload;
  symptoms: SymptomsPayload;
  riskLevel: 'green' | 'yellow' | 'red';
  recommendation: string;
  explanation: string;
  city: string;
  waitTimeEstimate?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  clinicName: string;
  clinicAddress: string;
  bookedAt: string;
  status: 'pending' | 'confirmed' | 'completed';
}
