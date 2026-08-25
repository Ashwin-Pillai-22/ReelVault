import { dbPromise } from "./database"

export async function saveReel(
  reelUrl: string,
  username: string,
  caption: string,
  thumbnailUrl: string | null,
  folderId: number
) {
  const db = await dbPromise;

  const result = await db.runAsync(
    `
    INSERT INTO reels (
      reel_url,
      username,
      caption,
      thumbnail_url,
      folder_id,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    reelUrl,
    username,
    caption,
    thumbnailUrl,
    folderId,
    new Date().toISOString()
  );

  return result.lastInsertRowId;
}

export async function getReelsByFolder(folderId: number) {
    const db = await dbPromise;

    return await db.getAllAsync<{
        id: number;
        reel_url: string;
        username: string;
        caption: string;
        thumbnail_url: string | null;
        folder_id: number;
        created_at: string;
    }>(
        `
        SELECT *
        FROM reels
        WHERE folder_id = ?
        ORDER BY created_at DESC
        `,
        folderId
    );
}

export async function getReelById(
    reelId: number
) {
    const db = await dbPromise;

    return await db.getFirstAsync<{
        id: number;
        reel_url: string;
        username: string;
        caption: string;
        thumbnail_url: string | null;
        folder_id: number | null;
        created_at: string;
    }>(
        `
        SELECT *
        FROM reels
        WHERE id = ?
        `,
        reelId
    );
}

export async function deleteReel(reelId: number) {
    const db = await dbPromise;

    await db.runAsync(
        `
        DELETE FROM reels
        WHERE id = ?
        `,
        reelId
    );
}