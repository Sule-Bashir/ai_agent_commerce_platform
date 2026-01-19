import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AgentState } from '@/types/agent'
import type { Payment402Response } from '@/lib/http402'

interface PaymentFlowProps {
  state: AgentState
  payment402Data: Payment402Response | null
  txHash: string | null
  onApprovePayment: () => void
  className?: string
}

const flowSteps = [
  { id: 'request', label: 'Request Service', states: ['requesting'] },
  { id: '402', label: 'HTTP 402', states: ['payment-required'] },
  { id: 'payment', label: 'Send Payment', states: ['approving-payment', 'processing-payment'] },
  { id: 'verify', label: 'Verify & Unlock', states: ['verifying', 'success'] },
]

export function PaymentFlow({ 
  state, 
  payment402Data, 
  txHash,
  onApprovePayment,
  className 
}: PaymentFlowProps) {
  const currentStepIndex = flowSteps.findIndex(step => 
    step.states.includes(state)
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Payment Flow (HTTP 402 Protocol)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Flow Visualization */}
        <div className="flex items-center justify-between">
          {flowSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                  index < currentStepIndex && "border-success bg-success/20",
                  index === currentStepIndex && "border-accent bg-accent/20 animate-pulse-glow",
                  index > currentStepIndex && "border-muted bg-muted/20"
                )}>
                  {index < currentStepIndex ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                <span className={cn(
                  "text-xs mt-2 font-medium",
                  index <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
              {index < flowSteps.length - 1 && (
                <ArrowRight className={cn(
                  "h-5 w-5 mx-2",
                  index < currentStepIndex ? "text-success" : "text-muted-foreground"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Payment Details */}
        {payment402Data && (
          <Alert variant="info">
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">HTTP 402 Response</span>
                  <Badge variant="accent">Payment Required</Badge>
                </div>
                <div className="font-mono text-xs space-y-1 mt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service:</span>
                    <span>{payment402Data.service.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold">{payment402Data.payment.amount} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chain:</span>
                    <span>{payment402Data.payment.chain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference:</span>
                    <span className="text-xs">{payment402Data.payment.reference}</span>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Approval Button */}
        {state === 'payment-required' && (
          <Button
            variant="accent"
            size="lg"
            className="w-full"
            onClick={onApprovePayment}
          >
            Approve Payment (Agent Will Execute)
          </Button>
        )}

        {/* Transaction Hash */}
        {txHash && (
          <Alert variant="success">
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Transaction Submitted</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <code className="text-xs font-mono">
                    {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </code>
                  <a
                    href={`https://testnet.arcscan.app/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-accent hover:underline"
                  >
                    View on ArcScan
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
