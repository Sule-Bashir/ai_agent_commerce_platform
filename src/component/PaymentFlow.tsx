import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, ExternalLink, CheckCircle2, AlertCircle, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AgentState } from '@/types/agent'
import type { Payment402Response } from '@/lib/http402'

interface PaymentFlowProps {
  state: AgentState
  payment402Data: Payment402Response | null
  txHash: string | null
  serviceData: any
  transactionMode?: 'real' | 'simulation'
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
  serviceData,
  transactionMode = 'simulation',
  onApprovePayment,
  className 
}: PaymentFlowProps) {
  const currentStepIndex = flowSteps.findIndex(step => 
    step.states.includes(state)
  )

  const isUnlocked = state === 'success' || serviceData !== null

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payment Flow (HTTP 402 Protocol)</CardTitle>
          <Badge variant={transactionMode === 'real' ? "default" : "outline"}>
            {transactionMode === 'real' ? (
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Real Transaction
              </span>
            ) : 'Simulation'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Flow Visualization */}
        <div className="flex items-center justify-between">
          {flowSteps.map((step, index) => {
            const isActive = index === currentStepIndex || 
                           (index === 3 && isUnlocked)

            const isCompleted = index < currentStepIndex || 
                              (isUnlocked && index < 3) ||
                              (index === 3 && isUnlocked)

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all",
                    isCompleted && "border-green-500 bg-green-500/20",
                    isActive && "border-accent bg-accent/20 animate-pulse",
                    !isCompleted && !isActive && "border-gray-300 bg-gray-50"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>
                  <span className={cn(
                    "text-xs mt-2 font-medium",
                    isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </span>
                </div>
                {index < flowSteps.length - 1 && (
                  <ArrowRight className={cn(
                    "h-5 w-5 mx-2",
                    isCompleted ? "text-green-500" : "text-gray-300"
                  )} />
                )}
              </div>
            )
          })}
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mode:</span>
                    <Badge variant={transactionMode === 'real' ? "success" : "outline"} className="text-xs">
                      {transactionMode === 'real' ? 'Real USDC' : 'Simulation'}
                    </Badge>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Approval Button */}
        {state === 'payment-required' && (
          <Button
            variant={transactionMode === 'real' ? "default" : "accent"}
            size="lg"
            className="w-full gap-2"
            onClick={onApprovePayment}
          >
            {transactionMode === 'real' ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Approve Real Payment ({payment402Data?.payment.amount} USDC)
              </>
            ) : (
              'Approve Payment (Simulation)'
            )}
          </Button>
        )}

        {/* Transaction Hash */}
        {txHash && !isUnlocked && (
          <Alert variant="success">
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">
                    {transactionMode === 'real' ? 'Transaction Submitted' : 'Simulation Submitted'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <code className="text-xs font-mono">
                    {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </code>
                  {transactionMode === 'real' && (
                    <a
                      href={`https://testnet.arcscan.app/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-accent hover:underline"
                    >
                      View on ArcScan
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Service Unlocked Message */}
        {isUnlocked && (
          <Alert variant="success">
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Service Unlocked</span>
                </div>
                <p className="text-sm mt-1">
                  {transactionMode === 'real' 
                    ? 'Payment verified on-chain. Service content delivered to agent.' 
                    : 'Payment simulation completed. Service content delivered.'}
                </p>
                {transactionMode === 'real' && txHash && (
                  <a
                    href={`https://testnet.arcscan.app/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-2"
                  >
                    View transaction on ArcScan
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
