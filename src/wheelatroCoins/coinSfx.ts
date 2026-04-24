let audioContext: AudioContext | null = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!audioContext) audioContext = new Ctor()
  if (audioContext.state === 'suspended') {
    // Browser autoplay rules: this may still be blocked if called without a prior user gesture.
    void audioContext.resume()
  }
  return audioContext
}

/**
 * A short, metallic "coin clink" using WebAudio (no external asset required).
 */
export function playCoinClink() {
  const ctx = getAudioContext()
  if (!ctx) return

  const t0 = ctx.currentTime
  const duration = 0.2

  const out = ctx.createGain()
  out.gain.setValueAtTime(0.0001, t0)
  out.gain.exponentialRampToValueAtTime(0.2, t0 + 0.01)
  out.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  out.connect(ctx.destination)

  // Primary bright strike
  const a = ctx.createOscillator()
  a.type = 'sine'
  a.frequency.setValueAtTime(1900, t0)
  a.frequency.exponentialRampToValueAtTime(1050, t0 + 0.12)
  const aGain = ctx.createGain()
  aGain.gain.setValueAtTime(0.55, t0)
  a.connect(aGain)
  aGain.connect(out)
  a.start(t0)
  a.stop(t0 + duration)

  // Metallic edge (higher, shorter)
  const b = ctx.createOscillator()
  b.type = 'triangle'
  b.frequency.setValueAtTime(2550, t0)
  b.frequency.exponentialRampToValueAtTime(1750, t0 + 0.08)
  const bGain = ctx.createGain()
  bGain.gain.setValueAtTime(0.18, t0)
  bGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.1)
  b.connect(bGain)
  bGain.connect(out)
  b.start(t0)
  b.stop(t0 + duration)
}
