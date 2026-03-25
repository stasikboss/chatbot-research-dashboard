'use client'

import React, { useCallback } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { ChatStep } from '@/types'

// Define node types and their styling
const nodeTypes = {
  start: { color: '#10b981', borderColor: '#059669' },
  user: { color: '#3b82f6', borderColor: '#2563eb' },
  bot: { color: '#8b5cf6', borderColor: '#7c3aed' },
  decision: { color: '#f59e0b', borderColor: '#d97706' },
  end: { color: '#ef4444', borderColor: '#dc2626' },
}

// Initial nodes configuration
const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'input',
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-sm">התחלה</div>
        </div>
      )
    },
    position: { x: 400, y: 0 },
    style: {
      background: nodeTypes.start.color,
      color: 'white',
      border: `2px solid ${nodeTypes.start.borderColor}`,
      borderRadius: '8px',
      padding: '10px',
      width: 180,
    },
  },
  {
    id: '1',
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-xs mb-1">שלב 1: OPENING</div>
          <div className="text-xs">משתמש: "היי, האינטרנט לא עובד"</div>
        </div>
      )
    },
    position: { x: 350, y: 100 },
    style: {
      background: nodeTypes.user.color,
      color: 'white',
      border: `2px solid ${nodeTypes.user.borderColor}`,
      borderRadius: '8px',
      padding: '12px',
      width: 280,
    },
  },
  {
    id: '2',
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-xs mb-1">שלב 2: INITIAL_RESPONSE</div>
          <div className="text-xs">בוט: תגובה ראשונית</div>
          <div className="text-[10px] mt-1 opacity-80">וריאציות: מיידי / עיכוב+הודעה / עיכוב</div>
        </div>
      )
    },
    position: { x: 340, y: 220 },
    style: {
      background: nodeTypes.bot.color,
      color: 'white',
      border: `2px solid ${nodeTypes.bot.borderColor}`,
      borderRadius: '8px',
      padding: '12px',
      width: 300,
    },
  },
  {
    id: '3',
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-xs mb-1">שלב 3: DIAGNOSTIC</div>
          <div className="text-xs">בוט: שאלת אבחון חיבורים/נורות</div>
        </div>
      )
    },
    position: { x: 350, y: 360 },
    style: {
      background: nodeTypes.bot.color,
      color: 'white',
      border: `2px solid ${nodeTypes.bot.borderColor}`,
      borderRadius: '8px',
      padding: '12px',
      width: 280,
    },
  },
  {
    id: '4',
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-xs mb-1">שלב 4: USER_CONFIRM</div>
          <div className="text-xs">משתמש: "הכל מחובר ותקין"</div>
        </div>
      )
    },
    position: { x: 350, y: 480 },
    style: {
      background: nodeTypes.user.color,
      color: 'white',
      border: `2px solid ${nodeTypes.user.borderColor}`,
      borderRadius: '8px',
      padding: '12px',
      width: 280,
    },
  },
  {
    id: '5',
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-xs mb-1">שלב 5: REGIONAL_ISSUE</div>
          <div className="text-xs">בוט: זוהתה תקלה אזורית</div>
        </div>
      )
    },
    position: { x: 350, y: 600 },
    style: {
      background: nodeTypes.bot.color,
      color: 'white',
      border: `2px solid ${nodeTypes.bot.borderColor}`,
      borderRadius: '8px',
      padding: '12px',
      width: 280,
    },
  },
  {
    id: '6',
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-xs mb-1">שלב 6: COMPENSATION</div>
          <div className="text-xs">בוט: הצעת פיצוי שדרוג גלישה</div>
        </div>
      )
    },
    position: { x: 350, y: 720 },
    style: {
      background: nodeTypes.bot.color,
      color: 'white',
      border: `2px solid ${nodeTypes.bot.borderColor}`,
      borderRadius: '8px',
      padding: '12px',
      width: 280,
    },
  },
  {
    id: '7',
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-xs mb-1">שלב 7: SATISFACTION</div>
          <div className="text-xs">משתמש: סליידר שביעות רצון 1-7</div>
        </div>
      )
    },
    position: { x: 350, y: 840 },
    style: {
      background: nodeTypes.user.color,
      color: 'white',
      border: `2px solid ${nodeTypes.user.borderColor}`,
      borderRadius: '8px',
      padding: '12px',
      width: 280,
    },
  },
  {
    id: '8',
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-xs mb-1">שלב 8: RESOLVED</div>
          <div className="text-xs">בוט: התקלה טופלה + הצעת מו"מ</div>
        </div>
      )
    },
    position: { x: 350, y: 960 },
    style: {
      background: nodeTypes.bot.color,
      color: 'white',
      border: `2px solid ${nodeTypes.bot.borderColor}`,
      borderRadius: '8px',
      padding: '12px',
      width: 280,
    },
  },
  {
    id: '9',
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-xs mb-1">שלב 9: NEGOTIATION_OFFER</div>
          <div className="text-xs">משתמש: כן / לא למו"מ</div>
        </div>
      )
    },
    position: { x: 350, y: 1080 },
    style: {
      background: nodeTypes.decision.color,
      color: 'white',
      border: `2px solid ${nodeTypes.decision.borderColor}`,
      borderRadius: '8px',
      padding: '12px',
      width: 280,
    },
  },
  {
    id: '10',
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-xs mb-1">שלב 10: NEGOTIATION_ASK</div>
          <div className="text-xs">בוט: כמה חודשי שדרוג?</div>
          <div className="text-xs">משתמש: 1-12</div>
        </div>
      )
    },
    position: { x: 60, y: 1200 },
    style: {
      background: nodeTypes.bot.color,
      color: 'white',
      border: `2px solid ${nodeTypes.bot.borderColor}`,
      borderRadius: '8px',
      padding: '12px',
      width: 280,
    },
  },
  {
    id: '11',
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-xs mb-1">שלב 11: COUNTER_OFFER</div>
          <div className="text-xs">בוט: הצעת נגד (X-2 חודשים)</div>
        </div>
      )
    },
    position: { x: 60, y: 1340 },
    style: {
      background: nodeTypes.bot.color,
      color: 'white',
      border: `2px solid ${nodeTypes.bot.borderColor}`,
      borderRadius: '8px',
      padding: '12px',
      width: 280,
    },
  },
  {
    id: '12',
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-xs mb-1">שלב 12: FINAL_DECISION</div>
          <div className="text-xs">משתמש: מקבל/ת או דוחה/ה</div>
        </div>
      )
    },
    position: { x: 60, y: 1480 },
    style: {
      background: nodeTypes.decision.color,
      color: 'white',
      border: `2px solid ${nodeTypes.decision.borderColor}`,
      borderRadius: '8px',
      padding: '12px',
      width: 280,
    },
  },
  {
    id: '13-accept',
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-xs mb-1">שלב 13: CLOSING</div>
          <div className="text-xs">✅ השדרוג יופעל</div>
        </div>
      )
    },
    position: { x: 60, y: 1620 },
    style: {
      background: nodeTypes.end.color,
      color: 'white',
      border: `2px solid ${nodeTypes.end.borderColor}`,
      borderRadius: '8px',
      padding: '12px',
      width: 200,
    },
  },
  {
    id: '13-reject',
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-xs mb-1">שלב 13: CLOSING</div>
          <div className="text-xs">❌ חבל שלא הסתדר</div>
        </div>
      )
    },
    position: { x: 340, y: 1620 },
    style: {
      background: nodeTypes.end.color,
      color: 'white',
      border: `2px solid ${nodeTypes.end.borderColor}`,
      borderRadius: '8px',
      padding: '12px',
      width: 200,
    },
  },
  {
    id: '13-declined',
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-xs mb-1">שלב 13: CLOSING</div>
          <div className="text-xs">תודה על פנייתך</div>
        </div>
      )
    },
    position: { x: 620, y: 1200 },
    style: {
      background: nodeTypes.end.color,
      color: 'white',
      border: `2px solid ${nodeTypes.end.borderColor}`,
      borderRadius: '8px',
      padding: '12px',
      width: 200,
    },
  },
  {
    id: 'end',
    type: 'output',
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-sm">סיום</div>
        </div>
      )
    },
    position: { x: 400, y: 1760 },
    style: {
      background: nodeTypes.end.color,
      color: 'white',
      border: `2px solid ${nodeTypes.end.borderColor}`,
      borderRadius: '8px',
      padding: '10px',
      width: 180,
    },
  },
]

