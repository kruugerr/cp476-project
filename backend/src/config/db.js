import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,

    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

let dbExists = false;

// Function to check if the database exists, if not runs without database
export const initDB = async () => {
    try {
        const conn = await pool.connect();
        await client.query("SELECT 1");
        conn.release();
        dbExists = true;
    } catch (err) {
        dbExists = false;
    }
};

export const db = pool;
export const isDBExists = () => dbExists;
