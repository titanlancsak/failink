export interface User {
  id: number
  username: string
  email: string
  avatar_url?: string
  bio?: string
  created_at: string
}

export interface Post {
  id: number
  content: string
  author: User
  likes_count: number
  comments_count: number
  user_liked: boolean
  created_at: string
}

export interface Comment {
  id: number
  content: string
  author: User
  post_id: number
  created_at: string
}

export interface FriendRequest {
  id: number
  sender: User
  receiver: User
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ApiError {
  message: string
  status?: number
}
