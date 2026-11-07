import { Pool } from "pg";

const globalForPg = globalThis as typeof globalThis & { pgPool?: Pool };

let useSsl = process.env.DATABASE_SSL !== "false";

const createPool = (ssl: boolean) => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("缺少 DATABASE_URL，请在 .env.local 中配置数据库连接串。");
  }
  return new Pool({
    connectionString,
    ssl: ssl ? { rejectUnauthorized: false } : false,
    max: 8,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
};

const state = globalForPg as typeof globalForPg & { pgPool?: Pool };

const getCurrent = (): Pool => {
  state.pgPool ??= createPool(useSsl);
  return state.pgPool;
};

const isSslError = (error: unknown) =>
  error instanceof Error && /ssl|tls|certificate|does not support ssl/i.test(error.message);

/** 首次连接失败且判定为 SSL 问题时，降级为明文连接重试一次。 */
const connect = async (): Promise<Pool> => {
  const pool = getCurrent();
  try {
    await pool.query("select 1");
  } catch (error) {
    if (!useSsl || !isSslError(error)) throw error;
    useSsl = false;
    await pool.end();
    state.pgPool = createPool(false);
    await state.pgPool.query("select 1");
  }
  return getCurrent();
};

export const getPool = async (): Promise<Pool> => connect();

export const query = async <T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
) => (await connect()).query<T>(text, params);
