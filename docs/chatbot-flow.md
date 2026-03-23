# תרשים זרימה לתסריט הצ'אטבוט

תרשים זה מתאר את זרימת השיחה לפי `ChatStep` ב-[../src/lib/chatFlow.ts](../src/lib/chatFlow.ts) ו-[../src/lib/conditions.ts](../src/lib/conditions.ts).

## תרשים זרימה (Mermaid)

```mermaid
flowchart TD
  Start([התחלה]) --> OPENING
  OPENING["1. OPENING<br/>משתמש: 'היי, האינטרנט לא עובד'"]
  OPENING --> INITIAL_RESPONSE

  INITIAL_RESPONSE["2. INITIAL_RESPONSE<br/>בוט: תגובה ראשונית<br/>+ וריאציות עיכוב לפי תנאי"]
  INITIAL_RESPONSE --> DIAGNOSTIC

  DIAGNOSTIC["3. DIAGNOSTIC<br/>בוט: שאלת אבחון חיבורים/נורות"]
  DIAGNOSTIC --> USER_CONFIRM

  USER_CONFIRM["4. USER_CONFIRM<br/>משתמש: 'הכל מחובר ותקין'"]
  USER_CONFIRM --> REGIONAL_ISSUE

  REGIONAL_ISSUE["5. REGIONAL_ISSUE<br/>בוט: זוהתה תקלה אזורית"]
  REGIONAL_ISSUE --> COMPENSATION

  COMPENSATION["6. COMPENSATION<br/>בוט: הצעת פיצוי שדרוג גלישה"]
  COMPENSATION --> SATISFACTION

  SATISFACTION["7. SATISFACTION<br/>משתמש: סליידר שביעות רצון 1-7"]
  SATISFACTION --> RESOLVED

  RESOLVED["8. RESOLVED<br/>בוט: התקלה טופלה + הצעת מו\"מ"]
  RESOLVED --> NEGOTIATION_OFFER

  NEGOTIATION_OFFER["9. NEGOTIATION_OFFER<br/>משתמש: כן / לא למו\"מ"]
  NEGOTIATION_OFFER -->|לא| CLOSING_DECLINED["13. CLOSING<br/>בוט: תודה על פנייתך"]
  NEGOTIATION_OFFER -->|כן| NEGOTIATION_ASK

  NEGOTIATION_ASK["10. NEGOTIATION_ASK<br/>בוט: כמה חודשי שדרוג?<br/>משתמש: 1-12"]
  NEGOTIATION_ASK --> COUNTER_OFFER

  COUNTER_OFFER["11. COUNTER_OFFER<br/>בוט: הצעת נגד X-2 חודשים"]
  COUNTER_OFFER --> FINAL_DECISION

  FINAL_DECISION["12. FINAL_DECISION<br/>משתמש: מקבל/ת או דוחה/ה"]
  FINAL_DECISION -->|מקבל/ת| CLOSING_ACCEPT["13. CLOSING<br/>בוט: השדרוג יופעל"]
  FINAL_DECISION -->|דוחה/ה| CLOSING_REJECT["13. CLOSING<br/>בוט: חבל שלא הסתדר"]

  CLOSING_DECLINED --> End([סיום])
  CLOSING_ACCEPT --> End
  CLOSING_REJECT --> End
```

## סיכום שלבים

| שלב | שם ב-enum         | תיאור קצר                                        |
| --- | ----------------- | ------------------------------------------------ |
| 1   | OPENING           | משתמש שולח הודעת פתיחה קבועה                     |
| 2   | INITIAL_RESPONSE  | בוט מגיב (מיידי / עיכוב+הודעה / עיכוב בלי הודעה) |
| 3   | DIAGNOSTIC        | בוט שואל על חיבורים ונורות                       |
| 4   | USER_CONFIRM      | משתמש לוחץ "הכל מחובר ותקין"                     |
| 5   | REGIONAL_ISSUE    | בוט מסביר על תקלה אזורית                         |
| 6   | COMPENSATION      | בוט מציע פיצוי שדרוג גלישה                       |
| 7   | SATISFACTION      | משתמש מדרג שביעות רצון 1–7                       |
| 8   | RESOLVED          | בוט: התקלה טופלה + הזמנה למו"מ                   |
| 9   | NEGOTIATION_OFFER | משתמש בוחר כן/לא למו"מ                           |
| 10  | NEGOTIATION_ASK   | בוט שואל כמה חודשים; משתמש בוחר 1–12             |
| 11  | COUNTER_OFFER     | בוט מציע הצעת נגד (הצעה-2)                       |
| 12  | FINAL_DECISION    | משתמש מקבל או דוחה את ההצעה                      |
| 13  | CLOSING           | הודעת סיום (3 וריאציות)                          |

## וריאציות לפי תנאי מחקר

- **שלב 2 (INITIAL_RESPONSE)**: תלוי ב-`responseTime` (IMMEDIATE / DELAY_WITH_MESSAGE / DELAY_NO_MESSAGE).
- **טקסטים**: פורמלי vs ידידותי לפי `communicationStyle` ב-[../src/lib/conditions.ts](../src/lib/conditions.ts).
