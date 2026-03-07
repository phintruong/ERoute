import { Router, Request, Response } from 'express';
import { fetchWaitTime } from '../services/waitTimeService';

export const waitTimesRouter = Router();

waitTimesRouter.get('/:city', async (req: Request, res: Response) => {
  try {
    const { city } = req.params;
    const waitTime = await fetchWaitTime(city);
    res.json({ city, waitTime });
  } catch (err) {
    console.error('Wait time error:', err);
    res.status(500).json({ error: 'Failed to fetch wait time' });
  }
});
