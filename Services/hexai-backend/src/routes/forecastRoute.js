import { Router } from 'express';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const today = new Date();
    const d = (n) => {
      const dt = new Date(today.getTime() + n * 86400000);
      return dt.toISOString().slice(0, 10);
    };
    res.json({
      forecast_days: [
        { date: d(0), aqi_max: 75, health_advice_text: "Moderate: Unusually sensitive individuals should consider reducing prolonged outdoor exertion." },
        { date: d(1), aqi_max: 88, health_advice_text: "Unhealthy for Sensitive Groups: Sensitive groups reduce prolonged or heavy exertion." },
        { date: d(2), aqi_max: 105, health_advice_text: "Unhealthy for Sensitive Groups: Sensitive groups reduce prolonged or heavy exertion." }
      ],
      model_version: "v0.1-placeholder",
      generated_at: new Date().toISOString()
    });
  } catch (e) { next(e); }
});

export default router;