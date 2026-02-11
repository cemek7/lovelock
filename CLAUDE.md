# LoveLock Puzzle

Seasonal, emotionally engaging web app where couples upload a photo, it becomes a shuffled puzzle behind a paywall, and the partner solves it to reveal the image + a love message. Nigeria-focused MVP.

## Tech Stack

- **Framework:** Next.js 14+ (App Router, TypeScript, `src/` directory)
- **Styling:** Tailwind CSS v4 + Framer Motion
- **Drag-and-Drop:** @dnd-kit/core + @dnd-kit/sortable
- **Puzzle Rendering:** HTML5 Canvas (client-side tile slicing — no server tile storage)
- **Database & Storage:** Supabase (PostgreSQL + Storage)
- **Payments:** Paystack only (Nigeria-focused, amounts in kobo)
- **Image Processing:** Sharp (server-side compression)
- **Email:** Resend (magic links + confirmation emails)
- **Effects:** canvas-confetti (completion celebration)
- **IDs:** nanoid(12) for URL-friendly tokens

## Architecture Decisions

- **Client-side Canvas slicing:** Server stores only the full image + shuffled index array. Canvas `drawImage` clips tiles at render time.
- **Swap-based puzzle:** Any two tiles can be swapped (not sliding). Works with dnd-kit sortable.
- **Dual payment verification:** Webhook is canonical, callback is fallback. Idempotent updates prevent double-activation.
- **No accounts, email-based identity:** Sender provides email (needed for Paystack). Magic links for dashboard.
- **Sender pays, receiver gets free experience.**
- **Expire on first open + 24h:** Link lives indefinitely after payment. 24h countdown starts only when receiver opens it.
- **Optional reveal date:** Gates access until a specific date/time. Does NOT start the 24h timer.

## Status Flow

`pending_payment` → `active` (paid) → `opened` (receiver visited, 24h countdown) → `completed` or `expired`

## Pricing (in kobo)

- Easy (3x3): 100000 (₦1,000)
- Medium (4x4): 200000 (₦2,000)
- Hard (5x5): 350000 (₦3,500)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── upload/route.ts
│   │   ├── puzzles/route.ts
│   │   ├── puzzles/[token]/route.ts
│   │   ├── puzzles/[token]/open/route.ts
│   │   ├── puzzles/mine/route.ts
│   │   ├── payment/initialize/route.ts
│   │   ├── payment/verify/route.ts
│   │   ├── payment/callback/route.ts
│   │   ├── auth/magic-link/route.ts
│   │   ├── auth/verify/route.ts
│   │   └── cron/expire-puzzles/route.ts
│   ├── create/page.tsx, success/page.tsx
│   ├── puzzle/[token]/page.tsx
│   ├── my-puzzles/page.tsx
│   └── layout.tsx, page.tsx, globals.css
├── components/
│   ├── landing/    # Hero, HowItWorks
│   ├── create/     # ImageUploader, DifficultySelector, MessageInput, RevealDatePicker
│   ├── puzzle/     # PuzzlePageClient, PuzzleBoard, PuzzleTile, PuzzleLocked, PuzzleComplete, ProgressBar
│   ├── dashboard/  # PuzzleCard, EmailForm
│   └── ui/         # Button, Card, LoadingSpinner
├── lib/
│   ├── supabase.ts, supabase-server.ts, paystack.ts, puzzle.ts, email.ts, utils.ts
└── types/index.ts
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
PAYSTACK_SECRET_KEY, NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
NEXT_PUBLIC_APP_URL
RESEND_API_KEY
CRON_SECRET
```

## Commands

- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — ESLint
