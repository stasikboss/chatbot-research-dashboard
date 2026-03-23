import { CommStyle } from '@prisma/client'

// All messages in Hebrew for the chatbot
export const MESSAGES = {
  // Step 1: User opens chat (fixed for all conditions)
  userOpening: 'היי, האינטרנט לא עובד',

  // Step 2: Initial bot response
  initialResponse: {
    [CommStyle.FORMAL]: 'פנייתך התקבלה, הנתונים נבדקים.',
    [CommStyle.FRIENDLY]: 'היי, מבאס לשמוע על התקלה. ננסה להבין יחד מה קורה.',
  },

  // Delay message (only for DELAY_WITH_MESSAGE condition)
  delayMessage: {
    [CommStyle.FORMAL]: 'רק רגע בבקשה',
    [CommStyle.FRIENDLY]: 'רק רגע, אנחנו על זה. כבר חוזרים עם תשובה.',
  },

  // Step 3: Diagnostic question
  diagnosticQuestion: {
    [CommStyle.FORMAL]:
      'אודה אם תוכלו לבדוק ולאשר שהחיבורים תקינים וכי כל הנורות דולקות כראוי',
    [CommStyle.FRIENDLY]:
      'היי, אפשר לבדוק שהכול מחובר כמו שצריך ושהנורות דולקות? רק לוודא שהכול תקין 🙂',
  },

  // Step 4: User confirms (button)
  userConfirmation: 'הכל מחובר ותקין',

  // Step 5: Regional issue identified
  regionalIssue: {
    [CommStyle.FORMAL]:
      'שלום,\nזוהתה תקלה אזורית המשפיעה על השירות.\nאנו פועלים לטיפול מהיר בתקלה ונעדכן ברגע שהנושא ייפתר.\nתודה על הסבלנות.',
    [CommStyle.FRIENDLY]:
      'היי,\nיש תקלה אזורית שכרגע משבשת את השירות.\nאנחנו כבר מטפלים בזה, ומקווים לסיים מהר. נעדכן ברגע שזה מאחורינו :)\nתודה על ההבנה!',
  },

  // Step 6: Compensation offer
  compensationOffer: {
    [CommStyle.FORMAL]:
      'בינתיים, לשיפור חוויית השימוש - שודרגה מהירות הגלישה שלך באופן זמני, ללא תוספת תשלום.\nתודה על הסבלנות וההבנה.',
    [CommStyle.FRIENDLY]:
      'כדי שיהיה לך קצת יותר נעים בינתיים - שדרגנו לך את מהירות הגלישה, על חשבוננו 💙\nנעדכן כשנפתור את התקלה. תודה על הסבלנות!',
  },

  // Step 7: Satisfaction question (shown as slider 1-7)
  satisfactionQuestion: 'מה רמת שביעות הרצון שלך מהפיצוי שקיבלת?',

  // Step 8: Issue resolved + negotiation offer
  issueResolved: {
    [CommStyle.FORMAL]: 'התקלה טופלה. השירות זמין כעת. אנו מודים לכם על הסבלנות.',
    [CommStyle.FRIENDLY]: 'שמחים לעדכן שהכל הסתדר - תודה על הסבלנות!',
  },

  negotiationOffer: {
    [CommStyle.FORMAL]:
      'ברצוני להציג בפניך פיצ\'ר חדש לניהול משא ומתן. האם תהיה מעוניין לבחון אותו?',
    [CommStyle.FRIENDLY]: 'יש פיצ\'ר חדש לניהול מו״מ - בא לך לנסות?',
  },

  // Step 9: Negotiation opening (if user said yes)
  negotiationOpening: {
    [CommStyle.FORMAL]:
      'מעולה 😊 אז נלך על מו״מ בנושא שדרוג מהירות הגלישה!\nכמה חודשי שדרוג מהירות גלישה, לדעתך, מגיעים לך? יש לשים לב כי הצעות בלתי סבירות לא תתקבלנה.',
    [CommStyle.FRIENDLY]:
      'המשא ומתן יתקיים בנושא שדרוג מהירות הגלישה.\nכמה חודשי שדרוג מהירות גלישה לדעתך שמגיעים לך? רק שים לב - הצעות מופרזות לא יאושרו 😉',
  },

  // Step 10: Counter offer (X-2 months)
  counterOffer: {
    [CommStyle.FORMAL]: (months: number) =>
      `אנו מציעים להעניק לך שדרוג לתקופה של ${months} חודשים.`,
    [CommStyle.FRIENDLY]: (months: number) => `נשמח להציע לך ${months} חודשים לשדרוג 😊`,
  },

  // Step 11: Closing messages
  acceptedOffer: {
    [CommStyle.FORMAL]:
      'תודה רבה. השדרוג יופעל בהקדם. נשמח לעמוד לשירותך בעתיד.',
    [CommStyle.FRIENDLY]: 'מעולה! השדרוג בדרך אליך. תודה ולהתראות! 😊',
  },

  rejectedOffer: {
    [CommStyle.FORMAL]: 'אנו מצטערים שלא הגענו להסכמות. נשמח לעמוד לשירותך בעתיד.',
    [CommStyle.FRIENDLY]: 'חבל שלא הסתדר הפעם. מקווים לעזור בהזדמנות אחרת! 🙏',
  },

  declinedNegotiation: {
    [CommStyle.FORMAL]: 'תודה על פנייתך. נשמח לעמוד לשירותך בעתיד.',
    [CommStyle.FRIENDLY]: 'סבבה! תודה ולהתראות 😊',
  },
}

// Delay duration in milliseconds (6 seconds)
export const DELAY_DURATION_MS = 6000

// Quick reply button texts
export const QUICK_REPLIES = {
  yes: 'כן',
  no: 'לא',
  accept: 'מקבל/ת',
  reject: 'דוחה/ה',
  confirm: 'הכל מחובר ותקין',
}

// Satisfaction slider labels
export const SATISFACTION_LABELS = {
  min: 'לא מרוצה כלל',
  max: 'מרוצה מאוד',
}

// Helper function to get message based on communication style
export function getMessage(
  messageKey: keyof typeof MESSAGES,
  style: CommStyle,
  ...args: any[]
): string {
  const message = MESSAGES[messageKey]

  if (typeof message === 'object' && style in message) {
    const styleMessage = message[style as keyof typeof message]
    if (typeof styleMessage === 'function') {
      return styleMessage(...args)
    }
    return styleMessage as string
  }

  if (typeof message === 'string') {
    return message
  }

  return ''
}
