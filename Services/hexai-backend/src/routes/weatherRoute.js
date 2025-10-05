import { Router } from "express";
import { getWeatherData } from "../services/weatherService.js";

const router = Router();

/**
 * GET /api/weather/current?lat=xx&lon=yy
 */
router.get("/", async (req, res, next) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({
      success: false,
      message: "Latitude and longitude are required.",
    });
  }

  try {
    const result = await getWeatherData(Number(lat), Number(lon));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
