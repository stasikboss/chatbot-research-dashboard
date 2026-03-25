import { ChatFlowVisualization } from '@/components/dashboard/ChatFlowVisualization'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'תרשים זרימה | דשבורד מחקר',
  description: 'תצוגה ויזואלית של תרשים זרימת השיחה',
}

export default function FlowPage() {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">תרשים זרימת השיחה</h1>
        <p className="mt-2 text-gray-600">
          תצוגה ויזואלית של 13 שלבי השיחה והסתעפויות המו"מ
        </p>
      </div>

      {/* Legend */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">מקרא צבעים</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-sm">התחלה/סיום</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-sm">פעולת משתמש</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500"></div>
            <span className="text-sm">תגובת בוט</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500"></div>
            <span className="text-sm">החלטה</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm">סיום שיחה</span>
          </div>
        </div>
      </div>

      {/* Flow Visualization */}
      <div className="bg-white p-6 rounded-lg shadow">
        <ChatFlowVisualization />
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 טיפים לשימוש</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• גרור את התרשים כדי להזיז אותו</li>
          <li>• השתמש בגלגלת העכבר או בכפתורי + / - כדי להתקרב/להתרחק</li>
          <li>• המפה הקטנה בפינה מציגה את כל התרשים</li>
          <li>• קווים ירוקים = מעבר חיובי | קווים אדומים = מעבר שלילי</li>
        </ul>
      </div>

      {/* Variations Info */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">וריאציות תנאי המחקר</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-purple-700 mb-2">זמן תגובה (שלב 2)</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• <strong>מיידי:</strong> תגובה מיידית</li>
              <li>• <strong>עיכוב + הודעה:</strong> "רק רגע בבקשה" → תגובה</li>
              <li>• <strong>עיכוב ללא הודעה:</strong> עיכוב 6 שניות → תגובה</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-700 mb-2">סגנון תקשורת</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• <strong>פורמלי:</strong> "פנייתך התקבלה..."</li>
              <li>• <strong>ידידותי:</strong> "היי, מבאס לשמוע..."</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-green-700 mb-2">קבוצות גיל</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• <strong>18-30:</strong> צעירים</li>
              <li>• <strong>50+:</strong> מבוגרים</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-700">
            <strong>סה"כ 12 תנאי מחקר:</strong> 3 זמני תגובה × 2 סגנונות תקשורת × 2 קבוצות גיל
          </p>
        </div>
      </div>
    </div>
  )
}
