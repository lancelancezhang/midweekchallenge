import { useEffect, useMemo, useRef, useState } from 'react'
import type { CoinSlice } from './types'

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export function CoinWheel({
  slices,
  outcomeSliceId,
  spinning,
  onDone,
  embedded,
  className,
  style,
}: {
  slices: CoinSlice[]
  outcomeSliceId: string | null
  spinning: boolean
  onDone?: () => void
  embedded?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  const segmentDeg = 360 / slices.length

  const gradient = useMemo(() => {
    const colors = slices.map((s) => (s.kind === 'coin' ? '#FBBF24' : '#E2E8F0'))
    const stops: string[] = []
    for (let i = 0; i < colors.length; i++) {
      const start = i * segmentDeg
      const end = (i + 1) * segmentDeg
      stops.push(`${colors[i]} ${start}deg ${end}deg`)
    }
    return `conic-gradient(${stops.join(', ')})`
  }, [segmentDeg, slices])

  const [rotation, setRotation] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!spinning) return
    if (!outcomeSliceId) return

    const targetIndex = Math.max(0, slices.findIndex((s) => s.id === outcomeSliceId))
    const targetCenterDeg = targetIndex * segmentDeg + segmentDeg / 2
    const extraSpins = 6 * 360
    const currentMod = ((rotation % 360) + 360) % 360
    const desiredMod = (360 - targetCenterDeg) % 360
    const deltaToDesired = (desiredMod - currentMod + 360) % 360
    const target = rotation + extraSpins + deltaToDesired

    const start = rotation
    const delta = target - start
    const durationMs = 1800
    const t0 = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / durationMs)
      const eased = easeOutExpo(t)
      setRotation(start + delta * eased)

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = null
        onDone?.()
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, outcomeSliceId])

  const wheelBody = (
    <div className="wheelatroWrap">
      <div
        className="wheelatroWheel"
        style={{
          backgroundImage: gradient,
          transform: `rotate(${rotation - 90}deg)`,
        }}
      />
      <div className="wheelatroLabels" style={{ transform: `rotate(${rotation - 90}deg)` }} aria-hidden="true">
        {slices.map((s, i) => {
          const a = i * segmentDeg + segmentDeg / 2
          return (
            <div key={s.id} className="wheelatroLabelItem" style={{ transform: `rotate(${a}deg)` }}>
              <div className="wheelatroLabelText">{s.kind === 'coin' ? 'COIN' : '—'}</div>
            </div>
          )
        })}
      </div>
      <div className="wheelatroHub" aria-hidden="true" />
    </div>
  )

  if (embedded) {
    return (
      <div className={className} style={style} aria-label="Coin wheel">
        {wheelBody}
      </div>
    )
  }

  return (
    <div className="wheelatroStage" aria-label="Coin wheel">
      <div className="wheelatroPointer" aria-hidden="true" />
      {wheelBody}
    </div>
  )
}

