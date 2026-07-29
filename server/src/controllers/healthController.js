import { checkDatabaseConnection } from '../config/database.js';

export async function getHealth(_request, response) {
  const databaseStatus = await checkDatabaseConnection();

  response.status(200).json({
    status: 'Activa',
    database: databaseStatus.message,
    timestamp: new Date().toISOString(),
  });
}
