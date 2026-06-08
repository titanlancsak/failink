'use client'
import { useState, useEffect } from 'react'
import { Loader2, Edit2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Post, User } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { setUser } from '@/lib/auth'
import Avatar from '@/components/ui/Avatar'
import PostCard from '@/components/feed/PostCard'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [editBio, setEditBio] = useState(false)
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (authUser) {
      fetchProfile()
    }
  }, [authUser])

  const fetchProfile = async () => {
    try {
      const [profileRes, postsRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/users/me/posts'),
      ])
      setProfile(profileRes.data)
      setBio(profileRes.data.bio || '')
      setPosts(postsRes.data)
    } catch {
      toast.error('Could not load profile.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBio = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/users/me', { bio })
      setProfile(data)
      setUser(data)
      setEditBio(false)
      toast.success('Profile updated.')
    } catch {
      toast.error('Could not update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-14 flex justify-center items-center min-h-screen">
          <Loader2 size={24} className="animate-spin text-steel-400" />
        </div>
      </>
    )
  }

  if (!profile) return null

  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Profile header */}
          <div className="card p-8 mb-8 animate-fade-up opacity-0 [animation-fill-mode:forwards]">
            <div className="flex items-start gap-6">
              <Avatar username={profile.username} size="lg" />
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-3xl text-ink mb-1">{profile.username}</h1>
                <p className="text-xs text-steel-400 tag mb-4">{profile.email}</p>

                {/* Bio */}
                {editBio ? (
                  <div className="flex gap-2">
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 160))}
                      rows={2}
                      className="input-field flex-1 resize-none text-sm py-2"
                      placeholder="Tell people about yourself..."
                      autoFocus
                    />
                    <div className="flex flex-col gap-1">
                      <button onClick={handleSaveBio} disabled={saving} className="p-2 text-steel-400 hover:text-ink transition-colors">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      </button>
                      <button onClick={() => setEditBio(false)} className="p-2 text-steel-400 hover:text-accent transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 group">
                    <p className="text-sm text-ink leading-relaxed flex-1">
                      {profile.bio || <span className="text-steel-400 italic">No bio yet.</span>}
                    </p>
                    <button
                      onClick={() => setEditBio(true)}
                      className="p-1.5 text-steel-400 hover:text-ink transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-6 pt-6 border-t border-steel-200">
              <div>
                <p className="font-display text-2xl text-ink">{posts.length}</p>
                <p className="tag text-steel-400 mt-0.5">Posts</p>
              </div>
              <div className="w-px bg-steel-200" />
              <div>
                <p className="tag text-steel-400">
                  Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 divider" />
            <span className="tag text-steel-400">Your Posts</span>
            <div className="flex-1 divider" />
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-2xl text-steel-400">No posts yet.</p>
              <p className="text-sm text-steel-400 mt-1">Share something on the feed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, i) => (
                <div key={post.id} style={{ animationDelay: `${i * 60}ms` }}>
                  <PostCard post={post} currentUserId={profile.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
