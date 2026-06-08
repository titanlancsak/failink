import { Request, Response } from 'express'
import pool from '../db/pool'

// GET /api/friends — list accepted friends
export async function getFriends(req: Request, res: Response) {
  const userId = req.user!.userId
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.username, u.bio, u.avatar_url, u.created_at
       FROM friend_requests fr
       JOIN users u ON (
         CASE
           WHEN fr.sender_id = $1 THEN u.id = fr.receiver_id
           ELSE u.id = fr.sender_id
         END
       )
       WHERE fr.status = 'accepted'
         AND (fr.sender_id = $1 OR fr.receiver_id = $1)
       ORDER BY u.username`,
      [userId]
    )
    return res.json(rows)
  } catch (err) {
    console.error('getFriends error:', err)
    return res.status(500).json({ message: 'Server error.' })
  }
}

// GET /api/friends/requests — pending requests received
export async function getPendingRequests(req: Request, res: Response) {
  const userId = req.user!.userId
  try {
    const { rows } = await pool.query(
      `SELECT
         fr.id,
         fr.status,
         fr.created_at,
         fr.updated_at,
         json_build_object(
           'id', u.id,
           'username', u.username,
           'bio', u.bio,
           'avatar_url', u.avatar_url
         ) AS sender
       FROM friend_requests fr
       JOIN users u ON u.id = fr.sender_id
       WHERE fr.receiver_id = $1
         AND fr.status = 'pending'
       ORDER BY fr.created_at DESC`,
      [userId]
    )
    return res.json(rows)
  } catch (err) {
    console.error('getPendingRequests error:', err)
    return res.status(500).json({ message: 'Server error.' })
  }
}

// POST /api/friends/request — send a request
export async function sendRequest(req: Request, res: Response) {
  const senderId = req.user!.userId
  const { receiverId } = req.body

  if (senderId === receiverId) {
    return res.status(400).json({ message: 'Cannot send a friend request to yourself.' })
  }

  const client = await pool.connect()
  try {
    // Check receiver exists
    const receiver = await client.query('SELECT id FROM users WHERE id = $1', [receiverId])
    if (!receiver.rows.length) {
      return res.status(404).json({ message: 'User not found.' })
    }

    // Check existing relationship
    const existing = await client.query(
      `SELECT id, status FROM friend_requests
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)`,
      [senderId, receiverId]
    )

    if (existing.rows.length > 0) {
      const { status } = existing.rows[0]
      if (status === 'accepted') {
        return res.status(409).json({ message: 'You are already friends.' })
      }
      if (status === 'pending') {
        return res.status(409).json({ message: 'A friend request already exists.' })
      }
      // rejected — allow re-sending by updating
      await client.query(
        `UPDATE friend_requests SET status = 'pending', sender_id = $1, receiver_id = $2, updated_at = NOW()
         WHERE id = $3`,
        [senderId, receiverId, existing.rows[0].id]
      )
      return res.status(201).json({ message: 'Friend request sent.' })
    }

    await client.query(
      'INSERT INTO friend_requests (sender_id, receiver_id) VALUES ($1, $2)',
      [senderId, receiverId]
    )
    return res.status(201).json({ message: 'Friend request sent.' })
  } catch (err) {
    console.error('sendRequest error:', err)
    return res.status(500).json({ message: 'Server error.' })
  } finally {
    client.release()
  }
}

// PUT /api/friends/request/:id/accept
export async function acceptRequest(req: Request, res: Response) {
  const userId = req.user!.userId
  const requestId = parseInt(req.params.id)
  try {
    const { rowCount } = await pool.query(
      `UPDATE friend_requests
       SET status = 'accepted', updated_at = NOW()
       WHERE id = $1 AND receiver_id = $2 AND status = 'pending'`,
      [requestId, userId]
    )
    if (!rowCount) {
      return res.status(404).json({ message: 'Request not found or already handled.' })
    }
    return res.json({ message: 'Friend request accepted.' })
  } catch (err) {
    console.error('acceptRequest error:', err)
    return res.status(500).json({ message: 'Server error.' })
  }
}

// PUT /api/friends/request/:id/reject
export async function rejectRequest(req: Request, res: Response) {
  const userId = req.user!.userId
  const requestId = parseInt(req.params.id)
  try {
    const { rowCount } = await pool.query(
      `UPDATE friend_requests
       SET status = 'rejected', updated_at = NOW()
       WHERE id = $1 AND receiver_id = $2 AND status = 'pending'`,
      [requestId, userId]
    )
    if (!rowCount) {
      return res.status(404).json({ message: 'Request not found or already handled.' })
    }
    return res.json({ message: 'Friend request declined.' })
  } catch (err) {
    console.error('rejectRequest error:', err)
    return res.status(500).json({ message: 'Server error.' })
  }
}

// DELETE /api/friends/:id — unfriend
export async function removeFriend(req: Request, res: Response) {
  const userId = req.user!.userId
  const friendId = parseInt(req.params.id)
  try {
    await pool.query(
      `DELETE FROM friend_requests
       WHERE status = 'accepted'
         AND ((sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1))`,
      [userId, friendId]
    )
    return res.json({ message: 'Friend removed.' })
  } catch (err) {
    console.error('removeFriend error:', err)
    return res.status(500).json({ message: 'Server error.' })
  }
}
