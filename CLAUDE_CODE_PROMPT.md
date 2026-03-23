# Claude Code Prompt - אפליקציית מחקר סימולציית צ'אטבוט

## Project Overview

Build a full-stack research application that simulates a WhatsApp-style customer service chatbot interaction. The app is designed for academic research studying how different chatbot characteristics affect user negotiation experience.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication** (Dashboard only): NextAuth.js
- **Styling**: Tailwind CSS + shadcn/ui components
- **Deployment**: Vercel-ready

## Project Structure

```
/chatbot-research
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing/consent page
│   │   ├── register/page.tsx           # Age input + instructions
│   │   ├── chat/page.tsx               # Main chat interface
│   │   ├── complete/page.tsx           # Thank you page
│   │   ├── dashboard/
│   │   │   ├── page.tsx                # Overview stats
│   │   │   ├── participants/page.tsx   # Participants list
│   │   │   ├── sessions/[id]/page.tsx  # View specific chat
│   │   │   └── export/page.tsx         # Excel export
│   │   ├── api/
│   │   │   ├── participants/route.ts
│   │   │   ├── messages/route.ts
│   │   │   ├── conditions/route.ts
│   │   │   └── export/route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── TypingIndicator.tsx
│   │   │   ├── QuickReplies.tsx
│   │   │   ├── SatisfactionSlider.tsx
│   │   │   └── MonthSelector.tsx
│   │   ├── ui/                         # shadcn components
│   │   └── dashboard/
│   │       ├── StatsCards.tsx
│   │       ├── ConditionTable.tsx
│   │       └── ChatViewer.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── conditions.ts               # Condition logic & messages
│   │   ├── chatFlow.ts                 # Chat state machine
│   │   └── fingerprint.ts              # Device fingerprinting
│   └── types/
│       └── index.ts
├── public/
│   └── whatsapp-bg.png
└── package.json
```

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Researcher {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String   // hashed
  role      Role     @default(RESEARCHER)
  createdAt DateTime @default(now())
}

enum Role {
  ADMIN
  RESEARCHER
}

model Condition {
  id                 Int           @id @default(autoincrement())
  responseTime       ResponseTime
  communicationStyle CommStyle
  ageGroup           AgeGroup
  participantCount   Int           @default(0)
  participants       Participant[]
}

enum ResponseTime {
  IMMEDIATE
  DELAY_WITH_MESSAGE
  DELAY_NO_MESSAGE
}

enum CommStyle {
  FORMAL
  FRIENDLY
}

enum AgeGroup {
  YOUNG    // 18-30
  OLD      // 50+
}

model Participant {
  id              String    @id @default(cuid())
  age             Int
  conditionId     Int
  condition       Condition @relation(fields: [conditionId], references: [id])
  deviceFingerprint String
  status          Status    @default(IN_PROGRESS)
  currentStep     Int       @default(1)
  createdAt       DateTime  @default(now())
  completedAt     DateTime?
  messages        Message[]
  result          Result?
}

enum Status {
  IN_PROGRESS
  COMPLETED
  ABANDONED
}

model Message {
  id            String      @id @default(cuid())
  participantId String
  participant   Participant @relation(fields: [participantId], references: [id])
  sender        Sender
  content       String
  stepNumber    Int
  timestamp     DateTime    @default(now())
}

enum Sender {
  USER
  BOT
}

