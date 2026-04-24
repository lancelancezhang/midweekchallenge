import type { CoinSlice, CoinatroState } from './types'

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
  return Math.ceil(5 * Math.pow(1.5, state.addSliceLevel))
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
    ...Array.from({ length: 7 }).map((_, i) => ({
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
    slices,
    lastResult: null,
    lastMessage: null,
  }
}

export function rollSlice(slices: CoinSlice[]) {
  const idx = Math.floor(Math.random() * slices.length)
  return slices[idx]
}

export function resolveSpin(state: CoinatroState, landed: CoinSlice): CoinatroState {
  const win = landed.kind === 'coin'
  const gain = win ? coinValue(state) : 0
  return {
    ...state,
    spinCount: state.spinCount + 1,
    coinHitCount: state.coinHitCount + (win ? 1 : 0),
    coinStreak: win ? state.coinStreak + 1 : 0,
    coins: state.coins + gain,
    lastResult: landed,
    lastMessage: win ? `You hit COIN (+${gain})` : 'Nothing…',
  }
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

