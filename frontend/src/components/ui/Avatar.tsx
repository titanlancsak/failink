interface AvatarProps {
  username: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-14 h-14 text-lg',
}

// Generate a deterministic background color from username
function colorFromUsername(username: string): string {
  const colors = ['bg-ink', 'bg-accent', 'bg-steel-600', 'bg-accent-dark']
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export default function Avatar({ username, size = 'md', className = '' }: AvatarProps) {
  const bg = colorFromUsername(username)
  return (
    <div
      className={`${sizes[size]} ${bg} flex items-center justify-center text-paper font-display font-semibold flex-shrink-0 ${className}`}
    >
      {username[0].toUpperCase()}
    </div>
  )
}
