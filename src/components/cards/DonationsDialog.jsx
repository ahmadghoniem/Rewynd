import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Clipboard, CheckCircle, ExternalLink } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"

const DonationsDialog = ({ open, onOpenChange }) => {
  const [copiedAddress, setCopiedAddress] = useState(null)

  const cryptoAddresses = [
    {
      name: "Solana",
      address: "F5PNVTk6KcLaVbDH5GY4pVGf8JPJcx7RJS8FyuvdrL2Z",
      symbol: "SOL",
      icon: "/solana-SOL-logo.svg"
    },
    {
      name: "Ethereum",
      address: "0x1c1CB2484Af7BF22eF4247671626eCeed04E8169",
      symbol: "ETH",
      icon: "/ethereum-ETH-logo.png"
    },
    {
      name: "Base",
      address: "0x1c1CB2484Af7BF22eF4247671626eCeed04E8169",
      symbol: "BASE",
      icon: "/base-BASE-logo.png"
    },
    {
      name: "Sui",
      address:
        "0x47c969b1b79ddf7fbdafb3c52b22b57412ef9368eb4c563460bdda3098f329fb",
      symbol: "SUI",
      icon: "/sui-SUI-logo.png"
    },
    {
      name: "Polygon",
      address: "0x1c1CB2484Af7BF22eF4247671626eCeed04E8169",
      symbol: "MATIC",
      icon: "/polygon-MATIC-logo.png"
    },
    {
      name: "Bitcoin",
      address: "bc1qy537v6fqn9p3jqv2dtknfd5uumyrwzes5nvru2",
      symbol: "BTC",
      icon: "/bitcoin-BTC-logo.png"
    }
  ]

  const handleCopyToClipboard = async (address, cryptoName) => {
    const success = await copyToClipboard(address)
    if (success) {
      setCopiedAddress(cryptoName)
      setTimeout(() => setCopiedAddress(null), 2000)
    }
  }

  const getExplorerUrl = (crypto) => {
    const explorerUrls = {
      Solana: `https://solscan.io/account/${crypto.address}`,
      Ethereum: `https://etherscan.io/address/${crypto.address}`,
      Base: `https://basescan.org/address/${crypto.address}`,
      Sui: `https://suivision.xyz/account/${crypto.address}`,
      Polygon: `https://polygonscan.com/address/${crypto.address}`,
      Bitcoin: `https://blockstream.info/address/${crypto.address}`
    }
    return explorerUrls[crypto.name] || "#"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-card bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>💝</span>
            Support Rewynd Development
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enjoying Rewynd? If you’d like to support its development, consider
            buying me a coffee — even $3 can go a long way.
            <br />
            You can also share your{" "}
            <a
              href="https://x.com/ghoniemcodes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              feedback
            </a>
            , which is just as valuable.
          </p>

          <div className="space-y-3">
            {cryptoAddresses.map((crypto) => (
              <div
                key={crypto.name}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={crypto.icon}
                    alt={`${crypto.name} logo`}
                    className="w-6 h-6 object-contain"
                  />
                  <div>
                    <div className="font-medium">{crypto.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {crypto.address.length > 20
                        ? `${crypto.address.slice(
                            0,
                            10
                          )}...${crypto.address.slice(-10)}`
                        : crypto.address}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleCopyToClipboard(crypto.address, crypto.name)
                    }
                    className="h-8 w-8 p-0"
                  >
                    {copiedAddress === crypto.name ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clipboard className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(getExplorerUrl(crypto), "_blank")
                    }
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DonationsDialog
