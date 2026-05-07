import type { CoinSlice, CoinSliceKind, CoinatroState } from './types'

function fibFrom1And2(n: number) {
  // sequence: 1, 2, 3, 5, 8, ...
  if (n <= 0) return 1
  if (n === 1) return 2
  let a = 1
  let b = 2
  for (let i = 2; i <= n; i++) {
    const c = a + b
    a = b
    b = c
  }
  return b
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function coinValue(state: CoinatroState) {
  return fibFrom1And2(state.coinValueLevel)
}

export function coinValueNext(state: CoinatroState) {
  return fibFrom1And2(state.coinValueLevel + 1)
}

export function costCoinValue(state: CoinatroState) {
  return Math.max(2, Math.floor(2 * Math.pow(2, state.coinValueLevel)))
}

export function costAddSlice(state: CoinatroState) {
  return Math.ceil(6 * Math.pow(1.5, state.addSliceLevel))
}

export function costRemoveBlank(state: CoinatroState) {
  return Math.ceil(8 * Math.pow(1.6, state.removeBlankLevel))
}

export function trueOdds(state: CoinatroState) {
  const coin = state.slices.filter((s) => s.kind === 'coin').length
  return state.slices.length > 0 ? coin / state.slices.length : 0
}

export function addSliceCoinChance(state: CoinatroState) {
  // Start at 50/50, then upgrades gently bias toward coin slices.
  const chance = 0.5 + state.addSliceLevel * 0.08 + state.removeBlankLevel * 0.05
  return clamp(chance, 0.1, 0.9)
}

export function createInitialState(): CoinatroState {
  const slices: CoinSlice[] = [
    { id: 'coin-1', kind: 'coin', label: 'COIN' },
    ...Array.from({ length: 8 }).map((_, i) => ({
      id: `blank-${i + 1}`,
      kind: 'blank' as const,
      label: '—',
    })),
  ]
  return {
    spinCount: 0,
    coinHitCount: 0,
    coinStreak: 0,
    coins: 0,
    coinValueLevel: 0,
    addSliceLevel: 0,
    removeBlankLevel: 0,
    hasStreak5Double: false,
    miniWheelLevel: 0,
    slices,
    lastResult: null,
    lastMessage: null,
  }
}

export function rollSlice(slices: CoinSlice[]) {
  const idx = Math.floor(Math.random() * slices.length)
  return slices[idx]
}

export function resolveSpin(
  state: CoinatroState,
  landed: CoinSlice,
  miniLandeds?: Array<CoinSlice | null> | null,
): CoinatroState {
  const mainWin = landed.kind === 'coin'
  const miniWins = (miniLandeds ?? []).filter((s): s is CoinSlice => Boolean(s)).filter((s) => s.kind === 'coin').length

  const mainGain = mainWin ? coinValue(state) : 0
  const miniGain = miniWins * coinValue(state)
  const totalGain = mainGain + miniGain

  const nextStreak = mainWin ? state.coinStreak + 1 : 0
  let nextCoins = state.coins + totalGain

  const parts: string[] = []
  if (mainWin) parts.push(`Main COIN (+${mainGain})`)
  if (miniWins > 0) parts.push(`Mini COIN x${miniWins} (+${miniGain})`)
  if (!mainWin && miniWins === 0) parts.push('Nothing…')

  if (state.hasStreak5Double && mainWin && nextStreak === 5) {
    nextCoins *= 2
    parts.push('Streak 5! Coins doubled.')
  }

  return {
    ...state,
    spinCount: state.spinCount + 1,
    coinHitCount: state.coinHitCount + (mainWin ? 1 : 0),
    coinStreak: nextStreak,
    coins: nextCoins,
    lastResult: landed,
    lastMessage: parts.join(' · '),
  }
}

export function costStreak5Double() {
  return 20
}

export function buyStreak5Double(state: CoinatroState): CoinatroState {
  if (state.hasStreak5Double) return state
  const cost = costStreak5Double()
  if (state.coins < cost) return { ...state, lastMessage: 'Not enough coins.' }
  return {
    ...state,
    coins: state.coins - cost,
    hasStreak5Double: true,
    lastMessage: 'Unlocked: Streak 5 doubles your coins.',
  }
}

export function costMiniWheel(state: CoinatroState) {
  const base = 40
  return base * Math.pow(2, state.miniWheelLevel)
}

export function buyMiniWheel(state: CoinatroState): CoinatroState {
  if (state.miniWheelLevel >= 3) return state
  const cost = costMiniWheel(state)
  if (state.coins < cost) return { ...state, lastMessage: 'Not enough coins.' }
  return {
    ...state,
    coins: state.coins - cost,
    miniWheelLevel: state.miniWheelLevel + 1,
    lastMessage: state.miniWheelLevel === 0 ? 'Unlocked: Mini wheel.' : 'Added another mini wheel.',
  }
}

export function miniWheelSlices(): CoinSlice[] {
  return [
    { id: 'mini-coin', kind: 'coin', label: 'COIN' },
    { id: 'mini-blank-1', kind: 'blank', label: '—' },
    { id: 'mini-blank-2', kind: 'blank', label: '—' },
    { id: 'mini-blank-3', kind: 'blank', label: '—' },
  ]
}

export function buyCoinValue(state: CoinatroState): CoinatroState {
  const cost = costCoinValue(state)
  if (state.coins < cost) return { ...state, lastMessage: 'Not enough coins.' }
  return {
    ...state,
    coins: state.coins - cost,
    coinValueLevel: state.coinValueLevel + 1,
    lastMessage: `Coin value upgraded to ${coinValueNext(state)} next time.`,
  }
}

export function buyAddSlice(state: CoinatroState): CoinatroState {
  const cost = costAddSlice(state)
  if (state.coins < cost) return { ...state, lastMessage: 'Not enough coins.' }

  const addCoin = Math.random() < addSliceCoinChance(state)
  const nextId = `${addCoin ? 'coin' : 'blank'}-${state.slices.length + 1}`
  const newSlice: CoinSlice = addCoin
    ? { id: nextId, kind: 'coin', label: 'COIN' }
    : { id: nextId, kind: 'blank', label: '—' }

  return {
    ...state,
    coins: state.coins - cost,
    addSliceLevel: state.addSliceLevel + 1,
    slices: [...state.slices, newSlice],
    lastMessage: addCoin ? 'Added a COIN slice.' : 'Added a blank slice (unlucky).',
  }
}

export function buyRemoveBlank(state: CoinatroState): CoinatroState {
  const cost = costRemoveBlank(state)
  if (state.coins < cost) return { ...state, lastMessage: 'Not enough coins.' }

  const blankIdxs: number[] = []
  for (let i = 0; i < state.slices.length; i++) {
    if (state.slices[i].kind === 'blank') blankIdxs.push(i)
  }
  if (blankIdxs.length === 0) return { ...state, lastMessage: 'No blank slices to remove.' }
  if (blankIdxs.length <= 1) return { ...state, lastMessage: 'Must keep at least 1 blank slice.' }

  const idx = blankIdxs[Math.floor(Math.random() * blankIdxs.length)]
  const next = [...state.slices]
  next.splice(idx, 1)

  return {
    ...state,
    coins: state.coins - cost,
    removeBlankLevel: state.removeBlankLevel + 1,
    slices: next,
    lastMessage: 'Removed a blank slice.',
  }
}

const STORAGE_KEY = 'midweekchallenge:coinatro'

function isSliceKind(x: unknown): x is CoinSliceKind {
  return x === 'coin' || x === 'blank'
}

function normalizeSlice(x: unknown): CoinSlice | null {
  if (!x || typeof x !== 'object') return null
  const o = x as { id?: unknown; kind?: unknown; label?: unknown }
  if (typeof o.id !== 'string') return null
  if (typeof o.label !== 'string') return null
  if (!isSliceKind(o.kind)) return null
  return { id: o.id, kind: o.kind, label: o.label }
}

export function loadCoinatroState(): CoinatroState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return null
    const o = parsed as Record<string, unknown>

    if (typeof o.spinCount !== 'number') return null
    if (typeof o.coinHitCount !== 'number') return null
    if (typeof o.coinStreak !== 'number') return null
    if (typeof o.coins !== 'number') return null
    if (typeof o.coinValueLevel !== 'number') return null
    if (typeof o.addSliceLevel !== 'number') return null
    if (typeof o.removeBlankLevel !== 'number') return null
    if (typeof o.hasStreak5Double !== 'boolean') return null
    if (typeof o.miniWheelLevel !== 'number') return null
    if (!Number.isFinite(o.miniWheelLevel)) return null
    if (o.miniWheelLevel < 0 || o.miniWheelLevel > 3) return null
    if (!Array.isArray(o.slices)) return null

    const slices = o.slices.map(normalizeSlice).filter(Boolean) as CoinSlice[]
    if (slices.length === 0) return null

    return {
      spinCount: o.spinCount,
      coinHitCount: o.coinHitCount,
      coinStreak: o.coinStreak,
      coins: o.coins,
      coinValueLevel: o.coinValueLevel,
      addSliceLevel: o.addSliceLevel,
      removeBlankLevel: o.removeBlankLevel,
      hasStreak5Double: o.hasStreak5Double,
      miniWheelLevel: o.miniWheelLevel,
      slices,
      lastResult: null,
      lastMessage: null,
    }
  } catch {
    return null
  }
}

export function saveCoinatroState(state: CoinatroState) {
  try {
    const payload: CoinatroState = { ...state, lastResult: null, lastMessage: null }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore
  }
}

