import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, Sparkles } from 'lucide-react'
import { TokenUSDC } from '@web3icons/react'
import { AI_SERVICES, type AIService } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface ServiceSelectorProps {
  selectedService: AIService | null
  onSelectService: (service: AIService) => void
  onRequestService: () => void
  disabled: boolean
  transactionMode?: 'real' | 'simulation'
  className?: string
}

export function ServiceSelector({
  selectedService,
  onSelectService,
  onRequestService,
  disabled,
  transactionMode = 'simulation',
  className
}: ServiceSelectorProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Available AI Services</CardTitle>
            <CardDescription>
              Select a service for the AI agent to request. Payment will be handled autonomously.
            </CardDescription>
          </div>
          {transactionMode === 'real' && (
            <Badge variant="default" className="gap-1">
              <Zap className="h-3 w-3" />
              Real USDC
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {AI_SERVICES.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelectService(service)}
            disabled={disabled}
            className={cn(
              "w-full text-left p-4 rounded-lg border-2 transition-all hover:scale-[1.01]",
              "hover:border-accent hover:bg-accent/5 hover:shadow-sm",
              selectedService?.id === service.id 
                ? "border-accent bg-accent/10 shadow-sm" 
                : "border-border",
              disabled && "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{service.icon}</span>
                <div>
                  <h4 className="font-semibold">{service.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {service.id.split('-')[0]}
                    </Badge>
                    {transactionMode === 'real' && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Sparkles className="h-2.5 w-2.5" />
                        Real Payment
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Badge 
                variant={transactionMode === 'real' ? "default" : "accent"} 
                className="gap-1.5 shrink-0"
              >
                <TokenUSDC size={12} variant="branded" />
                {service.price} USDC
              </Badge>
            </div>
          </button>
        ))}

        <Button
          variant={transactionMode === 'real' ? "default" : "accent"}
          size="lg"
          className="w-full mt-4 gap-2"
          onClick={onRequestService}
          disabled={!selectedService || disabled}
        >
          {transactionMode === 'real' ? (
            <>
              <Zap className="h-4 w-4" />
              Request Service (Pay with Real USDC)
            </>
          ) : (
            'Request Service (Agent Will Pay)'
          )}
        </Button>

        {transactionMode === 'real' && selectedService && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 text-center">
              Ready to send <strong>{selectedService.price} USDC</strong> on Arc Testnet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
