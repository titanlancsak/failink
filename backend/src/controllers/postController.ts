import { Request, Response } from 'express'
import pool from '../db/pool'

export async function getFeed(req: Request, res: Response) {
  const userId = req.user!.userId
  const limit = parseInt(req.query.limit as string) || 10
  const offset = parseInt(req.query.offset as string) || 0
  try {
    const { rows } = await pool.query(
      `SELECT
         p.id,
         p.content,
         p.created_at,
         p.updated_at,
         json_build_object(
           'id', u.id,
           'username', u.username,
           'avatar_url', u.avatar_url
         ) AS author,
         COUNT(DISTINCT l.id)::int AS likes_count,
         COUNT(DISTINCT c.id)::int AS comments_count,
         BOOL_OR(l.user_id = $1) AS user_liked
       FROM posts p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN likes l ON l.post_id = p.id
       LEFT JOIN comments c ON c.post_id = p.id
       GROUP BY p.id, u.id
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    )
    return res.json(rows)
  } catch (err) {
    console.error('getFeed error:', err)
    return res.status(500).json({ message: 'Server error.' })
  }
}