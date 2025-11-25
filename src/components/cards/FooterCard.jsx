import { Card, CardContent } from "@/components/ui/card"
import { Heart, Github } from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const FooterCard = ({ className }) => {
  return (
    <Card className={cn("flex-1 py-2", className)}>
      <CardContent className="flex flex-1 flex-col justify-between text-xs font-medium pt-0 px-3">
        {/* Main Footer Content */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex flex-1 justify-between items-center text-base pb-1">
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-primary fill-primary" />
              <span>for traders</span>
            </div>
            <div className="flex items-center justify-between gap-1">
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
        {/* Separator */}
        <Separator orientation="horizontal" className="mb-2" />
        <div>
          <span>
            © 2025 Rewynd— Not affiliated with FxReplay and intended solely for
            educational practice, not financial guidance.
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default FooterCard
