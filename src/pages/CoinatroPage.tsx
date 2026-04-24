import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CoinWheel } from '../wheelatroCoins/CoinWheel'
import { playCoinClink } from '../wheelatroCoins/coinSfx'
import { playWheelClick } from '../wheelatroCoins/wheelClickSfx'
import {
  addSliceCoinChance,
  buyAddSlice,
  buyCoinValue,
  buyRemoveBlank,
  coinValue,
  coinValueNext,
  costAddSlice,
  costCoinValue,
  costRemoveBlank,
  createInitialState,
  loadCoinatroState,
  resolveSpin,
  rollSlice,
  saveCoinatroState,
  trueOdds,
} from '../wheelatroCoins/engine'
import type { CoinSlice, CoinatroState } from '../wheelatroCoins/types'

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`
}

export function CoinatroPage() {
  const [state, setState] = useState<CoinatroState>(() => loadCoinatroState() ?? createInitialState())
  const [wheelSpinning, setWheelSpinning] = useState(false)
  const [pendingSliceId, setPendingSliceId] = useState<string | null>(null)
  const [pendingSlice, setPendingSlice] = useState<CoinSlice | null>(null)

  useEffect(() => {
    saveCoinatroState(state)
  }, [state])

  const odds = useMemo(() => trueOdds(state), [state])
  const coinVal = useMemo(() => coinValue(state), [state])
  const addSliceChance = useMemo(() => addSliceCoinChance(state), [state])

  const costs = useMemo(() => {
    return {
      coinValue: costCoinValue(state),
      addSlice: costAddSlice(state),
      removeBlank: costRemoveBlank(state),
    }
  }, [state])

  const canSpin = !wheelSpinning

  const doSpin = () => {
    if (!canSpin) return

    playWheelClick()
    const landed = rollSlice(state.slices)
    setPendingSlice(landed)
    setPendingSliceId(landed.id)
    setWheelSpinning(true)
  }

  const onWheelDone = () => {
    setWheelSpinning(false)
    if (!pendingSlice) return

    if (pendingSlice.kind === 'coin') {
      playCoinClink()
    }

    setState((s) => resolveSpin(s, pendingSlice))
    setPendingSlice(null)
    setPendingSliceId(null)
  }

  const buy1 = () => setState((s) => buyCoinValue(s))
  const buy2 = () => setState((s) => buyAddSlice(s))
  const buy3 = () => setState((s) => buyRemoveBlank(s))

  const canBuyCoinValue = state.coins >= costs.coinValue
  const canBuyAddSlice = state.coins >= costs.addSlice
  const canBuyRemoveBlank = state.coins >= costs.removeBlank

  const wheelCoinSegments = useMemo(() => state.slices.filter((s) => s.kind === 'coin').length, [state.slices])
  const wheelBlankSegments = useMemo(() => state.slices.length - wheelCoinSegments, [state.slices, wheelCoinSegments])
  const coinHitPct = useMemo(() => {
    if (state.spinCount <= 0) return 0
    return state.coinHitCount / state.spinCount
  }, [state.coinHitCount, state.spinCount])

  return (
    <div className="app">
      <header className="pageHeader">
        <div>
          <h1 className="pageTitle">Coinatro</h1>
        </div>
        <nav className="nav">
          <Link className="navLink" to="/">
            Back
          </Link>
          <Link className="navLink" to="/random">
            Wheel
          </Link>
          <Link className="navLink" to="/podcast">
            Podcast
          </Link>
        </nav>
      </header>

      <main className="wheelatroLayout">
        <section className="wheelatroPageColumn wheelatroCard">
          <div className="wheelatroAboveWheel">
            <div className="wheelatroTopStat">
              <div className="wheelatroLabel">Coins</div>
              <div className="wheelatroValue">{state.coins}</div>
            </div>
            <div className="wheelatroTopStat">
              <div className="wheelatroLabel">Streak</div>
              <div className="wheelatroValue">{state.coinStreak}</div>
            </div>
          </div>

          <CoinWheel
            slices={state.slices}
            outcomeSliceId={pendingSliceId}
            spinning={wheelSpinning}
            onDone={onWheelDone}
          />

          <div className="wheelatroControls">
            <button className="btn wheelatroSpinBtn" disabled={!canSpin} onClick={doSpin}>
              {wheelSpinning ? 'Spinning…' : 'Spin'}
            </button>
          </div>
        </section>

        <section className="wheelatroPageColumn wheelatroSide">
          <div className="wheelatroUpgradeCard">
            <div className="wheelatroSectionTitle">Upgrades</div>

            <div className="wheelatroOffers">
              <button
                type="button"
                className="wheelatroOffer"
                onClick={canBuyCoinValue ? buy1 : undefined}
                disabled={!canBuyCoinValue}
              >
                <div className="wheelatroOfferTop">
                  <div className="wheelatroOfferName">Increase coin value</div>
                  <div className="wheelatroOfferMeta">
                    <span className="wheelatroCost">{costs.coinValue}c</span>
                  </div>
                </div>
                <div className="wheelatroOfferDesc muted">
                  Coin gain from <strong>{coinVal}</strong> → <strong>{coinValueNext(state)}</strong>
                </div>
              </button>

              <button
                type="button"
                className="wheelatroOffer"
                onClick={canBuyAddSlice ? buy2 : undefined}
                disabled={!canBuyAddSlice}
              >
                <div className="wheelatroOfferTop">
                  <div className="wheelatroOfferName">Add a slice</div>
                  <div className="wheelatroOfferMeta">
                    <span className="wheelatroCost">{costs.addSlice}c</span>
                  </div>
                </div>
                <div className="wheelatroOfferDesc muted">
                  <div>Adds 1 slice.</div>
                  <div className="wheelatroOfferSubline">
                    Current chance it’s a <strong>COIN</strong> slice: <strong>{pct(addSliceChance)}</strong>
                  </div>
                </div>
              </button>

              <button
                type="button"
                className="wheelatroOffer"
                onClick={canBuyRemoveBlank ? buy3 : undefined}
                disabled={!canBuyRemoveBlank}
              >
                <div className="wheelatroOfferTop">
                  <div className="wheelatroOfferName">Remove a blank slice</div>
                  <div className="wheelatroOfferMeta">
                    <span className="wheelatroCost">{costs.removeBlank}c</span>
                  </div>
                </div>
                <div className="wheelatroOfferDesc muted">Removes a blank slice</div>
              </button>
            </div>
          </div>

          <div className="wheelatroSummaryCard">
            <div className="wheelatroSummaryTitle">Stats</div>

            <div className="wheelatroStatsGrid">
              <div className="wheelatroStatsRow">
                <div className="wheelatroLabel">Coin odds</div>
                <div className="wheelatroStatsValue">{pct(odds)}</div>
              </div>
              <div className="wheelatroStatsRow">
                <div className="wheelatroLabel">Spin count</div>
                <div className="wheelatroStatsValue">{state.spinCount}</div>
              </div>
              <div className="wheelatroStatsRow">
                <div className="wheelatroLabel">Coin hit %</div>
                <div className="wheelatroStatsValue">{pct(coinHitPct)}</div>
              </div>
            </div>

            <div className="wheelatroStatsDivider" />

            <div className="wheelatroMeta">
              <div className="wheelatroMetaTitle">Wheel</div>
              <div className="wheelatroMetaLine muted">{state.slices.length} segments: {wheelCoinSegments} coin - {wheelBlankSegments} blank</div>
              <div className="wheelatroMetaLine muted">Coin value: {coinVal}</div>
            </div>

            <div className="wheelatroMeta" style={{ marginTop: 12 }}>
              <div className="wheelatroMetaTitle">Upgrades bought</div>
              <div className="wheelatroMetaLine muted">Coin value: {state.coinValueLevel}</div>
              <div className="wheelatroMetaLine muted">Add slice: {state.addSliceLevel}</div>
              <div className="wheelatroMetaLine muted">Remove blank: {state.removeBlankLevel}</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

