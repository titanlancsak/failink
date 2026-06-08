'use client'
import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Send, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Comment } from '@/types'
import Avatar from '@/components/ui/Avatar'
import api from '@/lib/api'

interface CommentSectionProps {
  postId: number
  currentUserId?: number
}

export default function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/posts/${postId}/comments`)
      setComments(data)
    } catch {
      toast.error('Could not load comments.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || submitting) return
    setSubmitting(true)
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { content: content.trim() })
      setComments((prev) => [...prev, data])
      setContent('')
    } catch {
      toast.error('Could not post comment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-5">
      {/* Comment input */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-5">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          rows={1}
          className="input-field flex-1 resize-none text-sm py-2"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e as any)
            }
          }}
        />
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="p-2 bg-ink text-paper hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </form>

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 size={18} className="animate-spin text-steel-400" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-steel-400 text-center py-4 tag">No comments yet</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 animate-fade-in">
              <Avatar username={comment.author.username} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-display text-xs text-ink">{comment.author.username}</span>
                  <span className="text-xs text-steel-400">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-ink leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
