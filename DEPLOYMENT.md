# Vercel Deployment Setup

## Environment Variables Required

Configure these in Vercel Dashboard (Settings → Environment Variables):

### Database
```
DATABASE_URL=postgresql://neondb_owner:npg_4gZa8DmIReoN@ep-restless-wind-ai2cdu9x-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### NextAuth (for Admin/Researcher Dashboard)
```
NEXTAUTH_SECRET=<generate-random-secret>
NEXTAUTH_URL=https://chatbot-dashboard-iota-nine.vercel.app
```

To generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### Default Credentials
```
DEFAULT_RESEARCHER_EMAIL=researcher@example.com
DEFAULT_RESEARCHER_PASSWORD=password123
```

## Deployment Checklist

### 1. Pre-Deployment
- [ ] All environment variables set in Vercel Dashboard
- [ ] Database migrations run: `npx prisma migrate deploy`
- [ ] Database seeded with conditions: `npx prisma db seed`

### 2. Verify Build
- [ ] Run `npm run build` locally - should succeed
- [ ] No critical errors (warnings about admin routes are OK)

### 3. Post-Deployment
- [ ] Visit `/` - Consent page loads
- [ ] Visit `/register` - Registration form appears
- [ ] Complete registration with age (e.g., 25)
- [ ] Chat page loads and initializes
- [ ] Bot sends opening message
- [ ] Complete flow works end-to-end

### 4. Admin Dashboard
- [ ] Visit `/dashboard/login`
- [ ] Login with DEFAULT_RESEARCHER_EMAIL/PASSWORD
- [ ] Dashboard loads with statistics
- [ ] Can view participants, sessions, messages

## Troubleshooting

### Chat Not Opening
1. Check browser console for errors (F12)
2. Verify localStorage has `participantId` and `condition` after registration
3. Check Network tab - ensure `/api/participants` POST succeeds
4. Verify DATABASE_URL is accessible from Vercel (check Neon dashboard)

### API Errors
1. Check Vercel Function Logs
2. Ensure all API routes have `export const dynamic = 'force-dynamic'`
3. Verify database connection string includes `?sslmode=require`

### Build Errors
1. Check Node.js version (should be 18.x or higher)
2. Ensure all dependencies installed: `npm install`
3. Check Prisma client generation: `npx prisma generate`

## Production URL
https://chatbot-dashboard-iota-nine.vercel.app

## Participant Flow
1. `/` - Consent page
2. `/register` - Age registration
3. `/chat` - Interactive chatbot experience
4. `/complete` - Thank you page

## Admin/Researcher Flow
1. `/dashboard/login` - Authentication
2. `/dashboard/admin` - Admin dashboard (ADMIN role only)
3. `/dashboard` - Researcher dashboard
4. `/dashboard/participants` - View all participants
5. `/dashboard/sessions/[id]` - View specific session
6. `/dashboard/export` - Export data to Excel
