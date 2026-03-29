# מבנה הנתונים במסד הנתונים

## מה נשמר על כל משתתף?

### 1. טבלת Participant (פרטי משתתף)

```
✅ id - מזהה ייחודי
✅ name - שם המשתתף (נוסף!)
✅ age - גיל
✅ conditionId - תנאי הניסוי שהוקצה
✅ deviceFingerprint - טביעת אצבע מכשיר (למניעת כפילויות)
✅ status - סטטוס (IN_PROGRESS / COMPLETED / ABANDONED)
✅ currentStep - שלב נוכחי בצ'אט
✅ createdAt - תאריך יצירה
✅ completedAt - תאריך סיום
```

**דוגמה:**
```json
{
  "id": "clxxx123",
  "name": "משה כהן",
  "age": 28,
  "conditionId": 3,
  "status": "COMPLETED",
  "createdAt": "2026-03-29T10:30:00Z",
  "completedAt": "2026-03-29T10:37:00Z"
}
```

---

### 2. טבלת Message (כל ההודעות והתשובות)

**כל תשובה של משתתף נשמרת כהודעה!**

```
✅ id - מזהה ייחודי
✅ participantId - קישור למשתתף
✅ sender - מי שלח (USER / BOT / SYSTEM)
✅ content - תוכן ההודעה/התשובה
✅ stepNumber - מספר השלב (1-15)
✅ timestamp - זמן שליחה
✅ resultData - נתוני תוצאה (משא ומתן)
```

**דוגמאות:**

#### תשובת משתמש - פתיחת שיחה
```json
{
  "id": "msg001",
  "participantId": "clxxx123",
  "sender": "USER",
  "content": "הי, יש לי בעיה עם האינטרנט",
  "stepNumber": 1,
  "timestamp": "2026-03-29T10:30:05Z"
}
```

#### תשובת משתמש - אישור בדיקות
```json
{
  "id": "msg005",
  "participantId": "clxxx123",
  "sender": "USER",
  "content": "הכל מחובר כמו שצריך",
  "stepNumber": 3,
  "timestamp": "2026-03-29T10:31:20Z"
}
```

#### תשובת משתמש - דירוג שביעות רצון
```json
{
  "id": "msg008",
  "participantId": "clxxx123",
  "sender": "USER",
  "content": "שביעות רצון: 5/7",
  "stepNumber": 7,
  "timestamp": "2026-03-29T10:32:40Z"
}
```

#### תשובת משתמש - בקשה במשא ומתן
```json
{
  "id": "msg011",
  "participantId": "clxxx123",
  "sender": "USER",
  "content": "10 חודשים",
  "stepNumber": 10,
  "timestamp": "2026-03-29T10:33:15Z"
}
```

#### תשובת משתמש - החלטה על הצעה
```json
{
  "id": "msg013",
  "participantId": "clxxx123",
  "sender": "USER",
  "content": "מקבל/ת",
  "stepNumber": 12,
  "timestamp": "2026-03-29T10:33:50Z"
}
```

---

### 3. טבלת Result (תוצאות המשא ומתן)

```
✅ participantId - קישור למשתתף
✅ satisfactionScore - דירוג שביעות רצון (1-7)
✅ participatedNegotiation - השתתף במשא ומתן? (כן/לא)
✅ initialOffer - ההצעה הראשונית של המשתמש (X חודשים)
✅ counterOffer - הצעת הנגד הראשונה של הבוט (X-2 חודשים)
✅ secondCounterOffer - הצעת הנגד השנייה של הבוט (X-1 חודשים)
✅ acceptedCounterOffer - קיבל את ההצעה הראשונה?
✅ acceptedSecondOffer - קיבל את ההצעה השנייה?
✅ totalDurationSeconds - משך השיחה בשניות
```

**דוגמה:**
```json
{
  "participantId": "clxxx123",
  "satisfactionScore": 5,
  "participatedNegotiation": true,
  "initialOffer": 10,
  "counterOffer": 8,
  "secondCounterOffer": 9,
  "acceptedCounterOffer": false,
  "acceptedSecondOffer": true,
  "totalDurationSeconds": 420
}
```

---

### 4. טבלת QuestionnaireResponse (שאלון הסיום)

```
✅ participantId - קישור למשתתף
✅ processSatisfaction - שביעות רצון מהתהליך (1-5)
✅ outcomeSatisfaction - שביעות רצון מהתוצאה (1-5)
✅ futureIntention - כוונה עתידית למשא ומתן (1-5)
✅ feedback - משוב טקסטלי (פתוח)
✅ ageGroup - קבוצת גיל ("18-30", "31-40", וכו')
✅ gender - מגדר ("נקבה", "זכר", "מעדיף.ה לא לציין")
✅ createdAt - תאריך מילוי
```

