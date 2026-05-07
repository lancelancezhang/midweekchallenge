import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CoinWheel } from '../wheelatroCoins/CoinWheel'
import { playCoinClink } from '../wheelatroCoins/coinSfx'
import { playWheelClick } from '../wheelatroCoins/wheelClickSfx'
import {
  addSliceCoinChance,
  buyAddSlice,
  buyCoinValue,
  buyMiniWheel,
  buyRemoveBlank,
  buyStreak5Double,
  coinValue,
  coinValueNext,
  costAddSlice,
  costCoinValue,
  costMiniWheel,
  costRemoveBlank,
  costStreak5Double,
  createInitialState,
  loadCoinatroState,
  miniWheelSlices,
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
  const [pendingMiniSliceIds, setPendingMiniSliceIds] = useState<string[] | null>(null)
  const [pendingMiniSlices, setPendingMiniSlices] = useState<Array<CoinSlice | null> | null>(null)

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
      streak5Double: costStreak5Double(),
      miniWheel: costMiniWheel(state),
    }
  }, [state])

  const canSpin = !wheelSpinning

  const doSpin = () => {
    if (!canSpin) return

    playWheelClick()
    const landed = rollSlice(state.slices)
    setPendingSlice(landed)
    setPendingSliceId(landed.id)

    if (state.miniWheelLevel > 0) {
      const minis = Array.from({ length: state.miniWheelLevel }).map(() => rollSlice(miniWheelSlices()))
      setPendingMiniSlices(minis)
      setPendingMiniSliceIds(minis.map((m) => m.id))
    } else {
      setPendingMiniSlices(null)
      setPendingMiniSliceIds(null)
    }

    setWheelSpinning(true)
  }

  const onWheelDone = () => {
    setWheelSpinning(false)
    if (!pendingSlice) return
    const anyMiniCoin = (pendingMiniSlices ?? []).some((s) => s?.kind === 'coin')
    const anyCoin = pendingSlice.kind === 'coin' || anyMiniCoin
    if (anyCoin) playCoinClink()

    setState((s) => resolveSpin(s, pendingSlice, pendingMiniSlices))
    setPendingSlice(null)
    setPendingSliceId(null)
    setPendingMiniSlices(null)
    setPendingMiniSliceIds(null)
  }

  const buy1 = () => setState((s) => buyCoinValue(s))
  const buy2 = () => setState((s) => buyAddSlice(s))
  const buy3 = () => setState((s) => buyRemoveBlank(s))
  const buy4 = () => setState((s) => buyStreak5Double(s))
  const buy5 = () => setState((s) => buyMiniWheel(s))

  const canBuyCoinValue = state.coins >= costs.coinValue
  const canBuyAddSlice = state.coins >= costs.addSlice
  const canBuyRemoveBlank = state.coins >= costs.removeBlank
  const canBuyStreak5Double = !state.hasStreak5Double && state.coins >= costs.streak5Double
  const canBuyMiniWheel = state.miniWheelLevel < 3 && state.coins >= costs.miniWheel

  const wheelCoinSegments = useMemo(() => state.slices.filter((s) => s.kind === 'coin').length, [state.slices])
  const wheelBlankSegments = useMemo(() => state.slices.length - wheelCoinSegments, [state.slices, wheelCoinSegments])
  const coinHitPct = useMemo(() => {
    if (state.spinCount <= 0) return 0
    return state.coinHitCount / state.spinCount
  }, [state.coinHitCount, state.spinCount])

  const upgradesBought =
    state.coinValueLevel > 0 ||
    state.addSliceLevel > 0 ||
    state.removeBlankLevel > 0 ||
    state.hasStreak5Double ||
    state.miniWheelLevel > 0

  const [purchasesThisRound, setPurchasesThisRound] = useState<Record<string, boolean>>({})
  const [purchaseCountThisRound, setPurchaseCountThisRound] = useState(0)

  useEffect(() => {
    setPurchasesThisRound({})
    setPurchaseCountThisRound(0)
  }, [state.spinCount])

  const canPurchaseMoreThisRound = purchaseCountThisRound < 2

  const makeOnePerRound = (key: string, canBuy: boolean, buy: () => void) => {
    const alreadyBought = purchasesThisRound[key] === true
    const disabled = !canBuy || alreadyBought || !canPurchaseMoreThisRound
    const onClick = disabled
      ? undefined
      : () => {
          setPurchasesThisRound((p) => ({ ...p, [key]: true }))
          setPurchaseCountThisRound((n) => n + 1)
          buy()
        }
    return { disabled, onClick }
  }

  const offers = useMemo(() => {
    const list: Array<{ key: string; node: React.ReactNode }> = []

    if (!state.hasStreak5Double) {
      const { disabled, onClick } = makeOnePerRound('streak5Double', canBuyStreak5Double, buy4)
      list.push({
        key: 'streak5Double',
        node: (
          <button
            type="button"
            className="wheelatroOffer"
            onClick={onClick}
            disabled={disabled}
          >
            <div className="wheelatroOfferLevel" aria-label="One-time upgrade">
              One-time
            </div>
            <div className="wheelatroOfferTop">
              <div className="wheelatroOfferName">Streak 5 → Double coins</div>
              <div className="wheelatroOfferMeta">
                <span className="wheelatroCost">{costs.streak5Double}c</span>
              </div>
            </div>
            <div className="wheelatroOfferDesc muted">
              When your <strong>main wheel</strong> streak hits <strong>5</strong>, your total coins are doubled.
            </div>
          </button>
        ),
      })
    }

    if (state.miniWheelLevel < 3) {
      const { disabled, onClick } = makeOnePerRound('miniWheel', canBuyMiniWheel, buy5)
      list.push({
        key: 'miniWheel',
        node: (
          <button
            type="button"
            className="wheelatroOffer"
            onClick={onClick}
            disabled={disabled}
          >
            <div className="wheelatroOfferLevel" aria-label={`Mini wheels owned: ${state.miniWheelLevel}`}>
              Mini x{state.miniWheelLevel}/3
            </div>
            <div className="wheelatroOfferTop">
              <div className="wheelatroOfferName">Add mini wheel (25% coin)</div>
              <div className="wheelatroOfferMeta">
                <span className="wheelatroCost">{costs.miniWheel}c</span>
              </div>
            </div>
            <div className="wheelatroOfferDesc muted">
              Adds a smaller wheel on top with a fixed <strong>1/4</strong> chance of coin. If it hits coin, you get extra
              coins too.
            </div>
          </button>
        ),
      })
    }

    {
      const { disabled, onClick } = makeOnePerRound('coinValue', canBuyCoinValue, buy1)
      list.push({
        key: 'coinValue',
        node: (
          <button type="button" className="wheelatroOffer" onClick={onClick} disabled={disabled}>
            <div className="wheelatroOfferLevel" aria-label={`Level ${state.coinValueLevel}`}>
              Lv {state.coinValueLevel}
            </div>
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
        ),
      })
    }

    {
      const { disabled, onClick } = makeOnePerRound('addSlice', canBuyAddSlice, buy2)
      list.push({
        key: 'addSlice',
        node: (
          <button type="button" className="wheelatroOffer" onClick={onClick} disabled={disabled}>
            <div className="wheelatroOfferLevel" aria-label={`Level ${state.addSliceLevel}`}>
              Lv {state.addSliceLevel}
            </div>
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
        ),
      })
    }

    {
      const { disabled, onClick } = makeOnePerRound('removeBlank', canBuyRemoveBlank, buy3)
      list.push({
        key: 'removeBlank',
        node: (
          <button type="button" className="wheelatroOffer" onClick={onClick} disabled={disabled}>
            <div className="wheelatroOfferLevel" aria-label={`Level ${state.removeBlankLevel}`}>
              Lv {state.removeBlankLevel}
            </div>
            <div className="wheelatroOfferTop">
              <div className="wheelatroOfferName">Remove a blank slice</div>
              <div className="wheelatroOfferMeta">
                <span className="wheelatroCost">{costs.removeBlank}c</span>
              </div>
            </div>
            <div className="wheelatroOfferDesc muted">Removes a blank slice</div>
          </button>
        ),
      })
    }

    return list
  }, [
    addSliceChance,
    canPurchaseMoreThisRound,
    canBuyAddSlice,
    canBuyCoinValue,
    canBuyMiniWheel,
    canBuyRemoveBlank,
    canBuyStreak5Double,
    coinVal,
    costs,
    makeOnePerRound,
    purchasesThisRound,
    state,
  ])

  const activeOffers = useMemo(() => {
    if (offers.length === 0) return []
    const idx = ((state.spinCount % offers.length) + offers.length) % offers.length
    if (offers.length === 1) return [offers[idx]]
    return [offers[idx], offers[(idx + 1) % offers.length]]
  }, [offers, state.spinCount])

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

          <div className="wheelatroStage wheelatroStageStack" aria-label="Coin wheels">
            <div className="wheelatroPointer" aria-hidden="true" />
            <CoinWheel
              embedded
              className="wheelatroWheelLayer wheelatroWheelLayerMain"
              slices={state.slices}
              outcomeSliceId={pendingSliceId}
              spinning={wheelSpinning}
              onDone={onWheelDone}
            />
            {state.miniWheelLevel >= 1 ? (
              <CoinWheel
                embedded
                className="wheelatroWheelLayer wheelatroWheelLayerMini wheelatroWheelLayerMini1"
                slices={miniWheelSlices()}
                outcomeSliceId={pendingMiniSliceIds?.[0] ?? null}
                spinning={wheelSpinning}
              />
            ) : null}
            {state.miniWheelLevel >= 2 ? (
              <CoinWheel
                embedded
                className="wheelatroWheelLayer wheelatroWheelLayerMini wheelatroWheelLayerMini2"
                slices={miniWheelSlices()}
                outcomeSliceId={pendingMiniSliceIds?.[1] ?? null}
                spinning={wheelSpinning}
              />
            ) : null}
            {state.miniWheelLevel >= 3 ? (
              <CoinWheel
                embedded
                className="wheelatroWheelLayer wheelatroWheelLayerMini wheelatroWheelLayerMini3"
                slices={miniWheelSlices()}
                outcomeSliceId={pendingMiniSliceIds?.[2] ?? null}
                spinning={wheelSpinning}
              />
            ) : null}
          </div>

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
              {activeOffers.map((o) => (
                <div key={o.key}>{o.node}</div>
              ))}
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
              <div className="wheelatroMetaTitle">Big wheel stats</div>
              <div className="wheelatroMetaLine muted">{state.slices.length} segments: {wheelCoinSegments} coin - {wheelBlankSegments} blank</div>
              <div className="wheelatroMetaLine muted">Coin value: {coinVal}</div>
            </div>

            <div className="wheelatroMeta" style={{ marginTop: 12 }}>
              <div className="wheelatroMetaTitle">Upgrades bought</div>
              {!upgradesBought ? (
                <div className="wheelatroMetaLine muted">None yet</div>
              ) : (
                <>
                  {state.hasStreak5Double ? (
                    <div className="wheelatroMetaLine muted">Streak 5 double: owned</div>
                  ) : null}
                  {state.miniWheelLevel > 0 ? (
                    <div className="wheelatroMetaLine muted">Mini wheels: {state.miniWheelLevel}/3</div>
                  ) : null}
                  {state.coinValueLevel > 0 ? (
                    <div className="wheelatroMetaLine muted">Coin value: {state.coinValueLevel}</div>
                  ) : null}
                  {state.addSliceLevel > 0 ? (
                    <div className="wheelatroMetaLine muted">Add slice: {state.addSliceLevel}</div>
                  ) : null}
                  {state.removeBlankLevel > 0 ? (
                    <div className="wheelatroMetaLine muted">Remove blank: {state.removeBlankLevel}</div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

