import { Router } from 'express';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    res.json({
      data_type: "geojson",
      data_url: "https://storage.googleapis.com/skyaware-tempo-data/tempo/tempo_no2_20251003T0900.geojson",
      min_val: 0,
      max_val: 180,
      pollutant: "NO2",
      updated_at: "2025-10-03T09:10:00Z"
    });
  } catch (e) { next(e); }
});

export default router;