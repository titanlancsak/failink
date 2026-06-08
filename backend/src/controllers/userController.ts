import { Request, Response } from 'express'
import pool from '../db/pool'

// GET /api/users/me
export async function getMe(req: Request, res: Response) {
  const userId = req.user!.userId
  try {
    const { rows } = await pool.query(
      'SELECT id, username, email, bio, avatar_url, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    )
    if (!rows.length) return res.status(404).json({ message: 'User not found.' })
    return res.json(rows[0])
  } catch (err) {
    console.error('getMe error:', err)
    return res.status(500).json({ message: 'Server error.' })
  }
}

// PUT /api/users/me
export async function updateMe(req: Request, res: Response) {
  const userId = req.user!.userId
  const { bio } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE users SET bio = $1
       WHERE id = $2
       RETURNING id, username, email, bio, avatar_url, created_at, updated_at`,
      [bio ?? null, userId]
    )
    return res.json(rows[0])
  } catch (err) {
    console.error('updateMe error:', err)
    return res.status(500).json({ message: 'Server error.' })
  }
}

// GET /api/users/me/posts
export async function getMyPosts(req: Request, res: Response) {
  const userId = req.user!.userId
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
       WHERE p.user_id = $1
       GROUP BY p.id, u.id
       ORDER BY p.created_at DESC`,
      [userId]
    )
    return res.json(rows)
  } catch (err) {
    console.error('getMyPosts error:', err)
    return res.status(500).json({ message: 'Server error.' })
  }
}

// GET /api/users/:id
export async function getUserById(req: Request, res: Response) {
  const targetId = parseInt(req.params.id)
  try {
    const { rows } = await pool.query(
      'SELECT id, username, bio, avatar_url, created_at FROM users WHERE id = $1',
      [targetId]
    )
    if (!rows.length) return res.status(404).json({ message: 'User not found.' })
    return res.json(rows[0])
  } catch (err) {
    console.error('getUserById error:', err)
    return res.status(500).json({ message: 'Server error.' })
  }
}

// GET /api/users/search?q=
export async function searchUsers(req: Request, res: Response) {
  const userId = req.user!.userId
  const q = (req.query.q as string)?.trim()
  if (!q || q.length < 2) {
    return res.status(422).json({ message: 'Query must be at least 2 characters.' })
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, username, bio, avatar_url
       FROM users
       WHERE username ILIKE $1
         AND id != $2
       ORDER BY username
       LIMIT 20`,
      [`%${q}%`, userId]
    )
    return res.json(rows)
  } catch (err) {
    console.error('searchUsers error:', err)
    return res.status(500).json({ message: 'Server error.' })
  }
}
