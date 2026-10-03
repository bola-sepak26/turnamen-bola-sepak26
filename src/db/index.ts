import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import * as schema from './schema.ts';

dotenv.config();

declare global {
  var _postgresPool: Pool | undefined;
}

/**
 * Koneksi database.
 * Prioritas: DATABASE_URL (disarankan: connection string "Transaction pooler" dari Supabase,
 * port 6543). Jika tidak ada, jatuh ke variabel SQL_HOST/SQL_USER/SQL_PASSWORD/SQL_DB_NAME.
 */
export const createPool = () => {
  if (!global._postgresPool) {
    const url = process.env.DATABASE_URL;
    if (!url && !process.env.SQL_HOST) {
      console.warn(
        '[db] DATABASE_URL belum diatur. Isi di file .env (lihat .env.example). ' +
          'Aplikasi akan berjalan tetapi semua endpoint data akan gagal.'
      );
    }

    global._postgresPool = new Pool(
      url
        ? {
            connectionString: url,
            ssl: { rejectUnauthorized: false }, // Supabase mewajibkan SSL
            max: 5, // pooler Supabase sudah mengatur koneksi; 5 cukup & hemat
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
          }
        : {
            host: process.env.SQL_HOST,
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            database: process.env.SQL_DB_NAME,
            max: 5,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
          }
    );

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });
