import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TokenUSDC } from '@web3icons/react'
import { AI_SERVICES, type AIService } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface ServiceSelectorProps {
  selectedService: AIService | null
  onSelectService: (service: AIService) => void
  onRequestService: () => void
  disabled: boolean
  className?: string
}

export function ServiceSelector({
  selectedService,
  onSelectService,
  onRequestService,
  disabled,
  className
}: ServiceSelectorProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Available AI Services</CardTitle>
        <CardDescription>
          Select a service for the AI agent to request. Payment will be handled autonomously.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {AI_SERVICES.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelectService(service)}
            disabled={disabled}
            className={cn(
              "w-full text-left p-4 rounded-lg border-2 transition-all",
              "hover:border-accent hover:bg-accent/5",
              selectedService?.id === service.id && "border-accent bg-accent/10",
              disabled && "opacity-50 cursor-not-allowed"
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
                </div>
              </div>
              <Badge variant="accent" className="gap-1.5 shrink-0">
                <TokenUSDC size={12} variant="branded" />
                {service.price}
              </Badge>
            </div>
          </button>
        ))}

        <Button
          variant="accent"
          size="lg"
          className="w-full mt-4"
          onClick={onRequestService}
          disabled={!selectedService || disabled}
        >
          Request Service (Agent Will Pay)
        </Button>
      </CardContent>
    </Card>
  )
}
