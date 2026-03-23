import { PrismaClient, ResponseTime, CommStyle, AgeGroup, Role, MessageSender } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create 12 conditions (3 responseTime × 2 commStyle × 2 ageGroup)
  const responseTimes = [
    ResponseTime.IMMEDIATE,
    ResponseTime.DELAY_WITH_MESSAGE,
    ResponseTime.DELAY_NO_MESSAGE,
  ]
  const commStyles = [CommStyle.FORMAL, CommStyle.FRIENDLY]
  const ageGroups = [AgeGroup.YOUNG, AgeGroup.OLD]

  let conditionCount = 0

  for (const responseTime of responseTimes) {
    for (const communicationStyle of commStyles) {
      for (const ageGroup of ageGroups) {
        await prisma.condition.upsert({
          where: {
            responseTime_communicationStyle_ageGroup: {
              responseTime,
              communicationStyle,
              ageGroup,
            },
          },
          update: {},
          create: {
            responseTime,
            communicationStyle,
            ageGroup,
            participantCount: 0,
          },
        })
        conditionCount++
        console.log(
          `Created condition ${conditionCount}: ${responseTime} + ${communicationStyle} + ${ageGroup}`
        )
      }
    }
  }

  console.log(`✓ Created ${conditionCount} conditions`)

  // Seed chat messages from existing message structure
  const chatMessages = [
    {
      stepNumber: 1,
      messageKey: 'userOpening',
      sender: MessageSender.USER,
      isFixed: true,
      fixedContent: 'היי, האינטרנט לא עובד',
      description: 'הודעת פתיחה של המשתמש',
      order: 0,
    },
    {
      stepNumber: 2,
      messageKey: 'initialResponse',
      sender: MessageSender.BOT,
      isFixed: false,
      formalContent: 'פנייתך התקבלה, הנתונים נבדקים.',
      friendlyContent: 'היי, מבאס לשמוע על התקלה. ננסה להבין יחד מה קורה.',
      description: 'תגובה ראשונית של הבוט',
      order: 0,
    },
    {
      stepNumber: 3,
      messageKey: 'delayMessage',
      sender: MessageSender.BOT,
      isFixed: false,
      formalContent: 'רק רגע בבקשה',
      friendlyContent: 'רק רגע, אנחנו על זה. כבר חוזרים עם תשובה.',
      description: 'הודעת עיכוב (רק לתנאי DELAY_WITH_MESSAGE)',
      order: 0,
    },
    {
      stepNumber: 4,
      messageKey: 'diagnosticQuestion',
      sender: MessageSender.BOT,
      isFixed: false,
      formalContent: 'אודה אם תוכלו לבדוק ולאשר שהחיבורים תקינים וכי כל הנורות דולקות כראוי',
      friendlyContent: 'היי, אפשר לבדוק שהכול מחובר כמו שצריך ושהנורות דולקות? רק לוודא שהכול תקין 🙂',
      description: 'שאלת אבחון',
      order: 0,
    },
    {
      stepNumber: 5,
      messageKey: 'userConfirmation',
      sender: MessageSender.USER,
      isFixed: true,
      fixedContent: 'הכל מחובר ותקין',
      description: 'אישור המשתמש שהכל תקין',
      order: 0,
    },
    {
      stepNumber: 6,
      messageKey: 'regionalIssue',
      sender: MessageSender.BOT,
      isFixed: false,
      formalContent: 'שלום,\nזוהתה תקלה אזורית המשפיעה על השירות.\nאנו פועלים לטיפול מהיר בתקלה ונעדכן ברגע שהנושא ייפתר.\nתודה על הסבלנות.',
      friendlyContent: 'היי,\nיש תקלה אזורית שכרגע משבשת את השירות.\nאנחנו כבר מטפלים בזה, ומקווים לסיים מהר. נעדכן ברגע שזה מאחורינו :)\nתודה על ההבנה!',
      description: 'זיהוי תקלה אזורית',
      order: 0,
    },
    {
      stepNumber: 7,
      messageKey: 'compensationOffer',
      sender: MessageSender.BOT,
      isFixed: false,
      formalContent: 'בינתיים, לשיפור חוויית השימוש - שודרגה מהירות הגלישה שלך באופן זמני, ללא תוספת תשלום.\nתודה על הסבלנות וההבנה.',
      friendlyContent: 'כדי שיהיה לך קצת יותר נעים בינתיים - שדרגנו לך את מהירות הגלישה, על חשבוננו 💙\nנעדכן כשנפתור את התקלה. תודה על הסבלנות!',
      description: 'הצעת פיצוי - שדרוג מהירות זמני',
      order: 0,
    },
    {
      stepNumber: 8,
      messageKey: 'satisfactionQuestion',
      sender: MessageSender.BOT,
      isFixed: true,
      fixedContent: 'מה רמת שביעות הרצון שלך מהפיצוי שקיבלת?',
      description: 'שאלת שביעות רצון (סליידר 1-7)',
      order: 0,
    },
    {
      stepNumber: 9,
      messageKey: 'issueResolved',
      sender: MessageSender.BOT,
      isFixed: false,
      formalContent: 'התקלה טופלה. השירות זמין כעת. אנו מודים לכם על הסבלנות.',
      friendlyContent: 'שמחים לעדכן שהכל הסתדר - תודה על הסבלנות!',
      description: 'הודעה על פתרון התקלה',
      order: 0,
    },
    {
      stepNumber: 10,
      messageKey: 'negotiationOffer',
      sender: MessageSender.BOT,
      isFixed: false,
      formalContent: 'ברצוני להציג בפניך פיצ\'ר חדש לניהול משא ומתן. האם תהיה מעוניין לבחון אותו?',
      friendlyContent: 'יש פיצ\'ר חדש לניהול מו״מ - בא לך לנסות?',
      description: 'הצעת פיצ\'ר משא ומתן',
      order: 0,
    },
    {
      stepNumber: 11,
      messageKey: 'negotiationOpening',
      sender: MessageSender.BOT,
      isFixed: false,
      formalContent: 'מעולה 😊 אז נלך על מו״מ בנושא שדרוג מהירות הגלישה!\nכמה חודשי שדרוג מהירות גלישה, לדעתך, מגיעים לך? יש לשים לב כי הצעות בלתי סבירות לא תתקבלנה.',
      friendlyContent: 'המשא ומתן יתקיים בנושא שדרוג מהירות הגלישה.\nכמה חודשי שדרוג מהירות גלישה לדעתך שמגיעים לך? רק שים לב - הצעות מופרזות לא יאושרו 😉',
      description: 'פתיחת משא ומתן - בקשת הצעה',
      order: 0,
    },
    {
      stepNumber: 12,
      messageKey: 'counterOffer',
      sender: MessageSender.BOT,
      isFixed: false,
      formalContent: 'אנו מציעים להעניק לך שדרוג לתקופה של {months} חודשים.',
      friendlyContent: 'נשמח להציע לך {months} חודשים לשדרוג 😊',
      description: 'הצעת נגד (X-2 חודשים) - יש להחליף {months} במספר בפועל',
      order: 0,
    },
    {
      stepNumber: 13,
      messageKey: 'acceptedOffer',
      sender: MessageSender.BOT,
      isFixed: false,
      formalContent: 'תודה רבה. השדרוג יופעל בהקדם. נשמח לעמוד לשירותך בעתיד.',
      friendlyContent: 'מעולה! השדרוג בדרך אליך. תודה ולהתראות! 😊',
      description: 'הודעת סגירה - הצעה התקבלה',
      order: 0,
    },
    {
      stepNumber: 13,
      messageKey: 'rejectedOffer',
      sender: MessageSender.BOT,
      isFixed: false,
      formalContent: 'אנו מצטערים שלא הגענו להסכמות. נשמח לעמוד לשירותך בעתיד.',
      friendlyContent: 'חבל שלא הסתדר הפעם. מקווים לעזור בהזדמנות אחרת! 🙏',
      description: 'הודעת סגירה - הצעה נדחתה',
      order: 1,
    },
    {
      stepNumber: 13,
      messageKey: 'declinedNegotiation',
      sender: MessageSender.BOT,
      isFixed: false,
      formalContent: 'תודה על פנייתך. נשמח לעמוד לשירותך בעתיד.',
      friendlyContent: 'סבבה! תודה ולהתראות 😊',
      description: 'הודעת סגירה - משא ומתן נדחה',
      order: 2,
    },
  ]

  let messageCount = 0
  for (const message of chatMessages) {
    await prisma.chatMessage.upsert({
      where: { messageKey: message.messageKey },
      update: {},
      create: message,
    })
    messageCount++
    console.log(`Created message ${messageCount}: ${message.messageKey} (Step ${message.stepNumber})`)
  }

  console.log(`✓ Created ${messageCount} chat messages`)

  // Create default researcher account
  const defaultEmail = process.env.DEFAULT_RESEARCHER_EMAIL || 'researcher@example.com'
  const defaultPassword = process.env.DEFAULT_RESEARCHER_PASSWORD || 'password123'
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  await prisma.researcher.upsert({
    where: { email: defaultEmail },
    update: {},
    create: {
      email: defaultEmail,
      name: 'Default Researcher',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  })

  console.log(`✓ Created default researcher: ${defaultEmail}`)
  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
