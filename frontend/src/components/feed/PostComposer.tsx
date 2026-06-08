'use client'
import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Post } from '@/types'
import Avatar from '@/components/ui/Avatar'
import api from '@/lib/api'

interface PostComposerProps {
  username: string
  onPost: (post: Post) => void
}

export default function PostComposer({ username, onPost }: PostComposerProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const MAX = 500

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || loading) return
    setLoading(true)
    try {
      const { data } = await api.post('/posts', { content: content.trim() })
      onPost(data)
      setContent('')
      toast.success('Posted.')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not post.')
    } finally {
      setLoading(false)
    }
  }

  const remaining = MAX - content.length
  const nearLimit = remaining < 50

  return (
    <div className="card p-5">
      <div className="flex gap-3">
        <Avatar username={username} size="md" />
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX))}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full bg-transparent border-0 border-b border-steel-200 px-0 py-2 text-ink text-base
                       placeholder-steel-400 font-body resize-none focus:outline-none focus:border-ink
                       transition-colors duration-200"
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs ${nearLimit ? 'text-accent' : 'text-steel-400'} tag`}>
              {remaining} left
            </span>
            <button
              type="submit"
              disabled={!content.trim() || loading}
              className="btn-primary py-2 px-5 flex items-center gap-2 text-xs"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
