# Deployment

## Env
Server: MONGO_URI (Atlas), JWT_SECRET (32+ chars), CLIENT_URL (https://app.yourdomain.com), CLOUDINARY_*
Client: VITE_API_URL=https://api.yourdomain.com/api

## Option A — VPS with Docker Compose
```bash
cp server/.env.example server/.env  # fill prod values
docker compose up --build -d
docker compose exec server npm run seed  # first time only
```

## Option B — Separate
- Server: Render / Railway / Fly: build `npm install`, start `npm start`, set env, allow CLIENT_URL CORS.
- Client: Vercel / Netlify: root `client`, build `npm run build`, output `dist`, set VITE_API_URL.
- DB: MongoDB Atlas, whitelist server IP, set MONGO_URI.

## Checklist
- [ ] Change JWT_SECRET, strong passwords
- [ ] `isArchived` instead of delete in prod
- [ ] Enable HTTPS, secure cookies if used
- [ ] Backups for Mongo, Cloudinary signed uploads
- [ ] `npm run seed` only once
