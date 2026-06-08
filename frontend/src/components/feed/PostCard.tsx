'use client'
import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, UserPlus, MoreHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'
import { Post } from '@/types'
import Avatar from '@/components/ui/Avatar'
import api from '@/lib/api'
import CommentSection from './CommentSection'

interface PostCardProps {
  post: Post
  currentUserId?: number
  onFriendRequest?: (userId: number) => void
}

export default function PostCard({ post, currentUserId, onFriendRequest }: PostCardProps) {
  const [liked, setLiked] = useState(post.user_liked)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [showComments, setShowComments] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)

  const isOwn = currentUserId === post.author.id

  const handleLike = async () => {
    if (likeLoading) return
    setLikeLoading(true)
    const prev = liked
    setLiked(!liked)
    setLikesCount((c) => (liked ? c - 1 : c + 1))
    try {
      if (prev) {
        await api.delete(`/posts/${post.id}/like`)
      } else {
        await api.post(`/posts/${post.id}/like`)
      }
    } catch {
      setLiked(prev)
      setLikesCount(post.likes_count)
      toast.error('Something went wrong.')
    } finally {
      setLikeLoading(false)
    }
  }

  const handleFriendRequest = async () => {
    try {
      await api.post('/friends/request', { receiverId: post.author.id })
      toast.success(`Friend request sent to ${post.author.username}.`)
      onFriendRequest?.(post.author.id)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not send request.')
    }
  }

  return (
    <article className="card animate-fade-up opacity-0 [animation-fill-mode:forwards]">
      {/* Header */}
      <div className="p-5 pb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar username={post.author.username} size="md" />
          <div>
            <Link
              href={`/profile/${post.author.id}`}
              className="font-display text-sm text-ink hover:text-accent transition-colors"
            >
              {post.author.username}
            </Link>
            <p className="text-xs text-steel-400 mt-0.5">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {!isOwn && (
          <button
            onClick={handleFriendRequest}
            className="p-1.5 text-steel-400 hover:text-accent transition-colors"
            title={`Add ${post.author.username} as friend`}
          >
            <UserPlus size={15} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        <p className="text-ink text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Divider */}
      <div className="divider" />

      {/* Actions */}
      <div className="px-5 py-3 flex items-center gap-6">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 text-xs transition-all duration-150 group ${
            liked ? 'text-accent' : 'text-steel-400 hover:text-accent'
          }`}
        >
          <Heart
            size={15}
            className={`transition-transform duration-150 group-hover:scale-110 ${liked ? 'fill-accent' : ''}`}
          />
          <span className="tag text-inherit">{likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-xs text-steel-400 hover:text-ink transition-colors group"
        >
          <MessageCircle size={15} className="group-hover:scale-110 transition-transform duration-150" />
          <span className="tag text-inherit">{post.comments_count}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-steel-200">
          <CommentSection postId={post.id} currentUserId={currentUserId} />
        </div>
      )}
    </article>
  )
}
