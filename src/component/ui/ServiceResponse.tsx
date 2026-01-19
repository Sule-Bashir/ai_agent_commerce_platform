import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Image as ImageIcon, BarChart3, Code } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ServiceResponseProps {
  serviceId: string
  serviceName: string
  data: any
  className?: string
}

export function ServiceResponse({ serviceId, serviceName, data, className }: ServiceResponseProps) {
  const renderContent = () => {
    switch (serviceId) {
      case 'gpt4-api':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Code className="h-4 w-4" />
              <span>Model: {data.model}</span>
              <Badge variant="secondary" className="ml-auto">
                {data.tokens_used} tokens
              </Badge>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm leading-relaxed">{data.response}</p>
            </div>
          </div>
        )

      case 'image-gen':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              <span>Model: {data.model}</span>
            </div>
            <div className="rounded-lg overflow-hidden border border-border">
              <img 
                src={data.image_url} 
                alt="Generated" 
                className="w-full h-auto"
              />
            </div>
            <p className="text-xs text-muted-foreground italic">
              Prompt: {data.prompt}
            </p>
          </div>
        )

      case 'data-analysis':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>Analysis Complete</span>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Key Insights:</h4>
              <ul className="space-y-2">
                {data.insights.map((insight: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )

      case 'code-review':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Score: {data.code_quality_score}/100
              </Badge>
              <Badge variant="secondary">
                {data.issues_found} issues found
              </Badge>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Suggestions:</h4>
              <ul className="space-y-2">
                {data.suggestions.map((suggestion: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-accent">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )

      default:
        return (
          <pre className="text-xs font-mono p-4 rounded-lg bg-muted/50 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )
    }
  }

  return (
    <Card className={cn("border-success/50 bg-success/5", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Service Unlocked: {serviceName}
          </CardTitle>
          <Badge variant="success">Paid & Delivered</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Timestamp: {new Date(data.timestamp).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
