import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, CreditCard, Bot, Unlock, Zap } from 'lucide-react'

export function HowItWorks() {
  return (
    <Card className="border-accent/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent" />
          How Agentic Commerce Works
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
                <Globe className="h-4 w-4 text-accent" />
              </div>
              <h4 className="font-semibold">1. Service Request</h4>
            </div>
            <p className="text-sm text-muted-foreground pl-10">
              AI agent requests a paid service (API, data, compute)
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20">
                <CreditCard className="h-4 w-4 text-yellow-500" />
              </div>
              <h4 className="font-semibold">2. HTTP 402 Response</h4>
            </div>
            <p className="text-sm text-muted-foreground pl-10">
              Server returns "Payment Required" with USDC payment details
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
                <Bot className="h-4 w-4 text-accent" />
              </div>
              <h4 className="font-semibold">3. Autonomous Payment</h4>
            </div>
            <p className="text-sm text-muted-foreground pl-10">
              Agent signs and sends USDC on Arc Testnet without human intervention
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
                <Unlock className="h-4 w-4 text-success" />
              </div>
              <h4 className="font-semibold">4. Service Unlocked</h4>
            </div>
            <p className="text-sm text-muted-foreground pl-10">
              Payment verified, content delivered to agent automatically
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-3">
          <h4 className="font-semibold text-sm">Hackathon Tracks Demonstrated:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">Gateway-Based Micropayments</Badge>
            <Badge variant="accent">Trustless AI Agent</Badge>
            <Badge variant="accent">Autonomous Commerce</Badge>
            <Badge variant="accent">App Builder Excellence</Badge>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> This demo uses real USDC transactions on Arc Testnet. 
            Get testnet USDC from{' '}
            <a 
              href="https://faucet.circle.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              faucet.circle.com
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