**דוגמה:**
```json
{
  "participantId": "clxxx123",
  "processSatisfaction": 4,
  "outcomeSatisfaction": 5,
  "futureIntention": 4,
  "feedback": "החוויה הייתה טובה, הבוט היה ברור וענייני",
  "ageGroup": "18-30",
  "gender": "זכר",
  "createdAt": "2026-03-29T10:37:00Z"
}
```

---

## איך לצפות בנתונים?

### דרך 1: דאשבורד הניהול

**כניסה:** https://chatbot-dashboard-iota-nine.vercel.app/dashboard/login

**מה אפשר לראות:**
- ✅ רשימת כל המשתתפים (כולל שם וגיל)
- ✅ פירוט סשן מלא של כל משתתף
- ✅ כל ההודעות והתשובות
- ✅ תוצאות המשא ומתן
- ✅ תשובות השאלון
- ✅ סטטיסטיקות כלליות

### דרך 2: ייצוא לExcel

**עמוד ייצוא:** https://chatbot-dashboard-iota-nine.vercel.app/dashboard/export

**קובץ Excel יכלול 4 גיליונות:**

#### גיליון 1: משתתפים
- מזהה, שם, גיל, תנאי, סטטוס, תאריכים

#### גיליון 2: הודעות
- מזהה משתתף, שולח, תוכן, שלב, זמן

#### גיליון 3: תוצאות משא ומתן
- מזהה משתתף, שביעות רצון, הצעות, החלטות, משך

#### גיליון 4: שאלוני סיום
- מזהה משתתף, דירוגים, משוב, דמוגרפיה

---

## סיכום - מה בדיוק נשמר?

### ✅ פרטי משתתף
- שם מלא
- גיל
- תנאי ניסוי
- זמני התחלה וסיום

### ✅ כל התשובות בשיחה
- הודעת הפתיחה
- אישור בדיקות
- דירוג שביעות רצון (1-7)
- החלטה על משא ומתן (כן/לא)
- בקשה ראשונית (X חודשים)
- תגובה להצעה ראשונה (קבל/דחה)
- תגובה להצעה שנייה (קבל/דחה)

### ✅ תוצאות המשא ומתן
- ההצעה הראשונית
- הצעת הנגד הראשונה (X-2)
- הצעת הנגד השנייה (X-1)
- מה התקבל בסוף
- משך השיחה

### ✅ שאלון הסיום
- 3 דירוגים (1-5)
- משוב פתוח
- קבוצת גיל ומגדר

---

## דוגמה מלאה: מסע של משתתף במסד הנתונים

### רישום
```sql
INSERT INTO Participant (name, age, conditionId)
VALUES ('דני לוי', 32, 5);
```

### שיחה - כל תשובה נשמרת
```sql
INSERT INTO Message (participantId, sender, content, stepNumber)
VALUES
  ('clxxx456', 'USER', 'הי, יש בעיה באינטרנט', 1),
  ('clxxx456', 'BOT', 'שלום! אני כאן לעזור...', 2),
  ('clxxx456', 'USER', 'הכל מחובר', 3),
  ('clxxx456', 'USER', 'שביעות רצון: 6/7', 7),
  ('clxxx456', 'USER', '12 חודשים', 10),
  ('clxxx456', 'USER', 'דוחה/ה', 12),
  ('clxxx456', 'USER', 'מקבל/ת', 14);
```

### תוצאה סופית
```sql
INSERT INTO Result (participantId, initialOffer, counterOffer, secondCounterOffer, ...)
VALUES ('clxxx456', 12, 10, 11, true, ...);
```

### שאלון
```sql
INSERT INTO QuestionnaireResponse (participantId, processSatisfaction, ...)
VALUES ('clxxx456', 5, 4, 5, 'חוויה מצוינת', '31-40', 'זכר');
```

---

## 🎯 סיכום

**כל דבר שמשתתף עושה נשמר במסד הנתונים:**
- שם וגיל בטבלת Participant
- כל תשובה/הודעה בטבלת Message
- תוצאות משא ומתן בטבלת Result
- תשובות שאלון בטבלת QuestionnaireResponse

**יש לך גישה מלאה לכל הנתונים דרך:**
- דאשבורד הניהול (צפייה אונליין)
- ייצוא לExcel (הורדת קובץ)
- גישה ישירה למסד הנתונים (Prisma Studio / SQL)
