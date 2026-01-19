import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { WalletConnect } from '@/components/WalletConnect'
import { AgentStatus } from '@/components/AgentStatus'
import { ServiceSelector } from '@/components/ServiceSelector'
import { PaymentFlow } from '@/components/PaymentFlow'
import { ServiceResponse } from '@/components/ServiceResponse'
import { ActivityLog } from '@/components/ActivityLog'
import { HowItWorks } from '@/components/HowItWorks'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Bot, RotateCcw, ExternalLink } from 'lucide-react'
import { USDC_ADDRESS, ERC20_ABI, SERVICE_PROVIDER_ADDRESS, type AIService } from '@/lib/constants'
import { requestService, verifyPaymentAndUnlock, type Payment402Response, type PaymentProof } from '@/lib/http402'
import type { AgentState, AgentActivity } from '@/types/agent'

export default function App() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  // Agent state
  const [agentState, setAgentState] = useState<AgentState>('idle')
  const [selectedService, setSelectedService] = useState<AIService | null>(null)
  const [payment402Data, setPayment402Data] = useState<Payment402Response | null>(null)
  const [activities, setActivities] = useState<AgentActivity[]>([])
  const [serviceData, setServiceData] = useState<any>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  // Blockchain interactions
  const { data: rawBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isConnected }
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const balance = rawBalance ? formatUnits(rawBalance, 6) : '0.00'
  const isWrongNetwork = isConnected && chainId !== 5042002

  // Add activity to log
  const addActivity = (type: AgentActivity['type'], message: string, details?: any) => {
    const activity: AgentActivity = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type,
      message,
      details
    }
    setActivities(prev => [activity, ...prev])
  }

  // Handle service request (Step 1: Request → HTTP 402)
  const handleRequestService = async () => {
    if (!selectedService || !isConnected) return

    setAgentState('requesting')
    setPayment402Data(null)
    setServiceData(null)
    setTxHash(null)

    addActivity('request', `Requesting service: ${selectedService.name}`)

    try {
      // Simulate HTTP request that returns 402
      const response = await requestService(
        selectedService.id,
        selectedService.name,
        selectedService.endpoint,
        selectedService.price,
        SERVICE_PROVIDER_ADDRESS
      )

      setPayment402Data(response)
      setAgentState('payment-required')
      
      addActivity('request', 'HTTP 402 Payment Required received', {
        amount: response.payment.amount,
        reference: response.payment.reference
      })
    } catch (error) {
      console.error('Service request failed:', error)
      setAgentState('error')
      addActivity('error', 'Service request failed', { error: String(error) })
    }
  }

  // Handle payment approval (Step 2: Approve → Send Payment)
  const handleApprovePayment = async () => {
    if (!payment402Data || !address) return

    setAgentState('approving-payment')
    addActivity('payment', 'Payment approved - agent executing transaction...')

    // Small delay to show approval state
    await new Promise(resolve => setTimeout(resolve, 500))

    setAgentState('processing-payment')

    try {
      // Send USDC payment
      writeContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [
          payment402Data.payment.recipient as `0x${string}`,
          parseUnits(payment402Data.payment.amount, 6)
        ],
      })

      addActivity('payment', `Sending ${payment402Data.payment.amount} USDC to service provider`)
    } catch (error) {
      console.error('Payment failed:', error)
      setAgentState('error')
      addActivity('error', 'Payment transaction failed', { error: String(error) })
    }
  }

  // Watch for transaction confirmation
  useEffect(() => {
    if (hash && !txHash) {
      setTxHash(hash)
      addActivity('payment', 'Transaction submitted to Arc Testnet', { txHash: hash })
    }
  }, [hash])

  // Handle successful payment (Step 3: Verify → Unlock Service)
  useEffect(() => {
    if (isSuccess && payment402Data && txHash) {
      const verifyAndUnlock = async () => {
        setAgentState('verifying')
        addActivity('payment', 'Payment confirmed on-chain - verifying...')

        try {
          const proof: PaymentProof = {
            txHash,
            amount: payment402Data.payment.amount,
            recipient: payment402Data.payment.recipient,
            timestamp: Date.now(),
            reference: payment402Data.payment.reference
          }

          const result = await verifyPaymentAndUnlock(proof, payment402Data.service.id)

          if (result.success) {
            setServiceData(result.data)
            setAgentState('success')
            addActivity('unlock', `Service unlocked: ${payment402Data.service.name}`, result.data)
          } else {
            setAgentState('error')
            addActivity('error', 'Payment verification failed', { error: result.error })
          }
        } catch (error) {
          console.error('Verification failed:', error)
          setAgentState('error')
          addActivity('error', 'Service unlock failed', { error: String(error) })
        }
      }

      verifyAndUnlock()
    }
  }, [isSuccess, payment402Data, txHash])

  // Reset demo
  const handleReset = () => {
    setAgentState('idle')
    setSelectedService(null)
    setPayment402Data(null)
    setServiceData(null)
    setTxHash(null)
    addActivity('request', 'Demo reset - ready for new request')
  }

  const isProcessing = ['requesting', 'approving-payment', 'processing-payment', 'verifying'].includes(agentState)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Bot className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Agent Commerce Platform</h1>
                <p className="text-xs text-muted-foreground">HTTP 402 Micropayments on Arc Testnet</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="accent" className="gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                Arc Hackathon Demo
              </Badge>
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Wrong Network Alert */}
        {isWrongNetwork && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription className="flex items-center justify-between">
              <span>Please switch to Arc Testnet to use this demo</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => switchChain({ chainId: 5042002 })}
              >
                Switch Network
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Not Connected Alert */}
        {!isConnected && (
          <Alert variant="info" className="mb-6">
            <AlertDescription>
              Connect your wallet to begin. Make sure you have testnet USDC from{' '}
              <a 
                href="https://faucet.circle.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:underline inline-flex items-center gap-1"
              >
                faucet.circle.com
                <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agent Status */}
            <AgentStatus 
              state={agentState} 
              balance={balance}
            />

            {/* How It Works */}
            <HowItWorks />

            {/* Service Selector */}
            <ServiceSelector
              selectedService={selectedService}
              onSelectService={setSelectedService}
              onRequestService={handleRequestService}
              disabled={!isConnected || isWrongNetwork || isProcessing}
            />

            {/* Payment Flow */}
            {(payment402Data || agentState !== 'idle') && (
              <PaymentFlow
                state={agentState}
                payment402Data={payment402Data}
                txHash={txHash}
                onApprovePayment={handleApprovePayment}
              />
            )}

            {/* Service Response */}
            {serviceData && selectedService && (
              <ServiceResponse
                serviceId={selectedService.id}
                serviceName={selectedService.name}
                data={serviceData}
              />
            )}

            {/* Reset Button */}
            {agentState === 'success' && (
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
                Reset Demo & Try Another Service
              </Button>
            )}
          </div>

          {/* Right Column - Activity Log */}
          <div className="lg:col-span-1">
            <ActivityLog activities={activities} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            Built for Arc Hackathon • Powered by Circle & Arc Testnet
          </p>
          <p className="mt-2">
            Demonstrating autonomous AI agent commerce with HTTP 402 micropayments
          </p>
        </footer>
      </main>
    </div>
  )
}
