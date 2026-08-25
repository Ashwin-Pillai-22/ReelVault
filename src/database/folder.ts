import { dbPromise } from "./database";

export async function createFolder(name: string) {
  const db = await dbPromise;

  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Folder name cannot be empty");
  }

  const result = await db.runAsync(
    `
    INSERT INTO folders (name, created_at)
    VALUES (?, ?)
    `,
    trimmedName,
    new Date().toISOString()
  );

  return result.lastInsertRowId;
}

export async function getFolders() {
  const db = await dbPromise;

  return await db.getAllAsync<{
    id: number;
    name: string;
    created_at: string;
  }>(
    `
    SELECT *
    FROM folders
    ORDER BY created_at DESC
    `
  );
}
export async function getReelsByFolder(
  folderId: number
) {
  const db = await dbPromise;

  return await db.getAllAsync(
    `
    SELECT *
    FROM reels
    WHERE folder_id = ?
    ORDER BY created_at DESC
    `,
    folderId
  );
}

export async function deleteFolder(folderId: number) {
    const db = await dbPromise;

    // Delete all reels belonging to this folder
    await db.runAsync(
        `
        DELETE FROM reels
        WHERE folder_id = ?
        `,
        folderId
    );

    // Delete the folder
    await db.runAsync(
        `
        DELETE FROM folders
        WHERE id = ?
        `,
        folderId
    );
}
