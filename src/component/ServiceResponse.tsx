import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ExternalLink, Zap, FileText, Image as ImageIcon, BarChart3, Code, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ServiceResponseProps {
  serviceId: string
  serviceName: string
  data: any
  transactionMode?: 'real' | 'simulation'
}

const serviceIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  'gpt4-api': {
    icon: <FileText className="h-5 w-5" />,
    color: 'text-blue-600 bg-blue-50 border-blue-200'
  },
  'image-gen': {
    icon: <ImageIcon className="h-5 w-5" />,
    color: 'text-purple-600 bg-purple-50 border-purple-200'
  },
  'data-analysis': {
    icon: <BarChart3 className="h-5 w-5" />,
    color: 'text-green-600 bg-green-50 border-green-200'
  },
  'code-review': {
    icon: <Code className="h-5 w-5" />,
    color: 'text-amber-600 bg-amber-50 border-amber-200'
  }
}

export function ServiceResponse({ 
  serviceId, 
  serviceName, 
  data, 
  transactionMode = 'simulation' 
}: ServiceResponseProps) {
  const serviceIcon = serviceIcons[serviceId] || {
    icon: <FileText className="h-5 w-5" />,
    color: 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleString([], {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return new Date().toLocaleString()
    }
  }

  const renderContent = () => {
    switch (serviceId) {
      case 'gpt4-api':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <FileText className="h-3 w-3" />
                  Model
                </Badge>
                <span className="font-medium">{data.model || 'gpt-4'}</span>
              </div>
              <Badge variant="outline" className="gap-1">
                <FileText className="h-3 w-3" />
                {data.tokens_used || 42} tokens
              </Badge>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm font-medium text-gray-700 mb-1">Response:</p>
              <p className="text-gray-800">{data.response || 'The future of autonomous commerce lies in trustless, programmable payments.'}</p>
            </div>
          </div>
        )

      case 'image-gen':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <ImageIcon className="h-3 w-3" />
                  Model
                </Badge>
                <span className="font-medium">{data.model || 'dall-e-3'}</span>
              </div>
              {data.image_url && (
                <a 
                  href={data.image_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  View Image
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            {data.prompt && (
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm font-medium text-gray-700 mb-1">Prompt:</p>
                <p className="text-gray-800">{data.prompt}</p>
              </div>
            )}
            {data.image_url && (
              <div className="mt-2">
                <div className="aspect-video bg-gray-100 rounded-lg border overflow-hidden">
                  <img 
                    src={data.image_url} 
                    alt={data.prompt || 'AI generated image'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )

      case 'data-analysis':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="gap-1">
                <BarChart3 className="h-3 w-3" />
                Insights
              </Badge>
              <span className="text-sm text-muted-foreground">{data.insights?.length || 2} key findings</span>
            </div>
            <div className="space-y-2">
              {data.insights?.map((insight: string, index: number) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
                  <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <p className="text-sm">{insight}</p>
                </div>
              )) || (
                <>
                  <div className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <p className="text-sm">Transaction volume increased 34% this quarter</p>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">2</span>
                    </div>
                    <p className="text-sm">Average payment size: 0.18 USDC</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )

      case 'code-review':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Code className="h-3 w-3" />
                  Quality Score
                </Badge>
                <span className="font-medium">{data.code_quality_score || 87}/100</span>
              </div>
              <Badge variant={data.issues_found > 3 ? "destructive" : "outline"} className="gap-1">
                <Code className="h-3 w-3" />
                {data.issues_found || 3} issues found
              </Badge>
            </div>
            {data.suggestions && data.suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Suggestions:</p>
                <div className="space-y-1">
                  {data.suggestions.map((suggestion: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
                      <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      </div>
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) || (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Suggestions:</p>
                <div className="space-y-1">
                  <div className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    </div>
                    <p className="text-sm">Add input validation for user data</p>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    </div>
                    <p className="text-sm">Implement rate limiting for API calls</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="text-gray-700">{data.message || 'Service completed successfully'}</p>
          </div>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center border",
              serviceIcon.color
            )}>
              {serviceIcon.icon}
            </div>
            <div>
              <CardTitle className="text-lg">Service Unlocked: {serviceName}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Paid & Delivered
                </Badge>
                <Badge variant={transactionMode === 'real' ? "default" : "outline"} className="gap-1 text-xs">
                  {transactionMode === 'real' ? (
                    <>
                      <Zap className="h-3 w-3" />
                      Real Transaction
                    </>
                  ) : 'Simulation'}
                </Badge>
              </div>
            </div>
          </div>
          {transactionMode === 'real' && (
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              On-Chain Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Service Content */}
        {renderContent()}

        {/* Metadata */}
        <div className="pt-4 border-t">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Timestamp: {formatTimestamp(data.timestamp)}
              </span>
            </div>
            {transactionMode === 'real' && data.simulated === false && (
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified on Arc Testnet
              </Badge>
            )}
            {transactionMode === 'simulation' && (
              <Badge variant="outline" className="gap-1">
                Demo Preview
              </Badge>
            )}
          </div>
        </div>

        {/* Additional Info for Real Transactions */}
        {transactionMode === 'real' && data.realTransaction && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Real Payment Confirmed</span>
            </div>
            <p className="text-xs text-green-700">
              This service was unlocked with a real USDC payment on Arc Testnet. 
              The transaction is permanently recorded on the blockchain.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
