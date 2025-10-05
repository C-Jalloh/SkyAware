import { Router } from 'express';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    res.json({
      city: "New York, NY",
      alerts: [
        {
          severity: "moderate",
          aqi_expected: 132,
          forecast_date: "2025-10-04",
          advice: "Sensitive groups reduce prolonged or heavy exertion outdoors."
        }
      ],
      generated_at: new Date().toISOString()
    });
  } catch (e) { next(e); }
});

export default router;