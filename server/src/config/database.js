import sql from 'mssql';
import sqlNative from 'msnodesqlv8';
import { env } from './env.js';

export const db = sql;

const sqlConfig = env.dbTrustedConnection
  ? {
      connectionString: [
        'Driver={ODBC Driver 18 for SQL Server}',
        `Server=${env.dbServer}`,
        `Database=${env.dbName}`,
        'Trusted_Connection=Yes',
        `TrustServerCertificate=${env.dbTrustServerCertificate ? 'Yes' : 'No'}`,
        `Encrypt=${env.dbEncrypt ? 'Yes' : 'No'}`,
      ].join(';'),
    }
  : {
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
let nativeConnectionPromise;

export async function getConnection() {
  if (env.dbTrustedConnection) {
    if (!nativeConnectionPromise) {
      nativeConnectionPromise = sqlNative.promises.open(sqlConfig.connectionString);
    }

    return nativeConnectionPromise;
  }

  if (!poolPromise) {
    poolPromise = db.connect(sqlConfig);
  }

  return poolPromise;
}

export async function runQuery(queryText, parameters = []) {
  if (env.dbTrustedConnection) {
    const connection = await getConnection();
    const values = parameters.map((parameter) => parameter.value);
    const result = await connection.promises.query(queryText, values);

    return result.first || [];
  }

  const pool = await getConnection();
  let request = pool.request();

  for (const parameter of parameters) {
    request = request.input(parameter.name, parameter.type, parameter.value);
  }

  const result = await request.query(queryText);
  return result.recordset;
}

export async function checkDatabaseConnection() {
  if (!env.dbTrustedConnection && (!env.dbUser || !env.dbPassword)) {
    return {
      connected: false,
      message: 'Credenciales pendientes',
    };
  }

  try {
    if (env.dbTrustedConnection) {
      const connection = await getConnection();
      await connection.promises.query('SELECT 1 AS ok');
    } else {
      const pool = await getConnection();
      await pool.request().query('SELECT 1 AS ok');
    }

    return {
      connected: true,
      message: 'Conectada',
    };
  } catch (error) {
    return {
      connected: false,
      message: 'Sin conexion',
      error: error.message || String(error),
    };
  }
}
