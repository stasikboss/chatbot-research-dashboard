# הוראות פריסה ל-Vercel

## משתני סביבה שצריך להגדיר ב-Vercel

אחרי שתפרוס ל-Vercel, תצטרך להגדיר את משתני הסביבה הבאים בפאנל של Vercel:

### 1. DATABASE_URL
```
postgresql://neondb_owner:npg_4gZa8DmIReoN@ep-restless-wind-ai2cdu9x-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```
(זה ה-URL הקיים שלך מ-Neon)

### 2. NEXTAUTH_SECRET
```
rzYKkGjLhafWx+zD1druEanSJBR4ILDAjwb3v4mhjrQ=
```
(סיסמה חזקה שיצרנו)

### 3. NEXTAUTH_URL
```
https://your-project-name.vercel.app
```
(תעדכן אחרי שתקבל את כתובת ה-URL מ-Vercel)

### 4. DEFAULT_RESEARCHER_EMAIL
```
researcher@example.com
```

### 5. DEFAULT_RESEARCHER_PASSWORD
```
password123
```
**חשוב: שנה את הסיסמה הזו מיד אחרי ההתחברות הראשונה!**

---

## שלבי הפריסה

### אופציה 1: דרך Vercel CLI (מהיר)

1. **התחבר ל-Vercel:**
   ```bash
   vercel login
   ```

2. **פרוס את הפרויקט:**
   ```bash
   vercel --prod
   ```

3. **הוסף משתני סביבה:**
   ```bash
   vercel env add DATABASE_URL production
   vercel env add NEXTAUTH_SECRET production
   vercel env add NEXTAUTH_URL production
   vercel env add DEFAULT_RESEARCHER_EMAIL production
   vercel env add DEFAULT_RESEARCHER_PASSWORD production
   ```

4. **פרוס שוב כדי שהמשתנים ייכנסו לתוקף:**
   ```bash
   vercel --prod
   ```

### אופציה 2: דרך GitHub (אוטומטי)

1. **צור repository ב-GitHub:**
   - לך ל-https://github.com/new
   - תן שם לפרויקט (למשל: `chatbot-research-dashboard`)
   - לחץ "Create repository"

2. **העלה את הקוד ל-GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

3. **חבר ל-Vercel:**
   - לך ל-https://vercel.com
   - לחץ "Add New..." → "Project"
   - בחר את ה-repository שיצרת
   - Vercel יזהה אוטומטית שזה Next.js

4. **הוסף משתני סביבה:**
   - לחץ על "Environment Variables"
   - הוסף את כל המשתנים שרשומים למעלה
   - לחץ "Deploy"

---

## אחרי הפריסה

### 1. עדכן NEXTAUTH_URL
אחרי שהפריסה הושלמה, תקבל URL כמו:
```
https://your-project-name.vercel.app
```

עדכן את המשתנה `NEXTAUTH_URL` ב-Vercel:
```bash
vercel env rm NEXTAUTH_URL production
vercel env add NEXTAUTH_URL production
# הקלד: https://your-actual-url.vercel.app
vercel --prod
```

### 2. הרץ Seed לייצור משתמש ברירת מחדל
```bash
# התחבר למסד הנתונים ב-production והרץ seed
npx prisma db seed
```

### 3. התחבר למערכת
1. לך ל-`https://your-project-name.vercel.app/dashboard/login`
2. התחבר עם:
   - אימייל: `researcher@example.com`
   - סיסמה: `password123`
3. **שנה את הסיסמה מיד!**

### 4. צור משתמש ADMIN
אחרי ההתחברות הראשונה:
1. לך ל-"חוקרים" (Researchers)
2. ערוך את המשתמש שלך
3. שנה את התפקיד ל-"מנהל" (ADMIN)
4. שנה את הסיסמה

---

## פתרון בעיות

### אם הפריסה נכשלת:
1. בדוק שכל משתני הסביבה מוגדרים נכון
2. בדוק ב-Vercel Logs את השגיאות
3. וודא שה-DATABASE_URL נכון

### אם האתר לא עובד:
1. בדוק ש-NEXTAUTH_URL תואם לכתובת האמיתית
2. וודא שמסד הנתונים נגיש (Neon פתוח לאינטרנט)
3. בדוק שהטבלאות קיימות במסד (הרץ `prisma db push`)

### אם לא ניתן להתחבר:
1. הרץ `npx prisma db seed` ליצירת משתמש ברירת מחדל
2. בדוק שהסיסמה נכונה
3. נסה לאפס את הסיסמה דרך הקוד

---

## עדכונים עתידיים

כשאתה עושה שינויים בקוד:

1. **Commit השינויים:**
   ```bash
   git add .
   git commit -m "תיאור השינוי"
   ```

2. **דרך GitHub (אוטומטי):**
   ```bash
   git push
   ```
   (Vercel יפרוס אוטומטית)

3. **או דרך CLI:**
   ```bash
   vercel --prod
   ```

---

## קישורים שימושיים

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Neon Dashboard:** https://console.neon.tech
- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js Docs:** https://nextjs.org/docs

---

**זכור:** אל תשכח לשנות את סיסמת ברירת המחדל אחרי ההתחברות הראשונה!
