import { cn } from "@/lib/utils"

interface QRCodeDisplayProps {
  data: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = { sm: 120, md: 180, lg: 240 }

export function QRCodeDisplay({ data, size = "md", className }: QRCodeDisplayProps) {
  const dim = sizeMap[size]
  const pattern = generatePattern(data)

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-xl border-2 border-foreground/10 bg-white p-3 shadow-sm",
        className
      )}
    >
      <svg width={dim} height={dim} viewBox="0 0 25 25" className="block">
        {pattern.map((row, y) =>
          row.map((cell, x) =>
            cell ? (
              <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0f172a" />
            ) : null
          )
        )}
        {/* Corner markers */}
        <rect x={0} y={0} width={7} height={7} fill="none" stroke="#0f172a" strokeWidth={0.5} />
        <rect x={2} y={2} width={3} height={3} fill="#0f172a" />
        <rect x={18} y={0} width={7} height={7} fill="none" stroke="#0f172a" strokeWidth={0.5} />
        <rect x={20} y={2} width={3} height={3} fill="#0f172a" />
        <rect x={0} y={18} width={7} height={7} fill="none" stroke="#0f172a" strokeWidth={0.5} />
        <rect x={2} y={20} width={3} height={3} fill="#0f172a" />
      </svg>
    </div>
  )
}

function generatePattern(seed: string): boolean[][] {
  const grid: boolean[][] = Array.from({ length: 25 }, () => Array(25).fill(false))
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  for (let y = 0; y < 25; y++) {
    for (let x = 0; x < 25; x++) {
      if ((x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16)) continue
      hash = (hash * 1103515245 + 12345) & 0x7fffffff
      grid[y][x] = hash % 3 !== 0
    }
  }
  return grid
}
