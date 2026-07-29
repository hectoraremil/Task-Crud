import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 4001,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  dbUser: process.env.DB_USER || '',
  dbPassword: process.env.DB_PASSWORD || '',
  dbServer: process.env.DB_SERVER || 'localhost',
  dbName: process.env.DB_NAME || 'task_crud_db',
  dbPort: Number(process.env.DB_PORT) || 1433,
  dbTrustedConnection: process.env.DB_TRUSTED_CONNECTION === 'true',
  dbEncrypt: process.env.DB_ENCRYPT === 'true',
  dbTrustServerCertificate:
    process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' || process.env.DB_TRUST_SERVER_CERTIFICATE === undefined,
};
