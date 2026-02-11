# LoveLock Puzzle

Seasonal, emotionally engaging web app where couples upload a photo, it becomes a shuffled puzzle behind a paywall, and the partner solves it to reveal the image + a love message. Nigeria-focused MVP.

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4 + Framer Motion
- Drag & Drop: @dnd-kit/core + @dnd-kit/sortable
- Puzzle rendering: HTML5 Canvas (client-side slicing only)
- Database & Storage: Supabase
- Payments: Paystack (amounts in kobo)
- Email: Resend
- Image compression: Sharp

## Core Flow

1. Sender uploads a couple photo and customizes the puzzle.
2. Image is compressed and stored in Supabase Storage.
3. Puzzle record is created with a shuffled tile order.
4. Sender pays via Paystack.
5. Receiver opens the puzzle, solves it, and reveals the image + message.
6. 24-hour expiration starts on first open.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

## Environment Variables

Create a `.env.local` using `.env.example` as a template:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

PAYSTACK_SECRET_KEY
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

NEXT_PUBLIC_APP_URL
RESEND_API_KEY
CRON_SECRET
```

## Database Setup

Run `supabase-setup.sql` in your Supabase SQL editor. It creates:

- `puzzles` table
- `magic_links` table
- `payments` table (for tracking Paystack references)
- RLS policies and indexes

Also create a storage bucket named `puzzle-images` with:

- Public access
- 5MB file size limit
- Allowed types: JPEG, PNG, WebP

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Lint the codebase
- `npm run test` — Run tests

## QA Checklist (Critical Path)

1. Create flow
   - Upload image (<= 5MB, JPEG/PNG/WebP)
   - Choose difficulty
   - Add message + sender name
   - Optional reveal date
   - Paystack redirect works

2. Payment verification
   - Webhook activates puzzle (primary)
   - Callback activates puzzle if webhook fails (fallback)
   - Idempotent updates (no double activation)

3. Puzzle solving
   - Puzzle opens only when `active`
   - Reveal date gate works
   - First open starts 24-hour timer
   - Tile swapping works and completion is detected
   - Completion modal shows image + message
   - Confetti triggers

4. Expiration
   - Puzzle expires after 24h from first open
   - `expire-puzzles` cron marks opened + expired

5. Dashboard
   - Magic link email sent
   - Auth cookie set
   - Puzzles list displays

## Notes

- No user accounts; email-based magic links only.
- Tile images are never stored server-side; only the full image is stored.
- Prices are hard-coded and stored in kobo.

## Deployment (Vercel + Supabase)

1. Create a Supabase project and run `supabase-setup.sql`.
2. Create storage bucket `puzzle-images` with the limits described above.
3. Configure environment variables in Vercel (see Env Vars section).
4. Set Paystack webhook URL to `https://<your-domain>/api/payment/verify`.
5. Set cron to call `https://<your-domain>/api/cron/expire-puzzles` with `Authorization: Bearer <CRON_SECRET>`.
