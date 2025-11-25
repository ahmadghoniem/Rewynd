import { useState } from "react"
import { HandHeart } from "lucide-react"
import DonationsDialog from "./DonationsDialog"

const FloatingDonateButton = () => {
  const [donationsOpen, setDonationsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setDonationsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
        title="Support Development"
        aria-label="Donate"
      >
        <HandHeart className="h-6 w-6" />
      </button>

      <DonationsDialog open={donationsOpen} onOpenChange={setDonationsOpen} />
    </>
  )
}

export default FloatingDonateButton
