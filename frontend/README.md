# Agora — Frontend (Next.js)

## Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Axios** for API calls
- **react-hot-toast** for notifications
- **date-fns** for time formatting
- **lucide-react** for icons

## Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx       # Login page
│   │   ├── register/page.tsx    # Register page
│   │   └── layout.tsx           # Auth layout (split screen)
│   ├── feed/page.tsx            # Main feed
│   ├── friends/page.tsx         # Friends management
│   ├── profile/page.tsx         # User profile
│   ├── layout.tsx               # Root layout (fonts, toaster)
│   ├── globals.css              # Global styles + Tailwind
│   └── page.tsx                 # Root redirect
├── components/
│   ├── feed/
│   │   ├── PostCard.tsx         # Individual post with likes/comments
│   │   ├── PostComposer.tsx     # Create new post
│   │   └── CommentSection.tsx   # Comments list + input
│   ├── layout/
│   │   └── Navbar.tsx           # Top navigation bar
│   └── ui/
│       └── Avatar.tsx           # User avatar (letter-based)
├── hooks/
│   └── useAuth.ts               # Auth state hook
├── lib/
│   ├── api.ts                   # Axios instance + interceptors
│   └── auth.ts                  # Token/user storage helpers
└── types/
    └── index.ts                 # TypeScript types
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   # Edit NEXT_PUBLIC_API_URL to point to your backend
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/feed` or `/auth/login` |
| `/auth/login` | Login form |
| `/auth/register` | Registration form |
| `/feed` | Main social feed with post composer |
| `/friends` | Friends list, requests, and user search |
| `/profile` | Your profile with bio editing and post history |

## API Endpoints Expected

The frontend expects these backend routes:

### Auth
- `POST /api/auth/login` → `{ token, user }`
- `POST /api/auth/register` → `{ token, user }`

### Posts
- `GET /api/posts` → `Post[]`
- `POST /api/posts` → `Post`
- `POST /api/posts/:id/like` → like a post
- `DELETE /api/posts/:id/like` → unlike a post
- `GET /api/posts/:id/comments` → `Comment[]`
- `POST /api/posts/:id/comments` → `Comment`

### Users
- `GET /api/users/me` → `User`
- `PUT /api/users/me` → updated `User`
- `GET /api/users/me/posts` → `Post[]`
- `GET /api/users/search?q=` → `User[]`

### Friends
- `GET /api/friends` → `User[]`
- `GET /api/friends/requests` → `FriendRequest[]`
- `POST /api/friends/request` → send request
- `PUT /api/friends/request/:id/accept` → accept
- `PUT /api/friends/request/:id/reject` → reject

## Deployment on VPS (DigitalOcean)

```bash
# Build
npm run build

# Run with PM2
npm install -g pm2
pm2 start npm --name "agora-frontend" -- start
pm2 save

# Nginx config (reverse proxy port 3000)
server {
  listen 80;
  server_name yourdomain.com;
  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```
