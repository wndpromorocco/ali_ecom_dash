import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
const logFile = fs.createWriteStream('/tmp/herbio.log', { flags: 'a' });
const logStdout = process.stdout;

console.log = function (...args) {
  logFile.write(`[LOG] ${new Date().toISOString()} ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}\n`);
  logStdout.write(args.join(' ') + '\n');
};
console.error = function (...args) {
  logFile.write(`[ERROR] ${new Date().toISOString()} ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}\n`);
  logStdout.write(args.join(' ') + '\n');
};

console.log('--- Server Logging Initialized to /tmp/herbio.log ---');

import App from './app';
import config from './config';
import PrismaService from './services/prisma';
import { verifyEmailConnection } from './services/email';

// Initialize the application
const app = new App();

// Start the server
const server = app.app.listen(config.port, async () => {
  console.log('🚀 Herbio Digital Marketplace API Server Started');
  console.log(`📍 Server running on port ${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`📊 API Version: ${config.apiVersion}`);

  // Verify email connection on startup
  await verifyEmailConnection();
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});

// Graceful shutdown
const shutdown = () => {
  console.log('Stopping server...');
  server.close(async () => {
    console.log('Server stopped.');
    try {
      await PrismaService.disconnect();
      console.log('Database disconnected.');
    } catch (err) {
      console.error('Error during database disconnect:', err);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown();
});