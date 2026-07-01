import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { getDbPool, closeDbPool } from './db/connection';
import logger from './utils/logger';

const PORT = parseInt(process.env.PORT || '4000', 10);

async function start() {
  try {
    await getDbPool();
    logger.info('Database connection established.');
  } catch (err) {
    logger.warn({ err }, 'Database connection failed — server starting without DB. Check DB_HOST config.');
  }

  const server = app.listen(PORT, () => {
    logger.info(`IBO Suite API server running on port ${PORT}`);
  });

  const shutdown = async () => {
    logger.info('Shutting down server...');
    server.close(async () => {
      await closeDbPool();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start();
