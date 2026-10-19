# VidyaLearn — Apna College-style Course Platform

A full-stack video course platform built with **Next.js 14 (App Router) + Tailwind CSS + Prisma + NextAuth**, designed to deploy on **Vercel** with **manual video upload** by the admin.

## ✨ Features

- 🏠 Landing page listing all published courses (Apna College-style)
- 🎓 Course pages with a playlist sidebar and lesson-by-lesson video player
- ✅ Progress tracking — mark lessons complete, per-course progress bars
- 📚 Student dashboard ("My Learning") with completion stats
- 🛠️ Admin panel — create/delete courses, upload lesson videos manually (MP4/WebM/MOV up to 500MB), reorder-free automatic numbering, publish/draft toggle
- 🔐 Auth: email + password (students) and a seeded admin account
- ☁️ Videos stream directly from **Vercel Blob** storage (no serverless body-size issues)

## 🧱 Tech Stack

| Layer     | Tech                                   |
| --------- | -------------------------------------- |
| Frontend  | Next.js 14 App Router, Tailwind CSS    |
| Backend   | Next.js API routes                     |
| Database  | PostgreSQL via Prisma (Neon / Vercel)  |
| Auth      | NextAuth (credentials, JWT sessions)   |
| Storage   | Vercel Blob (direct client uploads)    |

## 🚀 Deploy to Vercel — Step by Step

### 1. Create the database (free)

1. Go to [neon.tech](https://neon.tech) → sign up → create a project.
2. Copy the **connection string** (looks like `postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require`).

> Vercel Postgres works too — but Neon's free tier is the easiest.

### 2. Create Vercel Blob storage

1. On [vercel.com](https://vercel.com) → your project (or any project) → **Storage** tab → **Create Database → Blob**.
2. Copy the `BLOB_READ_WRITE_TOKEN` value.

### 3. Push this repo to GitHub, then import into Vercel

```bash
git init && git add -A && git commit -m "initial commit"
git remote add origin https://github.com/<you>/vidyalearn.git
git push -u origin main
```

On Vercel: **Add New → Project → Import** the repo. Framework preset: **Next.js** (auto-detected).

### 4. Set environment variables in Vercel (Project → Settings → Environment Variables)

| Key                     | Value                                              |
| ----------------------- | -------------------------------------------------- |
| `DATABASE_URL`          | Your Neon/Postgres connection string               |
| `NEXTAUTH_SECRET`       | Run `openssl rand -base64 32` and paste the output |
| `NEXTAUTH_URL`          | `https://<your-app>.vercel.app`                    |
| `BLOB_READ_WRITE_TOKEN` | From step 2                                        |

### 5. Initialize the database

From your machine (with `.env` filled locally from `.env.example`):

```bash
npm install
npx prisma db push      # creates tables in your hosted DB
npm run seed            # creates the admin account + a demo course
```

### 6. Deploy 🎉

Push to `main` — Vercel builds and deploys automatically. Open your URL and log in with the admin account you seeded (default `admin@example.com` / `admin123` — **change the env vars before seeding to use your own**).

## 💻 Local development

```bash
cp .env.example .env       # fill in DATABASE_URL, NEXTAUTH_SECRET, BLOB token
npm install
npx prisma db push
npm run seed
npm run dev                # http://localhost:3000
```

## 📤 How to upload videos (admin)

1. Log in with the **admin** account → **Admin** in the navbar.
2. Create a course (title + description + optional thumbnail URL).
3. In the course card, enter a lesson title, pick a video file, click **Upload & add lesson**.
   - The file streams **directly from your browser to Vercel Blob** (bypasses Vercel's 4.5 MB serverless body limit), then the lesson record is saved to Postgres.
4. Lessons are numbered automatically in upload order and appear instantly in the course playlist.

> Tip: for very large files (>500MB) or better streaming quality, upload to YouTube (unlisted) or Cloudinary and paste the URL as the lesson's `videoUrl` via a small script — the player accepts any direct video URL.

## 🗂 Project structure

```
prisma/schema.prisma        # User, Course, Lesson, VideoProgress models
prisma/seed.ts              # admin account + demo course
src/app/page.tsx            # course catalog (home)
src/app/login|register/     # auth pages
src/app/dashboard/          # student progress dashboard
src/app/admin/              # admin panel (client component)
src/app/courses/[slug]/     # course player page
src/app/api/                # auth, register, courses, lessons, upload, progress
src/components/             # navbar, course player, admin panel
```

## 🔒 Notes & next steps

- Admin role is set directly in the DB (`Role.ADMIN`). Add more admins with `prisma studio`.
- Add `ADMIN` check on any new write API using `requireAdminJson()` from `src/lib/api-auth.ts`.
- Ideas to extend: notes per lesson, YouTube-embed support, search, certificates, Razorpay payments.
