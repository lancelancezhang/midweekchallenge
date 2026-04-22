import { useEffect, useMemo, useRef, useState } from 'react'
import type { MemberName } from '../types'
import { MEMBER_BY_NAME, MEMBERS } from '../data/members'

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function randomInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive)
}

const STORAGE_KEY = 'midweekchallenge:wheelCounts:v1'

function loadCounts(): Partial<Record<MemberName, number>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as Partial<Record<MemberName, number>>
  } catch {
    return {}
  }
}

function saveCounts(counts: Partial<Record<MemberName, number>>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts))
  } catch {
    // ignore
  }
}

export function SpinningWheel() {
  const names = useMemo(() => MEMBERS.map((m) => m.name), [])
  const colors = useMemo(() => MEMBERS.map((m) => m.color), [])
  const segmentDeg = 360 / names.length

  const gradient = useMemo(() => {
    const stops: string[] = []
    for (let i = 0; i < colors.length; i++) {
      const start = i * segmentDeg
      const end = (i + 1) * segmentDeg
      stops.push(`${colors[i]} ${start}deg ${end}deg`)
    }
    return `conic-gradient(${stops.join(', ')})`
  }, [colors, segmentDeg])

  const [rotation, setRotation] = useState(0) // degrees
  const [spinning, setSpinning] = useState(false)
  const [selected, setSelected] = useState<MemberName | null>(null)
  const [counts, setCounts] = useState<Partial<Record<MemberName, number>>>(() =>
    loadCounts(),
  )
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!selected) return
    setCounts((cur) => {
      const next = { ...cur, [selected]: (cur[selected] ?? 0) + 1 }
      saveCounts(next)
      return next
    })
  }, [selected])

  const spin = () => {
    if (spinning) return
    setSpinning(true)

    const targetIndex = randomInt(names.length)
    const targetName = names[targetIndex]

    // The wheel is rotated by -90deg in CSS so index 0 starts at the top.
    // Keep the arrow on the left visually, but use the original "top pointer"
    // landing logic for where the wheel stops.
    const targetCenterDeg = targetIndex * segmentDeg + segmentDeg / 2
    const extraSpins = 8 * 360
    const currentMod = ((rotation % 360) + 360) % 360
    const desiredMod = (360 - targetCenterDeg) % 360
    const deltaToDesired = (desiredMod - currentMod + 360) % 360
    const target = rotation + extraSpins + deltaToDesired

    const start = rotation
    const delta = target - start
    const durationMs = 9000
    const t0 = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / durationMs)
      const eased = easeOutExpo(t)
      setRotation(start + delta * eased)

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = null
        setSelected(targetName)
        setSpinning(false)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  return (
    <section className="wheelCard">
      <div className="wheelStage">
        <div className="wheelPointer" aria-hidden="true" />
        <div className="wheelWrap" aria-label="Spinning wheel">
          <div
            className="wheel"
            style={{
              backgroundImage: gradient,
              transform: `rotate(${rotation - 90}deg)`,
            }}
          />
          <div
            className="wheelLabels"
            style={{ transform: `rotate(${rotation - 90}deg)` }}
            aria-hidden="true"
          >
            {names.map((name, i) => {
              const a = i * segmentDeg + segmentDeg / 2
              return (
                <div
                  key={name}
                  className="wheelLabelItem"
                  style={{ transform: `rotate(${a}deg)` }}
                >
                  <div className="wheelLabelText">{name}</div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="wheelHub" aria-hidden="true" />
      </div>

      <div className="wheelControls">
        <button className="btn" onClick={spin} disabled={spinning}>
          {spinning ? 'Spinning…' : 'Spin'}
        </button>

        <div className="wheelResult">
          <div className="wheelLabel">Result</div>
          <div className="wheelValue">{selected ?? '—'}</div>
        </div>
      </div>

      <div className="hist">
        <div className="histBars" role="list" aria-label="Wheel results histogram">
          {names.map((name) => {
            const value = counts[name] ?? 0
            const max =
              Math.max(1, ...names.map((n) => (counts[n] ?? 0) as number)) || 1
            const pct = (value / max) * 100
            const color = MEMBER_BY_NAME[name].color
            return (
              <div key={name} className="histRow" role="listitem">
                <div className="histName">{name}</div>
                <div className="histTrack" aria-label={`${name}: ${value}`}>
                  <div
                    className="histBar"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <div className="histValue">{value}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

