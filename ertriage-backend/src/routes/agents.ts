import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { queryAgents } from '../services/backboardService';

export const agentsRouter = Router();

agentsRouter.post('/query', requireAuth, async (req: Request, res: Response) => {
  try {
    const { question, context } = req.body;
    const response = await queryAgents(question, context);
    res.json(response);
  } catch (err) {
    console.error('Agent query error:', err);
    res.status(500).json({ error: 'Agent query failed' });
  }
});
