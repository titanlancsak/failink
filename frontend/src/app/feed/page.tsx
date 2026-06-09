'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { Post } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import PostCard from '@/components/feed/PostCard'
import PostComposer from '@/components/feed/PostComposer'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'

const LIMIT = 10

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [requestedIds, setRequestedIds] = useState<Set<number>>(new Set())
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading])

  const fetchPosts = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true)
      setOffset(0)
      setHasMore(true)
    }
    try {
      const currentOffset = reset ? 0 : offset
      const { data } = await api.get(`/posts?limit=${LIMIT}&offset=${currentOffset}`)
      if (reset) {
        setPosts(data)
      } else {
        setPosts((prev) => [...prev, ...data])
      }
      setOffset(currentOffset + data.length)
      setHasMore(data.length === LIMIT)
    } catch {
      toast.error('Could not load posts.')
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
    }
  }, [offset])

  // Initial load
  useEffect(() => {
    if (user) fetchPosts(true)
  }, [user])

  // Infinite scroll observer
  useEffect(() => {
    if (!bottomRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setLoadingMore(true)
          fetchPosts(false)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(bottomRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading, fetchPosts])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPosts(true)
  }

  const handleNewPost = (post: Post) => {
    setPosts((prev) => [post, ...prev])
    setOffset((prev) => prev + 1)
  }

  const handleFriendRequest = (userId: number) => {
    setRequestedIds((prev) => new Set(prev).add(userId))
  }

  const handleDeletePost = (postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
    setOffset((prev) => prev - 1)
  }

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts((prev) => prev.map((p) => p.id === updatedPost.id ? updatedPost : p))
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 size={24} className="animate-spin text-steel-400" />
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Page header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="tag block mb-1">Latest</span>
              <h1 className="font-display text-3xl text-ink">Your Feed</h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label="Refresh feed"
              className="btn-ghost flex items-center gap-2 text-xs"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              <span className="tag">Refresh</span>
            </button>
          </div>

          {/* Composer */}
          {user && (
            <div className="mb-6">
              <PostComposer username={user.username} onPost={handleNewPost} />
            </div>
          )}

          {/* Divider label */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 divider" />
            <span className="tag text-steel-400">Posts</span>
            <div className="flex-1 divider" />
          </div>

          {/* Posts */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={24} className="animate-spin text-steel-400" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-2xl text-steel-400 mb-2">Nothing here yet.</p>
              <p className="text-sm text-steel-400">Be the first to share something.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, i) => (
                <div key={post.id} style={{ animationDelay: `${i * 60}ms` }}>
                  <PostCard
                    post={post}
                    currentUserId={user?.id}
                    onFriendRequest={handleFriendRequest}
                    onDelete={handleDeletePost}
                    onUpdate={handleUpdatePost}
                  />
                </div>
              ))}

              {/* Infinite scroll trigger */}
              <div ref={bottomRef} className="py-4 flex justify-center">
                {loadingMore && (
                  <Loader2 size={20} className="animate-spin text-steel-400" />
                )}
                {!hasMore && posts.length > 0 && (
                  <p className="tag text-steel-400">You have reached the end</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}