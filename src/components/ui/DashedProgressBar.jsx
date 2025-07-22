import React from "react"

const DashedProgressBar = ({
  progress = 0, // 0-1 or 0-100
  numDashes = 10,
  filledColor = "#2563eb",
  emptyColor = "#f1f5f9",
  height = 12,
  radius = 4,
  className = "",
  style = {}
}) => {
  // Normalize progress to 0-1
  const normalized = progress > 1 ? progress / 100 : progress
  const filled = Math.round(normalized * numDashes)

  return (
    <div
      className={`flex gap-1 w-full items-center ${className}`}
      style={{ ...style }}
    >
      {Array.from({ length: numDashes }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height,
            borderRadius: radius,
            background: i < filled ? filledColor : emptyColor,
            transition: "background 0.3s"
          }}
        />
      ))}
    </div>
  )
}

export default DashedProgressBar 