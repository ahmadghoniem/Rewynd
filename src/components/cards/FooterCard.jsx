import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Copy, Check, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

const FooterCard = ({ className }) => {
  const [copiedAddress, setCopiedAddress] = useState(null)

  // Crypto donation address (replace with your actual address)
  const usdtAddress = "TQn9Y2khDD95J42FQtQTdwVVRjqQZ6Zg9g"

  const copyToClipboard = async (address) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-3">
        {/* Main Footer Content */}
        <div className="flex items-center justify-center text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-2">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            <span>for traders</span>
          </div>
        </div>

        {/* USDT Donation Section */}
        <div className="border-t border-border pt-2">
          <div className="flex items-center justify-center gap-3 text-xs">
            <span className="text-muted-foreground">Support the project:</span>

            {/* USDT Donation */}
            <div className="flex items-center gap-2 group">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">USDT:</span>
                <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                  {shortenAddress(usdtAddress)}
                </code>
                <button
                  onClick={() => copyToClipboard(usdtAddress)}
                  className="p-1 hover:bg-muted/80 rounded transition-colors"
                  title="Copy USDT address"
                >
                  {copiedAddress ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default FooterCard
