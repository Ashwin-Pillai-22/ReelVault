import * as SQLite from "expo-sqlite";

export const dbPromise = SQLite.openDatabaseAsync("reelvault.db");

export async function initDatabase() {
    const db = await dbPromise;

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS folders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL
        );


        CREATE TABLE IF NOT EXISTS reels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reel_url TEXT NOT NULL UNIQUE,
            username TEXT,
            caption TEXT,
            thumbnail_url TEXT,
            folder_id INTEGER,
            created_at TEXT NOT NULL,
            FOREIGN KEY (folder_id)
                REFERENCES folders(id)
                ON DELETE SET NULL
        );
    `);
}