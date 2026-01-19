import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Wallet, LogOut, AlertTriangle } from 'lucide-react'
import { NetworkArc } from '@web3icons/react'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const isWrongNetwork = isConnected && chainId !== 5042002

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        {isWrongNetwork ? (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => switchChain({ chainId: 5042002 })}
          >
            <AlertTriangle className="h-4 w-4" />
            Switch to Arc Testnet
          </Button>
        ) : (
          <Badge variant="success" className="gap-2 px-3 py-1.5">
            <NetworkArc size={14} variant="branded" />
            <span className="font-mono text-xs">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </Badge>
        )}
        <Button variant="outline" size="icon" onClick={() => disconnect()}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const connector = connectors[0]

  return (
    <Button variant="accent" onClick={() => connect({ connector })} disabled={isPending}>
      {isPending ? (
        <>
          <Spinner size={16} />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  )
}
