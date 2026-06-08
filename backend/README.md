# Agora — Backend (Node.js + Express)

## Stack
- **Node.js + Express** — REST API
- **TypeScript** — full type safety
- **PostgreSQL** (`pg`) — database
- **bcryptjs** — password hashing
- **jsonwebtoken** — JWT auth
- **express-validator** — input validation
- **helmet + cors** — security headers

## Project Structure

```
src/
├── index.ts                      # App entry, middleware, route mounting
├── db/
│   ├── pool.ts                   # PostgreSQL connection pool
│   └── migrate.ts                # Schema migrations (run once)
├── types/
│   └── index.ts                  # Shared TypeScript types
├── middleware/
│   ├── authenticate.ts           # JWT verification middleware
│   └── validate.ts               # express-validator error handler
├── controllers/
│   ├── authController.ts         # register, login
│   ├── postController.ts         # feed, create, delete, like, comments
│   ├── userController.ts         # profile, update, search
│   └── friendController.ts       # send/accept/reject/list friends
└── routes/
    ├── auth.ts
    ├── posts.ts
    ├── users.ts
    └── friends.ts
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create PostgreSQL database
```sql
CREATE USER agora_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE agora_db OWNER agora_user;
GRANT ALL PRIVILEGES ON DATABASE agora_db TO agora_user;
```

### 3. Configure environment
```bash
cp .env.example .env
# Fill in your DB credentials and a strong JWT_SECRET
```

### 4. Run migrations
```bash
npm run db:migrate
```

### 5. Start development server
```bash
npm run dev
```

### 6. Build for production
```bash
npm run build
npm start
```

---

## API Reference

### Auth
| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | `{username, email, password}` | Create account |
| POST | `/api/auth/login` | `{email, password}` | Sign in |

All other routes require `Authorization: Bearer <token>` header.

### Posts
| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/posts` | — | Get feed (all posts) |
| POST | `/api/posts` | `{content}` | Create post |
| DELETE | `/api/posts/:id` | — | Delete own post |
| POST | `/api/posts/:id/like` | — | Like a post |
| DELETE | `/api/posts/:id/like` | — | Unlike a post |
| GET | `/api/posts/:id/comments` | — | Get comments |
| POST | `/api/posts/:id/comments` | `{content}` | Add comment |

### Users
| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/users/me` | — | Get own profile |
| PUT | `/api/users/me` | `{bio}` | Update bio |
| GET | `/api/users/me/posts` | — | Get own posts |
| GET | `/api/users/search?q=` | — | Search users by username |
| GET | `/api/users/:id` | — | Get user by ID |

### Friends
| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/friends` | — | List friends |
| GET | `/api/friends/requests` | — | Pending incoming requests |
| POST | `/api/friends/request` | `{receiverId}` | Send friend request |
| PUT | `/api/friends/request/:id/accept` | — | Accept request |
| PUT | `/api/friends/request/:id/reject` | — | Decline request |
| DELETE | `/api/friends/:id` | — | Remove friend |

---

## Deployment on VPS (DigitalOcean)

### Install Node.js (if needed)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib
sudo -u postgres psql
# Run CREATE USER / CREATE DATABASE commands above
```

### Run with PM2
```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name "agora-api"
pm2 save
pm2 startup
```

### Nginx reverse proxy (port 4000)
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL with Certbot
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### Environment for production
```env
NODE_ENV=production
PORT=4000
CLIENT_URL=https://yourdomain.com
JWT_SECRET=<very-long-random-string>
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agora_db
DB_USER=agora_user
DB_PASSWORD=<your-password>
```
