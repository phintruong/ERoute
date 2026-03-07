import { Router, Request, Response } from 'express';
import { validateVitals } from '../services/presageService';

export const vitalsRouter = Router();

vitalsRouter.post('/validate', async (req: Request, res: Response) => {
  try {
    const validated = validateVitals(req.body);
    res.json(validated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
