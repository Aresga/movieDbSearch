import {
  Heart, Frown, Smile, Zap, AlertTriangle, Laugh,
  Minus, ThumbsDown, ShieldAlert, AlertCircle, HelpCircle, Flame, MessageSquareQuote,
  type LucideIcon
} from 'lucide-react'


const emotionConfig: Record<string, { icon: LucideIcon; color: string; bg: string; border: string }> = {
  Happiness: { icon: Laugh,               color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-300'  },
  Love:      { icon: Heart,               color: 'text-pink-700',   bg: 'bg-pink-50',   border: 'border-pink-300'   },
  Desire:    { icon: Flame,               color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-300' },
  Surprise:  { icon: Zap,                 color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-300'   },
  Neutral:   { icon: Minus,               color: 'text-gray-500',   bg: 'bg-gray-100',  border: 'border-gray-300'   },
  Confusion: { icon: HelpCircle,          color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  Sarcasm:   { icon: MessageSquareQuote,  color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
  Sadness:   { icon: Frown,               color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-300' },
  Fear:      { icon: AlertTriangle,       color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-300' },
  Anger:     { icon: ShieldAlert,         color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-300'    },
  Disgust:   { icon: ThumbsDown,          color: 'text-lime-700',   bg: 'bg-lime-50',   border: 'border-lime-300'   },
  Shame:     { icon: Smile,               color: 'text-rose-700',   bg: 'bg-rose-50',   border: 'border-rose-300'   },
  Guilt:     { icon: AlertCircle,         color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-300'  },
}

interface EmotionBadgeProps {
  sentiment: string
  score?: number
  className?: string
}

export function EmotionBadge({ sentiment, score, className }: EmotionBadgeProps) {
  const key = sentiment.charAt(0).toUpperCase() + sentiment.slice(1).toLowerCase()
  const config = emotionConfig[key]
  if (!config) return null

  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-1 ${className ?? ''}`}>
      <Icon className={`w-4 h-4 ${config.color}`} />
      <span className={`text-xs font-medium ${config.color}`}>{sentiment}</span>
      {score !== undefined && (
        <span className="text-xs text-muted-foreground">{Math.round(score)}%</span>
      )}
    </div>
  )
}


