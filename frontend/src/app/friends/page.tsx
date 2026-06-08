'use client'
import { useState, useEffect } from 'react'
import { Loader2, UserCheck, UserX, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { FriendRequest, User } from '@/types'
import Avatar from '@/components/ui/Avatar'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'

type Tab = 'friends' | 'requests' | 'search'

export default function FriendsPage() {
  const [tab, setTab] = useState<Tab>('friends')
  const [friends, setFriends] = useState<User[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    fetchFriends()
    fetchRequests()
  }, [])

  const fetchFriends = async () => {
    try {
      const { data } = await api.get('/friends')
      setFriends(data)
    } catch {
      toast.error('Could not load friends.')
    } finally {
      setLoading(false)
    }
  }

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/friends/requests')
      setRequests(data)
    } catch {}
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const { data } = await api.get(`/users/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchResults(data)
    } catch {
      toast.error('Search failed.')
    } finally {
      setSearching(false)
    }
  }

  const handleSendRequest = async (userId: number) => {
    try {
      await api.post('/friends/request', { receiverId: userId })
      toast.success('Friend request sent.')
      setSearchResults((prev) => prev.filter((u) => u.id !== userId))
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not send request.')
    }
  }

  const handleAccept = async (requestId: number) => {
    try {
      await api.put(`/friends/request/${requestId}/accept`)
      toast.success('Friend request accepted.')
      setRequests((prev) => prev.filter((r) => r.id !== requestId))
      fetchFriends()
    } catch {
      toast.error('Could not accept request.')
    }
  }

  const handleReject = async (requestId: number) => {
    try {
      await api.put(`/friends/request/${requestId}/reject`)
      setRequests((prev) => prev.filter((r) => r.id !== requestId))
      toast.success('Request declined.')
    } catch {
      toast.error('Could not decline request.')
    }
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'friends', label: 'Friends', count: friends.length },
    { key: 'requests', label: 'Requests', count: requests.length },
    { key: 'search', label: 'Find People' },
  ]

  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-8">
            <span className="tag block mb-1">Social</span>
            <h1 className="font-display text-3xl text-ink">Friends</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-steel-200 mb-8">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-5 py-3 text-xs font-display tracking-widest uppercase transition-all duration-150 border-b-2 -mb-px
                  ${tab === key
                    ? 'text-ink border-accent'
                    : 'text-steel-400 border-transparent hover:text-ink'
                  }`}
              >
                {label}
                {typeof count === 'number' && count > 0 && (
                  <span className={`ml-2 text-xs rounded-none px-1.5 py-0.5 ${tab === key ? 'bg-accent text-paper' : 'bg-steel-200 text-steel-500'}`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Friends list */}
          {tab === 'friends' && (
            loading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={24} className="animate-spin text-steel-400" />
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-display text-2xl text-steel-400 mb-2">No friends yet.</p>
                <p className="text-sm text-steel-400">Search for people to connect with.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div key={friend.id} className="card p-4 flex items-center gap-4 animate-fade-up opacity-0 [animation-fill-mode:forwards]">
                    <Avatar username={friend.username} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm text-ink">{friend.username}</p>
                      {friend.bio && <p className="text-xs text-steel-400 truncate mt-0.5">{friend.bio}</p>}
                    </div>
                    <span className="tag text-steel-400">Friend</span>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Requests */}
          {tab === 'requests' && (
            requests.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-display text-2xl text-steel-400">No pending requests.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div key={req.id} className="card p-4 flex items-center gap-4 animate-fade-up opacity-0 [animation-fill-mode:forwards]">
                    <Avatar username={req.sender.username} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm text-ink">{req.sender.username}</p>
                      <p className="text-xs text-steel-400 mt-0.5">Wants to connect</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAccept(req.id)} className="p-2 text-steel-400 hover:text-ink transition-colors" title="Accept">
                        <UserCheck size={16} />
                      </button>
                      <button onClick={() => handleReject(req.id)} className="p-2 text-steel-400 hover:text-accent transition-colors" title="Decline">
                        <UserX size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Search */}
          {tab === 'search' && (
            <div>
              <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn-primary px-5 flex items-center gap-2" disabled={searching}>
                  {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Search
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div key={user.id} className="card p-4 flex items-center gap-4 animate-fade-in">
                      <Avatar username={user.username} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm text-ink">{user.username}</p>
                        {user.bio && <p className="text-xs text-steel-400 truncate mt-0.5">{user.bio}</p>}
                      </div>
                      <button onClick={() => handleSendRequest(user.id)} className="btn-secondary py-1.5 px-4 text-xs">
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
