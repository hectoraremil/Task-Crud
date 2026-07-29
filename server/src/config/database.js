import sql from 'mssql';
import { env } from './env.js';

const sqlConfig = {
  user: env.dbUser,
  password: env.dbPassword,
  server: env.dbServer,
  database: env.dbName,
  port: env.dbPort,
  options: {
    encrypt: env.dbEncrypt,
    trustServerCertificate: env.dbTrustServerCertificate,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise;

export async function getConnection() {
  if (!poolPromise) {
    poolPromise = sql.connect(sqlConfig);
  }

  return poolPromise;
}

export async function checkDatabaseConnection() {
  if (!env.dbUser || !env.dbPassword) {
    return {
      connected: false,
      message: 'Credenciales pendientes',
    };
  }

  try {
    const pool = await getConnection();
    await pool.request().query('SELECT 1 AS ok');

    return {
      connected: true,
      message: 'Conectada',
    };
  } catch (error) {
    return {
      connected: false,
      message: 'Sin conexion',
      error: error.message,
    };
  }
}
