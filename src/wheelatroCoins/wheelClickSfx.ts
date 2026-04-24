// Shared with `coinSfx.ts` pattern: keep a single AudioContext.
let audioContext: AudioContext | null = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!audioContext) audioContext = new Ctor()
  if (audioContext.state === 'suspended') {
    void audioContext.resume()
  }
  return audioContext
}

/**
 * A short, mechanical "wheel tick" / plastic click, meant for the Spin button.
 */
export function playWheelClick() {
  const ctx = getAudioContext()
  if (!ctx) return

  const t0 = ctx.currentTime
  const duration = 0.035

  const out = ctx.createGain()
  out.gain.setValueAtTime(0.0001, t0)
  out.gain.exponentialRampToValueAtTime(0.22, t0 + 0.002)
  out.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  out.connect(ctx.destination)

  // Click body
  const body = ctx.createOscillator()
  body.type = 'square'
  body.frequency.setValueAtTime(520, t0)
  body.frequency.exponentialRampToValueAtTime(180, t0 + duration)
  const bodyGain = ctx.createGain()
  bodyGain.gain.setValueAtTime(0.12, t0)
  body.connect(bodyGain)
  bodyGain.connect(out)
  body.start(t0)
  body.stop(t0 + duration)

  // High "tick" edge
  const edge = ctx.createOscillator()
  edge.type = 'sine'
  edge.frequency.setValueAtTime(3600, t0)
  edge.frequency.exponentialRampToValueAtTime(2200, t0 + 0.02)
  const edgeGain = ctx.createGain()
  edgeGain.gain.setValueAtTime(0.08, t0)
  edgeGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.02)
  edge.connect(edgeGain)
  edgeGain.connect(out)
  edge.start(t0)
  edge.stop(t0 + duration)
}
