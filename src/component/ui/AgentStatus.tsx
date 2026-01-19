import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Bot, Zap, CheckCircle2, XCircle, Clock, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AgentState } from '@/types/agent'

interface AgentStatusProps {
  state: AgentState
  balance: string
  className?: string
}

const stateConfig: Record<AgentState, {
  label: string
  icon: React.ReactNode
  color: string
  description: string
}> = {
  idle: {
    label: 'Idle',
    icon: <Bot className="h-5 w-5" />,
    color: 'text-muted-foreground',
    description: 'Agent is ready to process requests'
  },
  requesting: {
    label: 'Requesting Service',
    icon: <Spinner size={20} />,
    color: 'text-accent',
    description: 'Sending request to service provider...'
  },
  'payment-required': {
    label: 'Payment Required',
    icon: <CreditCard className="h-5 w-5" />,
    color: 'text-yellow-500',
    description: 'HTTP 402 received - payment needed to proceed'
  },
  'approving-payment': {
    label: 'Awaiting Approval',
    icon: <Clock className="h-5 w-5 animate-pulse" />,
    color: 'text-yellow-500',
    description: 'Waiting for payment approval...'
  },
  'processing-payment': {
    label: 'Processing Payment',
    icon: <Spinner size={20} className="text-accent" />,
    color: 'text-accent',
    description: 'Sending USDC payment on Arc Testnet...'
  },
  verifying: {
    label: 'Verifying Payment',
    icon: <Spinner size={20} className="text-accent" />,
    color: 'text-accent',
    description: 'Confirming transaction and unlocking service...'
  },
  success: {
    label: 'Success',
    icon: <CheckCircle2 className="h-5 w-5" />,
    color: 'text-success',
    description: 'Service unlocked and data received'
  },
  error: {
    label: 'Error',
    icon: <XCircle className="h-5 w-5" />,
    color: 'text-destructive',
    description: 'An error occurred during the process'
  }
}

export function AgentStatus({ state, balance, className }: AgentStatusProps) {
  const config = stateConfig[state]

  return (
    <Card className={cn("border-2", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              state === 'idle' && "bg-muted",
              state === 'requesting' && "bg-accent/20 animate-pulse-glow",
              state === 'payment-required' && "bg-yellow-500/20",
              state === 'approving-payment' && "bg-yellow-500/20 animate-pulse",
              state === 'processing-payment' && "bg-accent/20 animate-pulse-glow",
              state === 'verifying' && "bg-accent/20 animate-pulse-glow",
              state === 'success' && "bg-success/20 glow-success",
              state === 'error' && "bg-destructive/20"
            )}>
              <span className={config.color}>
                {config.icon}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Agent Status</h3>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <Badge 
            variant={
              state === 'success' ? 'success' : 
              state === 'error' ? 'destructive' : 
              state === 'idle' ? 'secondary' : 
              'accent'
            }
            className="gap-1.5"
          >
            {config.label}
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">Agent Balance</span>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" />
            <span className="font-mono font-semibold">{balance} USDC</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
