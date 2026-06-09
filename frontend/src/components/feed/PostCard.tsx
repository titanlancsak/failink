'use client'
import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, UserPlus, Trash2, Edit2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Post } from '@/types'
import Avatar from '@/components/ui/Avatar'
import api from '@/lib/api'
import CommentSection from './CommentSection'

interface PostCardProps {
  post: Post
  currentUserId?: number
  onFriendRequest?: (userId: number) => void
  onDelete?: (postId: number) => void
  onUpdate?: (post: Post) => void
}

export default function PostCard({ post, currentUserId, onFriendRequest, onDelete, onUpdate }: PostCardProps) {
  const [liked, setLiked] = useState(post.user_liked)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [showComments, setShowComments] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return
    setDeleting(true)
    try {
      await api.delete(`/posts/${post.id}`)
      toast.success('Post deleted.')
      onDelete?.(post.id)
    } catch {
      toast.error('Could not delete post.')
    } finally {
      setDeleting(false)
    }
  }

  const handleUpdate = async () => {
    if (!editContent.trim()) return
    setSaving(true)
    try {
      await api.put(`/posts/${post.id}`, { content: editContent.trim() })
      toast.success('Post updated.')
      setEditing(false)
      onUpdate?.({ ...post, content: editContent.trim() })
    } catch {
      toast.error('Could not update post.')
    } finally {
      setSaving(false)
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
              {post.updated_at !== post.created_at && (
                <span className="ml-1 italic">(edited)</span>
              )}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {isOwn ? (
            <>
              <button
                onClick={() => setEditing(true)}
                aria-label="Edit post"
                title="Edit post"
                className="p-1.5 text-steel-400 hover:text-ink transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                aria-label="Delete post"
                title="Delete post"
                className="p-1.5 text-steel-400 hover:text-accent transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <button
              onClick={handleFriendRequest}
              aria-label={`Add ${post.author.username} as friend`}
              title={`Add ${post.author.username} as friend`}
              className="p-1.5 text-steel-400 hover:text-accent transition-colors"
            >
              <UserPlus size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value.slice(0, 500))}
              rows={3}
              aria-label="Edit post content"
              placeholder="What's on your mind?"
              className="input-field resize-none text-sm"
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-steel-400 tag">{500 - editContent.length} left</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(false); setEditContent(post.content) }}
                  aria-label="Cancel editing"
                  title="Cancel"
                  className="p-1.5 text-steel-400 hover:text-accent transition-colors"
                >
                  <X size={14} />
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving || !editContent.trim()}
                  aria-label="Save changes"
                  title="Save"
                  className="p-1.5 text-steel-400 hover:text-ink transition-colors"
                >
                  <Check size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-ink text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>
        )}
      </div>

      {/* Divider */}
      <div className="divider" />

      {/* Actions */}
      <div className="px-5 py-3 flex items-center gap-6">
        <button
          onClick={handleLike}
          aria-label={liked ? 'Unlike post' : 'Like post'}
          title={liked ? 'Unlike' : 'Like'}
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
          aria-label={showComments ? 'Hide comments' : 'Show comments'}
          title={showComments ? 'Hide comments' : 'Show comments'}
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