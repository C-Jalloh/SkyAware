import { createServer } from './server.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

console.log('🚀 Starting HexAI Backend...');
console.log('📋 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', PORT);
console.log('🌐 Host:', HOST);

async function start() {
  const app = await createServer(); // Await the async function!
  const server = app.listen(PORT, HOST, () => {
    console.log('✅ HexAI Backend started successfully!');
    console.log(`🌍 Server running on http://${HOST}:${PORT}`);
    console.log(`❤️  Health check: http://${HOST}:${PORT}/api/health`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('📥 Received SIGTERM, shutting down gracefully...');
    server.close(() => {
      console.log('👋 Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('📥 Received SIGINT, shutting down gracefully...');
    server.close(() => {
      console.log('👋 Server closed');
      process.exit(0);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

start();