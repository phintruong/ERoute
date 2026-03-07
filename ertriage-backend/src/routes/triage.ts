import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { triageLimiter } from '../middleware/rateLimit';
import { classifyTriage } from '../services/geminiService';
import { getBackboardContext } from '../services/backboardService';
import { createTriageSession } from '../db/queries';
import { TriageRequest } from '../../../shared/types';

export const triageRouter = Router();

triageRouter.post('/', requireAuth, triageLimiter, async (req: Request, res: Response) => {
  try {
    const { vitals, symptoms, city, memberId } = req.body as TriageRequest;

    // Get Backboard multi-agent context
    const agentContext = await getBackboardContext(vitals, symptoms, memberId);

    // Classify with Gemini
    const result = await classifyTriage(vitals, symptoms, agentContext);

    // TODO: fetch wait time and nearby clinics

    res.json({
      riskLevel: result.riskLevel,
      recommendation: result.recommendation,
      explanation: result.explanation,
      waitTimeEstimate: null,
      nearbyClinics: [],
    });
  } catch (err) {
    console.error('Triage error:', err);
    res.status(500).json({ error: 'Triage classification failed' });
  }
});
