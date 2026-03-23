# אפליקציית מחקר - סימולציית צ'אטבוט שירות לקוחות

אפליקציה מלאה למחקר אקדמי המדמה אינטראקציה של שירות לקוחות בסגנון WhatsApp.

## תיאור המחקר

המחקר בודק כיצד מאפיינים שונים של צ'אטבוט משפיעים על חוויית המשא ומתן של משתמשים:
- **זמן תגובה**: מיידי, עיכוב עם הודעה, עיכוב ללא הודעה
- **סגנון תקשורת**: פורמלי, ידידותי
- **קבוצות גיל**: 18-30, 50+

סה"כ 12 תנאי מחקר שונים (3 × 2 × 2).

## טכנולוגיות

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **UI Components**: shadcn/ui
- **Export**: ExcelJS

## דרישות מקדימות

- Node.js 18+ מותקן
- PostgreSQL מותקן ופועל
- npm או yarn

## התקנה

### 1. התקנת תלויות

```bash
npm install
```

### 2. הגדרת מסד נתונים

ערוך את קובץ `.env.local` והגדר את connection string ל-PostgreSQL שלך:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/chatbot_research"
```

### 3. יצירת מסד נתונים

```bash
# צור את הטבלאות
npx prisma migrate dev

# יצור Prisma client
npx prisma generate

# אכלס את מסד הנתונים (12 תנאים + חוקר ברירת מחדל)
npx prisma db seed
```

### 4. הגדרת משתני סביבה

וודא שקובץ `.env.local` מכיל את כל המשתנים הדרושים:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
DEFAULT_RESEARCHER_EMAIL="researcher@example.com"
DEFAULT_RESEARCHER_PASSWORD="password123"
```

**חשוב**: שנה את הסיסמה לאחר ההתחברות הראשונה!

## הרצת האפליקציה

### מצב פיתוח

```bash
npm run dev
```

האפליקציה תהיה זמינה בכתובת: http://localhost:3000

### מצב ייצור

```bash
npm run build
npm start
```

## שימוש באפליקציה

### משתתפים

1. גש ל-http://localhost:3000
2. קרא והסכם לטופס ההסכמה
3. הזן גיל (18-30 או 50+)
4. נהל שיחה עם הצ'אטבוט
5. עקוב אחר ההוראות והשב על השאלות

### דשבורד חוקרים

1. גש ל-http://localhost:3000/dashboard/login
2. התחבר עם:
   - Email: `researcher@example.com`
   - Password: `password123`
3. צפה בסטטיסטיקות, משתתפים ושיחות
4. ייצא נתונים ל-Excel

## תיעוד

