import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';

// libsql クライアントを作成
const client = createClient({
  url: process.env.DB_FILE_NAME!
});

// Drizzle インスタンスを作成（スキーマを含む）
export const db = drizzle(client, { schema });

// 型推論用のエクスポート
export type Database = typeof db;
export { lists, cards } from './schema.js';