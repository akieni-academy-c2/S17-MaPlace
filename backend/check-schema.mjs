import "dotenv/config";
import pool from "./src/config/database.js";

const tables = await pool.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
);
console.log("TABLES:", tables.rows.map((r) => r.table_name).join(", "));

const enums = await pool.query(
  "SELECT typname FROM pg_type WHERE typname IN ('queue_status', 'ticket_status')",
);
console.log("ENUMS:", enums.rows.map((r) => r.typname).join(", "));

const cols = await pool.query(
  "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name IN ('tickets', 'queues') ORDER BY table_name, ordinal_position",
);
for (const r of cols.rows) {
  console.log(`  ${r.table_name}.${r.column_name} : ${r.data_type}`);
}

const idx = await pool.query(
  "SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname",
);
console.log("INDEX:", idx.rows.map((r) => r.indexname).join(", "));

const trg = await pool.query(
  "SELECT tgname FROM pg_trigger WHERE NOT tgisinternal ORDER BY tgname",
);
console.log("TRIGGERS:", trg.rows.map((r) => r.tgname).join(", "));

const cons = await pool.query(
  "SELECT conname FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND contype IN ('u', 'c', 'f') ORDER BY conname",
);
console.log("CONSTRAINTS:", cons.rows.map((r) => r.conname).join(", "));

await pool.end();