model Result {
  id                      String      @id @default(cuid())
  participantId           String      @unique
  participant             Participant @relation(fields: [participantId], references: [id])
  satisfactionScore       Int?        // 1-7
  participatedNegotiation Boolean     @default(false)
  initialOffer            Int?        // 1-12
  acceptedCounterOffer    Boolean?
  totalDurationSeconds    Int
}
```

## Condition Messages (Hebrew)

Create `/src/lib/conditions.ts` with all messages for each condition:

```typescript
export const MESSAGES = {
  // Step 1: User opens chat (fixed for all)
  userOpening: "היי, האינטרנט לא עובד",

  // Step 2: Initial bot response
  initialResponse: {
    FORMAL: "פנייתך התקבלה, הנתונים נבדקים.",
    FRIENDLY: "היי, מבאס לשמוע על התקלה. ננסה להבין יחד מה קורה."
  },

  // Delay message (only for DELAY_WITH_MESSAGE)
  delayMessage: {
    FORMAL: "רק רגע בבקשה",
    FRIENDLY: "רק רגע, אנחנו על זה. כבר חוזרים עם תשובה."
  },

  // Step 3: Diagnostic question
  diagnosticQuestion: {
    FORMAL: "אודה אם תוכלו לבדוק ולאשר שהחיבורים תקינים וכי כל הנורות דולקות כראוי",
    FRIENDLY: "היי, אפשר לבדוק שהכול מחובר כמו שצריך ושהנורות דולקות? רק לוודא שהכול תקין 🙂"
  },

  // Step 4: User confirms (button)
  userConfirmation: "הכל מחובר ותקין",

  // Step 5: Regional issue identified
  regionalIssue: {
    FORMAL: "שלום,\nזוהתה תקלה אזורית המשפיעה על השירות.\nאנו פועלים לטיפול מהיר בתקלה ונעדכן ברגע שהנושא ייפתר.\nתודה על הסבלנות.",
    FRIENDLY: "היי,\nיש תקלה אזורית שכרגע משבשת את השירות.\nאנחנו כבר מטפלים בזה, ומקווים לסיים מהר. נעדכן ברגע שזה מאחורינו :)\nתודה על ההבנה!"
  },

  // Step 6: Compensation offer
  compensationOffer: {
    FORMAL: "בינתיים, לשיפור חוויית השימוש - שודרגה מהירות הגלישה שלך באופן זמני, ללא תוספת תשלום.\nתודה על הסבלנות וההבנה.",
    FRIENDLY: "כדי שיהיה לך קצת יותר נעים בינתיים - שדרגנו לך את מהירות הגלישה, על חשבוננו 💙\nנעדכן כשנפתור את התקלה. תודה על הסבלנות!"
  },

  // Step 7: Satisfaction question (shown as slider 1-7)
  satisfactionQuestion: "מה רמת שביעות הרצון שלך מהפיצוי שקיבלת?",

  // Step 8: Issue resolved + negotiation offer
  issueResolved: {
    FORMAL: "התקלה טופלה. השירות זמין כעת. אנו מודים לכם על הסבלנות.",
    FRIENDLY: "שמחים לעדכן שהכל הסתדר - תודה על הסבלנות!"
  },
  negotiationOffer: {
    FORMAL: "ברצוני להציג בפניך פיצ'ר חדש לניהול משא ומתן. האם תהיה מעוניין לבחון אותו?",
    FRIENDLY: "יש פיצ'ר חדש לניהול מו״מ - בא לך לנסות?"
  },

  // Step 9: Negotiation opening (if user said yes)
  negotiationOpening: {
    FORMAL: "מעולה 😊 אז נלך על מו״מ בנושא שדרוג מהירות הגלישה!\nכמה חודשי שדרוג מהירות גלישה, לדעתך, מגיעים לך? יש לשים לב כי הצעות בלתי סבירות לא תתקבלנה.",
    FRIENDLY: "המשא ומתן יתקיים בנושא שדרוג מהירות הגלישה.\nכמה חודשי שדרוג מהירות גלישה לדעתך שמגיעים לך? רק שים לב - הצעות מופרזות לא יאושרו 😉"
  },

  // Step 10: Counter offer (X-2)
  counterOffer: {
    FORMAL: (months: number) => `אנו מציעים להעניק לך שדרוג לתקופה של ${months} חודשים.`,
    FRIENDLY: (months: number) => `נשמח להציע לך ${months} חודשים לשדרוג 😊`
  },

  // Step 11: Closing messages
  acceptedOffer: {
    FORMAL: "תודה רבה. השדרוג יופעל בהקדם. נשמח לעמוד לשירותך בעתיד.",
    FRIENDLY: "מעולה! השדרוג בדרך אליך. תודה ולהתראות! 😊"
  },
  rejectedOffer: {
    FORMAL: "אנו מצטערים שלא הגענו להסכמות. נשמח לעמוד לשירותך בעתיד.",
    FRIENDLY: "חבל שלא הסתדר הפעם. מקווים לעזור בהזדמנות אחרת! 🙏"
  },
  declinedNegotiation: {
    FORMAL: "תודה על פנייתך. נשמח לעמוד לשירותך בעתיד.",
    FRIENDLY: "סבבה! תודה ולהתראות 😊"
  }
};

export const DELAY_DURATION_MS = 6000; // 6 seconds
```

## Chat Flow State Machine

Create `/src/lib/chatFlow.ts`:

```typescript
export enum ChatStep {
  OPENING = 1,
  INITIAL_RESPONSE = 2,
  DIAGNOSTIC = 3,
  USER_CONFIRM = 4,
  REGIONAL_ISSUE = 5,
  COMPENSATION = 6,
  SATISFACTION = 7,
  RESOLVED = 8,
  NEGOTIATION_OFFER = 9,
  NEGOTIATION_ASK = 10,
  COUNTER_OFFER = 11,
  FINAL_DECISION = 12,
  CLOSING = 13
}