- **[תרשים זרימה לתסריט הצ'אטבוט](docs/chatbot-flow.md)** — 13 שלבי השיחה, הסתעפויות (כן/לא למו"מ, מקבל/דוחה) ווריאציות לפי תנאי מחקר.

## מבנה הפרויקט

```
/chatbot-research
├── docs/
│   └── chatbot-flow.md        # תרשים זרימה לתסריט הצ'אט
├── prisma/
│   ├── schema.prisma          # סכמת מסד נתונים
│   └── seed.ts                # אכלוס התנאים
├── src/
│   ├── app/
│   │   ├── page.tsx           # דף consent
│   │   ├── register/          # רישום משתתף
│   │   ├── chat/              # ממשק הצ'אט
│   │   ├── complete/          # דף תודה
│   │   ├── dashboard/         # דשבורד חוקרים
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── chat/              # קומפוננטות צ'אט
│   │   ├── dashboard/         # קומפוננטות דשבורד
│   │   └── ui/                # shadcn/ui components
│   ├── lib/
│   │   ├── conditions.ts      # הודעות בעברית
│   │   ├── chatFlow.ts        # מכונת מצבים
│   │   ├── fingerprint.ts     # זיהוי התקן
│   │   ├── prisma.ts          # Prisma client
│   │   └── utils.ts           # פונקציות עזר
│   └── types/
│       └── index.ts           # הגדרות TypeScript
└── public/                    # קבצים סטטיים
```

## פיצ'רים עיקריים

### צד משתתפים
- ✅ טופס הסכמה מדעת
- ✅ ולידציית גיל (18-30 או 50+)
- ✅ מניעת משתתפים חוזרים (device fingerprinting)
- ✅ 13 שלבי שיחה
- ✅ 3 סוגי עיכוב תגובה
- ✅ סליידר שביעות רצון (1-7)
- ✅ מערכת משא ומתן
- ✅ שמירת מצב ב-localStorage
- ✅ ממשק RTL (עברית)

### צד חוקרים
- ✅ אותנטיקציה מאובטחת
- ✅ סטטיסטיקות כלליות
- ✅ טבלת 12 תנאים
- ✅ רשימת משתתפים
- ✅ תצוגת שיחה מלאה
- ✅ ייצוא Excel עם 3 sheets
- ✅ תפקידים: ADMIN ו-RESEARCHER

### דשבורד ניהול (ADMIN בלבד)
- ✅ סקירה כללית - סטטיסטיקות מאוחדות של חוקרים ומשתתפים
- ✅ ניהול חוקרים - יצירה, עריכה, מחיקה ושינוי תפקידים
- ✅ היסטוריית כניסות - מעקב אחר התחברויות ויציאות
- ✅ לוג פעילות - כל הפעולות שבוצעו במערכת
- ✅ שינוי סיסמאות - החלפת סיסמה לחוקרים
- ✅ סטטיסטיקות מתקדמות - זמני שימוש, חוקרים פעילים
- ✅ אבטחה - הגנה מפני מחיקת אדמין אחרון

## API Endpoints

### Public
- `POST /api/participants` - יצירת משתתף חדש
- `GET /api/participants?participantId=XXX` - קבלת פרטי משתתף
- `POST /api/messages` - שמירת הודעה
- `PATCH /api/messages` - עדכון סטטוס משתתף

### Dashboard (מוגן - Researcher)
- `GET /api/dashboard/stats` - סטטיסטיקות כלליות
- `GET /api/dashboard/participants` - רשימת משתתפים
- `GET /api/export` - ייצוא נתונים ל-Excel

### Admin (מוגן - ADMIN בלבד)
- `GET/POST /api/admin/researchers` - ניהול חוקרים
- `GET/PATCH/DELETE /api/admin/researchers/[id]` - פעולות על חוקר ספציפי
- `POST /api/admin/researchers/[id]/password` - שינוי סיסמה
- `GET /api/admin/sessions` - היסטוריית כניסות
- `GET /api/admin/sessions/stats` - סטטיסטיקות התחברויות
- `GET /api/admin/activity` - לוג פעילות
- `GET /api/admin/activity/recent` - פעילות אחרונה
- `GET /api/admin/stats` - סטטיסטיקות מאוחדות
- `POST /api/auth/logout` - התנתקות ורישום פעילות

## פקודות שימושיות

```bash
# Prisma Studio - UI למסד הנתונים
npx prisma studio

# יצירת migration חדש
npx prisma migrate dev --name description

# איפוס מסד נתונים
npx prisma migrate reset

# בדיקת types
npm run lint
```

## פתרון בעיות

### שגיאת חיבור למסד נתונים
וודא ש-PostgreSQL פועל ו-DATABASE_URL נכון ב-`.env.local`

### שגיאת Prisma Client
הרץ: `npx prisma generate`

### שגיאת NextAuth
וודא ש-NEXTAUTH_SECRET מוגדר ב-`.env.local`

### משתתף לא יכול להיכנס
נקה cookies ו-localStorage או השתמש במצב incognito

## אבטחה

- ✅ הסיסמאות מוצפנות ב-bcrypt
- ✅ Session tokens ב-JWT
- ✅ הגנת middleware על דפי dashboard
- ✅ הגנת role-based על דפי admin
- ✅ Device fingerprinting למניעת כפילויות
- ✅ אנונימיות מלאה למשתתפים
- ✅ רישום כל פעולות האדמין
- ✅ מניעת מחיקה עצמית של אדמין
- ✅ שמירה על לפחות אדמין אחד במערכת

## ייצוא נתונים

קובץ Excel מכיל 3 sheets:
1. **משתתפים**: כל פרטי המשתתפים ותוצאות
2. **הודעות**: כל ההודעות עם timestamps
3. **סיכום**: סטטיסטיקות לפי תנאי

## תמיכה

לשאלות או בעיות, פנה לצוות המחקר.

---

🚀 **בהצלחה במחקר!**
