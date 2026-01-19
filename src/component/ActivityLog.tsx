import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Zap, CreditCard, Unlock, XCircle } from 'lucide-react'
import type { AgentActivity } from '@/types/agent'

interface ActivityLogProps {
  activities: AgentActivity[]
  className?: string
}

const activityIcons = {
  request: Zap,
  payment: CreditCard,
  unlock: Unlock,
  error: XCircle,
}

const activityColors = {
  request: 'text-accent',
  payment: 'text-yellow-500',
  unlock: 'text-success',
  error: 'text-destructive',
}

export function ActivityLog({ activities, className }: ActivityLogProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Agent Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No activity yet. Select a service to begin.
            </p>
          ) : (
            activities.map((activity) => {
              const Icon = activityIcons[activity.type]
              const color = activityColors[activity.type]
              
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                >
                  <div className={`mt-0.5 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                    {activity.details && (
                      <pre className="text-xs font-mono mt-2 p-2 rounded bg-background/50 overflow-x-auto">
                        {JSON.stringify(activity.details, null, 2)}
                      </pre>
                    )}
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {activity.type}
                  </Badge>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
