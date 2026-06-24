import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

let dbExists = false;

// Function to check if the database exists, if not runs without database
export const initDB = async () => {
    try {
        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();
        dbExists = true;
    } catch (err) {
        dbExists = false;
    }
};

export const db = pool;
export const isDBExists = () => dbExists;
