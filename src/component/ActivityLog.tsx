import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AgentActivity } from '@/types/agent'

interface ActivityLogProps {
  activities: AgentActivity[]
}

const getActivityIcon = (type: AgentActivity['type']) => {
  switch (type) {
    case 'request':
      return <Clock className="h-4 w-4 text-blue-400" />
    case 'payment':
      return <CheckCircle className="h-4 w-4 text-green-400" />
    case 'unlock':
      return <CheckCircle className="h-4 w-4 text-purple-400" />
    case 'error':
      return <XCircle className="h-4 w-4 text-red-400" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-400" />
  }
}

const getActivityColor = (type: AgentActivity['type']) => {
  switch (type) {
    case 'request':
      return 'border-l-blue-500 bg-blue-500/10'
    case 'payment':
      return 'border-l-green-500 bg-green-500/10'
    case 'unlock':
      return 'border-l-purple-500 bg-purple-500/10'
    case 'error':
      return 'border-l-red-500 bg-red-500/10'
    default:
      return 'border-l-gray-500 bg-gray-500/10'
  }
}

export function ActivityLog({ activities }: ActivityLogProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card className="h-full border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse-glow"></div>
          Agent Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground/70">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No activity yet. Select a service to begin.</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={cn(
                  "p-3 rounded-lg border-l-4 transition-all duration-300 hover:scale-[1.01]",
                  getActivityColor(activity.type)
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {activity.message}
                      </p>
                      {activity.details && (
                        <div className="mt-2">
                          <pre className="text-xs bg-secondary/30 p-3 rounded border border-border/50 overflow-x-auto text-foreground/90 font-mono">
                            {JSON.stringify(activity.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs font-mono px-2 py-0.5 border-border/50",
                        activity.type === 'request' && "bg-blue-500/20 text-blue-300",
                        activity.type === 'payment' && "bg-green-500/20 text-green-300",
                        activity.type === 'unlock' && "bg-purple-500/20 text-purple-300",
                        activity.type === 'error' && "bg-red-500/20 text-red-300",
                      )}
                    >
                      {activity.type}
                    </Badge>
                    <p className="text-xs text-muted-foreground font-mono">
                      {formatTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
