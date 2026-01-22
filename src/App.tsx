import { useState, useEffect, useCallback } from 'react'
import { useAccount, useReadContract, useWaitForTransactionReceipt, useChainId, useSendTransaction } from 'wagmi'
import { parseUnits, formatUnits, getAddress } from 'viem'
import confetti from 'canvas-confetti'
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
import { Bot, RotateCcw, ExternalLink, RefreshCw, CheckCircle, Zap, PartyPopper } from 'lucide-react'
import { USDC_ADDRESS, ERC20_ABI, SERVICE_PROVIDER_ADDRESS, type AIService, USDC_DECIMALS } from '@/lib/constants'
import { requestService, verifyPaymentAndUnlock, type Payment402Response, type PaymentProof } from '@/lib/http402'
import type { AgentState, AgentActivity } from '@/types/agent'

export default function App() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { sendTransaction } = useSendTransaction()

  // Agent state
  const [agentState, setAgentState] = useState<AgentState>('idle')
  const [selectedService, setSelectedService] = useState<AIService | null>(null)
  const [payment402Data, setPayment402Data] = useState<Payment402Response | null>(null)
  const [activities, setActivities] = useState<AgentActivity[]>([])
  const [serviceData, setServiceData] = useState<any>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [pendingAmount, setPendingAmount] = useState<string | null>(null)
  const [transactionMode, setTransactionMode] = useState<'real' | 'simulation'>('simulation')
  const [showConfetti, setShowConfetti] = useState(false)
  const [manualRefreshCounter, setManualRefreshCounter] = useState(0)

  // FIXED: REAL-TIME BALANCE WITH AUTO-REFRESH
  const { data: rawBalance, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address && isConnected,
      retry: 3,
      refetchInterval: 3000, // AUTO-REFRESH EVERY 3 SECONDS
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 2000,
    }
  })

  // Transaction confirmation
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ 
    hash: txHash as `0x${string}`,
    confirmations: 1,
    query: {
      enabled: !!txHash && txHash.startsWith('0x'),
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000)
    }
  })

  // FIXED: Format balance with 6 decimals for USDC
  const balance = rawBalance ? formatUnits(rawBalance, USDC_DECIMALS) : '0.00'
  const balanceNumber = parseFloat(balance)
  const isWrongNetwork = isConnected && chainId !== 5042002
  const hasBalance = balanceNumber > 0
  const isOnArcTestnet = chainId === 5042002

  // Add activity to log
  const addActivity = useCallback((type: AgentState, message: string, details?: any) => {
    const activity: AgentActivity = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: type as any,
      message,
      details
    }
    setActivities(prev => [activity, ...prev.slice(0, 19)]) // Keep last 20 items
  }, [])

  // Initialize and determine transaction mode
  useEffect(() => {
    if (isConnected && address) {
      addActivity('idle', `Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`, {
        address,
        chainId,
        balance: balanceNumber.toFixed(6)
      })

      // Check if we can do real transactions
      const canDoReal = hasBalance && isOnArcTestnet
      setTransactionMode(canDoReal ? 'real' : 'simulation')

      if (canDoReal) {
        addActivity('idle', 'Real transaction mode enabled', { 
          balance: balanceNumber.toFixed(6),
          chainId,
          usdcAddress: USDC_ADDRESS,
          note: 'Real USDC transactions enabled'
        })
      } else {
        addActivity('idle', 'Simulation mode enabled', { 
          reason: !hasBalance ? 'No USDC balance' : 'Wrong network',
          balance: balanceNumber.toFixed(6),
          chainId,
          requiredNetwork: 'Arc Testnet (5042002)',
          currentNetwork: chainId
        })
      }
    }
  }, [isConnected, address, hasBalance, isOnArcTestnet, chainId, balanceNumber, addActivity])

  // FIXED: AUTO-REFRESH BALANCE AFTER TRANSACTIONS
  useEffect(() => {
    if (isSuccess && receipt?.status === 'success' && txHash) {
      console.log('✅ Transaction confirmed, refreshing balance in 3 seconds...')

      const timer = setTimeout(() => {
        refetchBalance()
        addActivity('idle', 'Refreshing balance after transaction...', {
          txHash,
          blockNumber: receipt.blockNumber
        })
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isSuccess, receipt, txHash, refetchBalance, addActivity])

  // FIXED: MANUAL REFRESH TRIGGER
  useEffect(() => {
    if (manualRefreshCounter > 0) {
      refetchBalance()
      addActivity('idle', 'Manual balance refresh triggered')
    }
  }, [manualRefreshCounter, refetchBalance, addActivity])

  // Trigger confetti on successful real transaction
  useEffect(() => {
    if (agentState === 'success' && transactionMode === 'real' && showConfetti) {
      // Left side confetti
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      })

      // Right side confetti
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      })

      // Center burst
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        })
      }, 250)

      setShowConfetti(false)
    }
  }, [agentState, transactionMode, showConfetti])

  // Handle successful real transaction
  useEffect(() => {
    if (isSuccess && receipt?.status === 'success' && payment402Data && txHash) {
      const verifyAndUnlock = async () => {
        setAgentState('verifying')
        addActivity('verifying', 'REAL payment confirmed on-chain - verifying...', {
          txHash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          amount: payment402Data.payment.amount,
          confirmations: receipt.confirmations
        })

        try {
          const proof: PaymentProof = {
            txHash: txHash,
            amount: payment402Data.payment.amount,
            recipient: payment402Data.payment.recipient,
            timestamp: Date.now(),
            reference: payment402Data.payment.reference
          }

          const result = await verifyPaymentAndUnlock(proof, payment402Data.service.id)

          if (result.success) {
            setServiceData({ ...result.data, realTransaction: true })
            setAgentState('success')
            setPendingAmount(null)
            setShowConfetti(true)

            addActivity('success', `Service unlocked: ${payment402Data.service.name}`, {
              ...result.data,
              realTransaction: true,
              txHash,
              explorerUrl: `https://testnet.arcscan.app/tx/${txHash}`,
              amountPaid: payment402Data.payment.amount,
              oldBalance: balance,
              expectedNewBalance: (balanceNumber - parseFloat(payment402Data.payment.amount)).toFixed(6)
            })
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
    } else if (isSuccess && receipt?.status === 'reverted') {
      setAgentState('error')
      setPendingAmount(null)
      addActivity('error', 'Transaction reverted on-chain', { txHash })
    }
  }, [isSuccess, receipt, payment402Data, txHash, balance, balanceNumber])

  // Handle service request
  const handleRequestService = async () => {
    if (!selectedService) {
      addActivity('error', 'Please select a service first')
      return
    }

    if (!isConnected) {
      addActivity('error', 'Please connect your wallet first')
      return
    }

    setAgentState('requesting')
    setPayment402Data(null)
    setServiceData(null)
    setTxHash(null)
    setPendingAmount(null)
    setShowConfetti(false)

    addActivity('requesting', `Requesting service: ${selectedService.name}`, {
      service: selectedService.name,
      price: selectedService.price,
      currentBalance: balanceNumber.toFixed(6)
    })

    try {
      const response = await requestService(
        selectedService.id,
        selectedService.name,
        selectedService.endpoint,
        selectedService.price,
        SERVICE_PROVIDER_ADDRESS
      )

      setPayment402Data(response)
      setAgentState('payment-required')

      addActivity('payment-required', 'HTTP 402 Payment Required received', {
        amount: response.payment.amount,
        reference: response.payment.reference,
        service: response.service.name,
        requiredAmount: response.payment.amount,
        currentBalance: balanceNumber.toFixed(6),
        willHave: (balanceNumber - parseFloat(response.payment.amount)).toFixed(6)
      })
    } catch (error) {
      console.error('Service request failed:', error)
      setAgentState('error')
      addActivity('error', 'Service request failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  // FIXED: REAL PAYMENT FUNCTION WITH BALANCE VALIDATION
  const handleApprovePayment = async () => {
    if (!payment402Data || !address) return

    const requiredAmount = parseFloat(payment402Data.payment.amount)
    const currentBalance = balanceNumber

    // REAL BALANCE CHECK WITH ACTUAL BLOCKCHAIN BALANCE
    if (currentBalance < requiredAmount) {
      setAgentState('error')
      addActivity('error', `Insufficient USDC balance. Need ${requiredAmount.toFixed(6)} USDC, have ${currentBalance.toFixed(6)} USDC`, {
        required: requiredAmount,
        available: currentBalance,
        difference: (requiredAmount - currentBalance).toFixed(6),
        usdcAddress: USDC_ADDRESS
      })
      return
    }

    // NETWORK CHECK
    if (!isOnArcTestnet) {
      setAgentState('error')
      addActivity('error', `Please switch to Arc Testnet (Chain ID: 5042002). Current: ${chainId}`)
      return
    }

    setAgentState('approving-payment')
    addActivity('payment', 'Payment approved - executing REAL USDC transaction...', {
      amount: requiredAmount,
      fromBalance: currentBalance.toFixed(6),
      expectedNewBalance: (currentBalance - requiredAmount).toFixed(6),
      recipient: payment402Data.payment.recipient
    })
    setPendingAmount(payment402Data.payment.amount)

    await new Promise(resolve => setTimeout(resolve, 800))
    setAgentState('processing-payment')

    try {
      const recipient = getAddress(payment402Data.payment.recipient)

      // CORRECT: USDC has 6 decimals
      const amountInUnits = parseUnits(payment402Data.payment.amount, USDC_DECIMALS)

      console.log('🚀 Sending REAL USDC Transaction:', {
        to: recipient,
        amount: payment402Data.payment.amount,
        value: amountInUnits.toString(),
        formatted: formatUnits(amountInUnits, USDC_DECIMALS),
        chainId,
        currentBalance: currentBalance.toFixed(6),
        from: address,
        usdcAddress: USDC_ADDRESS
      })

      // SEND REAL TRANSACTION
      sendTransaction({
        to: recipient,
        value: amountInUnits,
        chainId: 5042002,
      }, {
        onSuccess: (hash) => {
          console.log('✅ REAL Transaction Submitted! Hash:', hash)
          setTxHash(hash)
          addActivity('payment', `Sending ${payment402Data.payment.amount} USDC (REAL TRANSACTION)`, { 
            txHash: hash,
            realTransaction: true,
            amount: payment402Data.payment.amount,
            explorerUrl: `https://testnet.arcscan.app/tx/${hash}`,
            from: address,
            to: recipient,
            oldBalance: currentBalance.toFixed(6),
            expectedNewBalance: (currentBalance - requiredAmount).toFixed(6)
          })
        },
        onError: (error) => {
          console.error('❌ Transaction Failed:', error)
          setPendingAmount(null)
          setAgentState('payment-required')

          if (error.message.includes('user rejected') || error.message.includes('rejected')) {
            addActivity('error', 'Transaction rejected by user in MetaMask')
          } else if (error.message.includes('insufficient funds')) {
            addActivity('error', 'Insufficient USDC balance for transaction + gas', {
              error: error.message,
              currentBalance: currentBalance.toFixed(6)
            })
          } else {
            addActivity('error', 'Transaction failed', { 
              error: error instanceof Error ? error.message : 'Unknown error' 
            })
          }
        }
      })

    } catch (error) {
      console.error('❌ Payment Error:', error)
      setAgentState('error')
      setPendingAmount(null)
      addActivity('error', 'Payment failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  // Manual network switch
  const handleSwitchNetwork = async () => {
    if (!window.ethereum) {
      addActivity('error', 'MetaMask not detected')
      return
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4d07a2' }],
      })
      addActivity('idle', 'Switched to Arc Testnet')
      // Refresh balance after network switch
      setTimeout(() => refetchBalance(), 2000)
    } catch (error: any) {
      console.error('Network switch failed:', error)
      addActivity('error', 'Failed to switch network')
    }
  }

  // FIXED: MANUAL BALANCE REFRESH
  const handleRefreshBalance = async () => {
    addActivity('idle', 'Manually refreshing balance from blockchain...')
    try {
      await refetchBalance()
      setManualRefreshCounter(prev => prev + 1)
      addActivity('idle', `Balance refreshed: ${balanceNumber.toFixed(6)} USDC`, {
        balance: balanceNumber.toFixed(6),
        timestamp: new Date().toISOString(),
        address: address,
        usdcAddress: USDC_ADDRESS
      })
    } catch (error) {
      addActivity('error', 'Failed to refresh balance', { error: String(error) })
    }
  }

  // Reset demo
  const handleReset = () => {
    setAgentState('idle')
    setSelectedService(null)
    setPayment402Data(null)
    setServiceData(null)
    setTxHash(null)
    setPendingAmount(null)
    setShowConfetti(false)
    addActivity('idle', 'Demo reset - ready for new request', {
      currentBalance: balanceNumber.toFixed(6),
      mode: transactionMode
    })
  }

  const isProcessing = ['requesting', 'approving-payment', 'processing-payment', 'verifying'].includes(agentState)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Bot className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold">AI Agent Commerce Platform</h1>
                <p className="text-xs text-muted-foreground">HTTP 402 Micropayments on Arc Testnet</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={isOnArcTestnet ? "success" : "destructive"}>
                {isOnArcTestnet ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Arc Testnet
                  </span>
                ) : `Chain: ${chainId}`}
              </Badge>
              <Badge variant={hasBalance ? "success" : "secondary"}>
                <span className="flex items-center gap-1">
                  {balanceNumber.toFixed(2)} USDC
                  <button 
                    onClick={handleRefreshBalance}
                    className="ml-1 p-0.5 hover:bg-accent/20 rounded"
                    title="Refresh balance"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </span>
              </Badge>
              <Badge variant={transactionMode === 'real' ? "default" : "outline"}>
                {transactionMode === 'real' ? (
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Real Mode
                  </span>
                ) : 'Simulation'}
              </Badge>
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Transaction Mode Banner */}
        {transactionMode === 'real' ? (
          <Alert className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800">Real Transaction Mode Active</p>
                  <p className="text-sm text-green-700 mt-1">
                    Payments will send real USDC on Arc Testnet. Balance updates automatically every 3 seconds.
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Current: {balanceNumber.toFixed(6)} USDC • Address: {USDC_ADDRESS.slice(0, 8)}...
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshBalance}
                  className="border-green-300 text-green-700 hover:bg-green-100 gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh
                </Button>
                {txHash && (
                  <a 
                    href={`https://testnet.arcscan.app/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:underline inline-flex items-center gap-1 px-3 py-1.5 border border-accent/30 rounded-md hover:bg-accent/5"
                  >
                    View Tx
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="info" className="mb-6">
            <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <PartyPopper className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Simulation Mode Active</p>
                  <p className="text-sm mt-1">
                    {!hasBalance 
                      ? 'Get testnet USDC from faucet.circle.com for real transactions' 
                      : 'Switch to Arc Testnet for real transactions'}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Balance: {balanceNumber.toFixed(6)} USDC • Chain ID: {chainId}
                  </p>
                </div>
              </div>
              {!hasBalance ? (
                <a 
                  href="https://faucet.circle.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline px-3 py-1.5 border border-accent/30 rounded-md hover:bg-accent/5"
                >
                  Get USDC
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSwitchNetwork}
                  className="gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Switch Network
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agent Status */}
            <AgentStatus 
              state={agentState} 
              balance={balanceNumber.toFixed(6)}
              pendingAmount={pendingAmount}
              transactionMode={transactionMode}
            />

            {/* How It Works */}
            <HowItWorks />

            {/* Service Selector */}
            <ServiceSelector
              selectedService={selectedService}
              onSelectService={setSelectedService}
              onRequestService={handleRequestService}
              disabled={!isConnected || isProcessing}
              transactionMode={transactionMode}
              currentBalance={balanceNumber}
            />

            {/* Payment Flow */}
            {(payment402Data || agentState !== 'idle') && (
              <PaymentFlow
                state={agentState}
                payment402Data={payment402Data}
                txHash={txHash}
                serviceData={serviceData}
                onApprovePayment={handleApprovePayment}
                transactionMode={transactionMode}
                currentBalance={balanceNumber}
              />
            )}

            {/* Service Response */}
            {serviceData && selectedService && (
              <ServiceResponse
                serviceId={selectedService.id}
                serviceName={selectedService.name}
                data={serviceData}
                transactionMode={transactionMode}
              />
            )}

            {/* Reset Button */}
            {(agentState === 'success' || agentState === 'error') && (
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {agentState === 'success' ? 'Try Another Service' : 'Try Again'}
              </Button>
            )}
          </div>

          {/* Right Column - Activity Log */}
          <div className="lg:col-span-1">
            <ActivityLog activities={activities} />
          </div>
        </div>

        {/* Footer with Stats */}
        <footer className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Built for Arc Hackathon • Powered by Circle & Arc Testnet
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Demonstrating autonomous AI agent commerce with HTTP 402 micropayments
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <div className="text-center bg-gradient-to-br from-blue-500/10 to-cyan-500/20 p-4 rounded-xl border border-blue-500/20 min-w-[100px]">
                <div className="text-lg font-bold text-accent">
                  {balanceNumber.toFixed(6)}
                </div>
                <div className="text-xs text-muted-foreground">USDC Balance</div>
                <div className="text-xs text-green-600 mt-1">
                  Live from Blockchain
                </div>
              </div>
              <div className="text-center bg-gradient-to-br from-purple-500/10 to-pink-500/20 p-4 rounded-xl border border-purple-500/20 min-w-[100px]">
                <div className="text-lg font-bold text-accent">
                  {activities.filter(a => a.type === 'success' || a.type === 'unlock').length}
                </div>
                <div className="text-xs text-muted-foreground">Services Used</div>
                <div className="text-xs text-purple-600 mt-1">
                  This session
                </div>
              </div>
              <div className="text-center bg-gradient-to-br from-green-500/10 to-emerald-500/20 p-4 rounded-xl border border-green-500/20 min-w-[100px]">
                <div className={`text-lg font-bold ${transactionMode === 'real' ? 'text-green-600' : 'text-gray-600'}`}>
                  {transactionMode === 'real' ? 'Real' : 'Sim'}
                </div>
                <div className="text-xs text-muted-foreground">Transaction Mode</div>
                <div className={`text-xs ${transactionMode === 'real' ? 'text-green-600' : 'text-gray-600'} mt-1`}>
                  {transactionMode === 'real' ? 'On-chain' : 'Local'}
                </div>
              </div>
            </div>

            {transactionMode === 'real' && (
              <p className="mt-4 text-xs text-green-600 flex items-center justify-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Real transaction mode active. Payments send actual USDC on-chain. Auto-refresh every 3s.
              </p>
            )}
          </div>
        </footer>
      </main>
    </div>
  )
}
