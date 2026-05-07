export type CoinSliceKind = 'coin' | 'blank'

export type CoinSlice = {
  id: string
  kind: CoinSliceKind
  label: string
}

export type CoinatroUpgradeId = 'coin_value_fib' | 'add_coin_slice' | 'remove_blank_slice'

export type CoinatroState = {
  spinCount: number
  coinHitCount: number
  coinStreak: number
  coins: number
  coinValueLevel: number
  addSliceLevel: number
  removeBlankLevel: number
  hasStreak5Double: boolean
  miniWheelLevel: number
  slices: CoinSlice[]
  lastResult: CoinSlice | null
  lastMessage: string | null
}

