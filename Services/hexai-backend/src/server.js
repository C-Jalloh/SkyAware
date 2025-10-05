import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";

import currentAqiRoute from "./routes/currentAqiRoute.js";
import forecastRoute from "./routes/forecastRoute.js";
import tempoGridRoute from "./routes/tempoGridRoute.js";
import alertsRoute from "./routes/alertsRoute.js";
import healthRoute from "./routes/healthRoute.js";
import weatherRoute from "./routes/weatherRoute.js"; // Fixed typo
import connectDB from "./data/connect.js";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/user.js";

export async function createServer() {
  const app = express();
 await connectDB();


  // Improved CORS configuration
  app.use(cors({
    origin: ["http://127.0.0.1:3000"], // Add your frontend URLs
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 200
  }));
  


  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("tiny"));
  app.use(requestLogger);
  
  // Disable caching to prevent 304 responses
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
  });

  

  // Authentication routes
  app.use("/api/auth", authRoute);
  app.use("/api/user", userRoute);

  // Existing routes
  app.use("/api/current_aqi", currentAqiRoute);
  app.use("/api/forecast", forecastRoute);
  app.use("/api/tempo_grid", tempoGridRoute);
  app.use("/api/alerts", alertsRoute);
  app.use("/api/health", healthRoute);
  app.use("/api/weather/current", weatherRoute);

  app.use('/', (req, res) => {
    res.send('HexAI Backend - Authentication Enabled');
  });

  app.use(errorHandler);
  return app;
}