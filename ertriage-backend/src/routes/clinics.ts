import { Router, Request, Response } from 'express';
import { findNearbyClinics } from '../services/mapboxService';

export const clinicsRouter = Router();

clinicsRouter.get('/:lat/:lng', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.params.lat);
    const lng = parseFloat(req.params.lng);
    const clinics = await findNearbyClinics(lat, lng);
    res.json({ clinics });
  } catch (err) {
    console.error('Clinic lookup error:', err);
    res.status(500).json({ error: 'Failed to find nearby clinics' });
  }
});