// Initial edges configuration
const initialEdges: Edge[] = [
  { id: 'e-start-1', source: 'start', target: '1', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e-1-2', source: '1', target: '2', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'e-2-3', source: '2', target: '3', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'e-3-4', source: '3', target: '4', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'e-4-5', source: '4', target: '5', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'e-5-6', source: '5', target: '6', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'e-6-7', source: '6', target: '7', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'e-7-8', source: '7', target: '8', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'e-8-9', source: '8', target: '9', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },

  // Negotiation path - YES
  {
    id: 'e-9-10',
    source: '9',
    target: '10',
    label: 'כן',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
  { id: 'e-10-11', source: '10', target: '11', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'e-11-12', source: '11', target: '12', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },

  // Final decision paths
  {
    id: 'e-12-accept',
    source: '12',
    target: '13-accept',
    label: 'מקבל/ת',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
  {
    id: 'e-12-reject',
    source: '12',
    target: '13-reject',
    label: 'דוחה/ה',
    animated: true,
    style: { stroke: '#ef4444', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
  },

  // Negotiation path - NO
  {
    id: 'e-9-declined',
    source: '9',
    target: '13-declined',
    label: 'לא',
    animated: true,
    style: { stroke: '#ef4444', strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
  },

  // All paths to end
  { id: 'e-accept-end', source: '13-accept', target: 'end', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'e-reject-end', source: '13-reject', target: 'end', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
  { id: 'e-declined-end', source: '13-declined', target: 'end', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
]

export function ChatFlowVisualization() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  return (
    <div className="w-full h-[calc(100vh-200px)] bg-gray-50 rounded-lg border-2 border-gray-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
        dir="rtl"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'input') return nodeTypes.start.color
            if (node.type === 'output') return nodeTypes.end.color
            if (node.id.includes('13-')) return nodeTypes.end.color
            if (node.id === '9' || node.id === '12') return nodeTypes.decision.color
            if (['1', '4', '7'].includes(node.id)) return nodeTypes.user.color
            return nodeTypes.bot.color
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  )
}
