import { Pool as PgPool } from 'pg';
import DbConfig from './DbConfig';

/** A global, singleton, shared connection pool. */
const pool = new PgPool(DbConfig);

// EVENTUALLY... pool.end();

export default pool;
