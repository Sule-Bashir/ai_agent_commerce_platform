import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Button } from '@/components/ui/button'

export function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      // Small delay to prevent UI freeze
      await new Promise(resolve => setTimeout(resolve, 300))
      connect({ 
        connector: injected({ target: 'metaMask' }),
        onError: (error) => {
          console.error('Connection error:', error)
          setIsConnecting(false)
        }
      })
    } catch (error) {
      console.error('Connect failed:', error)
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    try {
      disconnect()
    } catch (error) {
      console.error('Disconnect failed:', error)
    }
  }

  // Auto-reset connecting state
  useEffect(() => {
    if (isConnected) {
      setIsConnecting(false)
    }
  }, [isConnected])

  if (isConnected && address) {
    return (
      <Button 
        variant="outline"
        onClick={handleDisconnect}
        className="truncate max-w-[180px]"
        title={address}
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    )
  }

  return (
    <Button
      variant="accent"
      onClick={handleConnect}
      disabled={isConnecting}
      className="min-w-[140px]"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )
}
