import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Clipboard, CheckCircle, Github } from "lucide-react"
import { cn, copyToClipboard, shortenAddress } from "@/lib/utils"

const FooterCard = ({ className }) => {
  const [copiedAddress, setCopiedAddress] = useState(null)

  // Crypto donation address (replace with your actual address)
  const usdtAddress = "TQn9Y2khDD95J42FQtQTdwVVRjqQZ6Zg9g"

  const handleCopyToClipboard = async (address) => {
    const success = await copyToClipboard(address)
    if (success) {
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    }
  }

  return (
    <Card className={cn("flex-1", className)}>
      <CardContent className="flex flex-1 flex-col justify-between text-xs font-medium pt-0">
        {/* Main Footer Content */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex flex-1 justify-around items-center text-base">
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-primary fill-primary" />
              <span>for traders</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="mr-2 text-border">|</span>
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/yourusername/FxReplayFunded"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                  title="GitHub"
                >
                  <Github className="h-4 w-4 fill-current" />
                </a>
                <a
                  href="https://x.com/yourusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                  title="X (Twitter)"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* USDT Donation Section */}
        <div className="border-t border-border pt-2">
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="text-muted-foreground">Support:</span>

            {/* USDT Donation */}
            <div className="flex items-center gap-2 group">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">USDT:</span>
                <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                  {shortenAddress(usdtAddress)}
                </code>
                <button
                  onClick={() => handleCopyToClipboard(usdtAddress)}
                  className="p-1 hover:bg-muted/80 rounded transition-colors"
                  title="Copy USDT address"
                >
                  {copiedAddress ? (
                    <CheckCircle className="h-4 w-4 text-green-500 fill-current" />
                  ) : (
                    <Clipboard className="h-4 w-4 text-muted-foreground group-hover:text-foreground fill-current" />
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
