// config/db.js
import sql from 'mssql';

const sqlConfig = {
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  options: {
    encrypt: process.env.SQL_ENCRYPT === 'true',
    trustServerCertificate: process.env.SQL_TRUST_SERVER_CERTIFICATE === 'true'
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
};

let pool;

/** Retorna un pool compartido (singleton) */
export async function getPool() {
  if (pool) return pool;
  pool = await sql.connect(sqlConfig);
  return pool;
}

export { sql };