// State machine logic for advancing through steps
// Handle delays based on condition
// Store all messages with timestamps
```

## UI Components

### ChatContainer.tsx
- WhatsApp-style interface
- RTL support (dir="rtl")
- Background: WhatsApp pattern
- Header: Company logo + "שירות לקוחות"
- Messages area with auto-scroll
- Input area (disabled - user only clicks buttons)

### MessageBubble.tsx
- User messages: green bubble, right aligned
- Bot messages: white bubble, left aligned
- Timestamps on each message
- Blue double-check marks

### TypingIndicator.tsx
- Three bouncing dots animation
- Shows during delay periods
- Text: "מקליד..."

### QuickReplies.tsx
- Button options for user responses
- Used for: confirmation, yes/no, accept/reject

### SatisfactionSlider.tsx
- Slider 1-7 with labels
- 1 = "לא מרוצה כלל", 7 = "מרוצה מאוד"

### MonthSelector.tsx
- Grid of buttons 1-12
- For negotiation month selection

## Dashboard Features

### Overview Page
- Total participants count
- Completed vs abandoned
- Breakdown by condition (12 conditions)
- Real-time updates

### Participants List
- Sortable/filterable table
- Columns: ID, Age, Condition, Status, Duration, Created
- Click to view full chat

### Chat Viewer
- Full chat history replay
- Show all timestamps
- Highlight user choices

### Export
- Button to download Excel
- Sheet 1: Raw participant data
- Sheet 2: All messages
- Sheet 3: Summary by condition

## Critical Implementation Details

### Device Fingerprinting
Use FingerprintJS or similar to prevent repeat participants:
```typescript
// On registration, check if fingerprint exists
// If exists, show "כבר השתתפת בניסוי זה" and block
```

### Condition Assignment
```typescript
// Balanced randomization across 6 combinations (3 responseTime × 2 commStyle)
// Age group determined by user input
// Assign to condition with lowest participant count
```

### Age Validation
```typescript
// Accept only: 18-30 OR 50+
// Ages 31-49: Show message "המחקר מיועד לגילאי 18-30 או 50+"
// Under 18: Show "יש להיות מעל גיל 18"
```

### Delay Logic
```typescript
// IMMEDIATE: No delay
// DELAY_WITH_MESSAGE: Show delay message → wait 6s → show actual response
// DELAY_NO_MESSAGE: Show typing indicator → wait 6s → show response
```

### Session Persistence
- Store session in localStorage
- Allow resume if browser closed
- Mark as ABANDONED after 30 min inactivity

## Consent Form Text (Hebrew)

```
הסכמה מדעת להשתתפות במחקר

מטרת המחקר: בחינת חוויית משתמש בשירות לקוחות דיגיטלי

במסגרת המחקר תתבקש/י לנהל שיחה עם מערכת שירות לקוחות בנושא תקלת אינטרנט. 
השיחה אורכת כ-5 דקות.

פרטיות: המחקר אנונימי לחלוטין. לא נאסף שם, טלפון או כתובת מייל.

השתתפותך במחקר הינה וולונטרית ובאפשרותך להפסיק בכל עת.

☐ קראתי והבנתי את המידע לעיל ואני מסכים/ה להשתתף במחקר
```

## Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

## Commands to Run

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed conditions (12 conditions)
npx prisma db seed

# Run development server
npm run dev
```

## Seed Script

Create `prisma/seed.ts` to create all 12 conditions:
```typescript
// Create all combinations of:
// ResponseTime: IMMEDIATE, DELAY_WITH_MESSAGE, DELAY_NO_MESSAGE
// CommStyle: FORMAL, FRIENDLY
// AgeGroup: YOUNG, OLD
// Total: 3 × 2 × 2 = 12 conditions
```

## Testing Checklist

- [ ] Consent form blocks without agreement
- [ ] Age validation works (only 18-30 or 50+)
- [ ] Repeat participants are blocked
- [ ] All 12 conditions have correct messages
- [ ] Delays work correctly (6 seconds)
- [ ] Satisfaction slider saves value
- [ ] Negotiation flow: offer → counter (X-2) → accept/reject
- [ ] All messages saved with timestamps
- [ ] Dashboard shows real-time stats
- [ ] Excel export includes all data
- [ ] Mobile responsive
- [ ] RTL displays correctly

---

## Start Building

Begin by:
1. Initialize Next.js project with TypeScript
2. Set up Prisma with PostgreSQL
3. Create the database schema
4. Build the chat UI components
5. Implement the chat flow state machine
6. Add the dashboard
7. Test all conditions

בהצלחה! 🚀
