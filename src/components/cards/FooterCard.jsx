import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Github, HandHeart } from "lucide-react"
import { cn } from "@/lib/utils"
import DonationsDialog from "./DonationsDialog"

const FooterCard = ({ className }) => {
  const [donationsOpen, setDonationsOpen] = useState(false)

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
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center">
                <button
                  onClick={() => setDonationsOpen(true)}
                  variant="ghost"
                  className="hover:text-foreground transition-colors cursor-pointer"
                  title="Support Development"
                >
                  <HandHeart className="h-4 w-4" />
                </button>
              </div>
              <span className="text-border">|</span>
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/ahmadghoniem/Rewynd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                  title="GitHub"
                >
                  <Github className="h-4 w-4 fill-current" />
                </a>
                <a
                  href="https://x.com/ghoniemcodes"
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
          <span>
            © 2025 Rewynd— Not affiliated with FxReplay and intended solely for
            educational practice, not financial guidance.
          </span>
        </div>
      </CardContent>

      <DonationsDialog open={donationsOpen} onOpenChange={setDonationsOpen} />
    </Card>
  )
}

export default FooterCard
