import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config: sql.config = {
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  server: process.env.DB_HOST!,
  database: process.env.DB_NAME!,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 1,
    idleTimeoutMillis: 60000,
  },
};

let poolPromise: Promise<sql.ConnectionPool>;

export const getDbPool = async (): Promise<sql.ConnectionPool> => {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config).connect();
  }
  return poolPromise;
};

export const closeDbPool = async (): Promise<void> => {
  if (poolPromise) {
    const pool = await poolPromise;
    await pool.close();
  }
};
