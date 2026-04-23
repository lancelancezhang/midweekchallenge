import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import type { MemberName } from '../types'
import { MEMBER_BY_NAME } from '../data/members'

type Row = {
  name: MemberName
  value: number
  isNA: boolean
  display: string
  fill: string
}

type Props = {
  values: Partial<Record<MemberName, number | null>>
  /** Same order as the leaderboard table for this post */
  memberOrder: MemberName[]
}

type LabelProps = {
  x?: string | number
  y?: string | number
  width?: string | number
  height?: string | number
  index?: number
  value?: string | number
  payload?: Row
  viewBox?: { x: number; y: number; width: number; height: number }
}

function ReturnLabelList(props: LabelProps) {
  const { x = 0, y = 0, width = 0, payload } = props
  if (!payload) return null
  const w = Number(width) || 0
  const cx = Number(x) + w / 2
  if (payload.isNA) {
    return (
      <text
        x={cx}
        y={y}
        textAnchor="middle"
        fill="rgb(100, 116, 139)"
        fontSize={16}
        fontWeight={600}
        dominantBaseline="middle"
      >
        —
      </text>
    )
  }
  const val = payload.value
  const isPos = val >= 0
  return (
    <text
      x={cx}
      y={Number(y) + (isPos ? -8 : Number(props.height) + 12)}
      textAnchor="middle"
      fill="rgba(15, 23, 42, 0.92)"
      fontSize={12}
      fontWeight={800}
      dominantBaseline="auto"
    >
      {payload.display}
    </text>
  )
}

export function ReturnBarChart({ values, memberOrder }: Props) {
  const { data, yDomain } = useMemo(() => {
    const rows: Row[] = memberOrder.map((name) => {
      const v = values[name]
      const has = typeof v === 'number' && !Number.isNaN(v)
      if (!has) {
        return {
          name,
          value: 0,
          isNA: true,
          display: '—',
          fill: 'rgba(0,0,0,0)',
        }
      }
      return {
        name,
        value: v,
        isNA: false,
        display: `${v > 0 ? '+' : ''}${v}%`,
        fill: MEMBER_BY_NAME[name].color,
      }
    })
    const nums = rows.map((r) => r.value).filter((_, i) => !rows[i].isNA)
    const rawMin = nums.length ? Math.min(...nums, 0) : 0
    const rawMax = nums.length ? Math.max(...nums, 0) : 100
    const span = Math.max(rawMax - rawMin, 1e-6)
    const pad = span * 0.12
    const yMin = Math.floor((rawMin - pad) / 10) * 10
    let yMax = Math.ceil((rawMax + pad) / 10) * 10
    if (yMax === yMin) yMax = yMin + 100
    return { data: rows, yDomain: [yMin, yMax] as [number, number] }
  }, [values, memberOrder])

  return (
    <div className="returnChart" role="img" aria-label="Return by member">
      <div className="returnChartTitle">Return (%)</div>
      <div className="returnChartRecharts">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            data={data}
            barCategoryGap="18%"
            margin={{ top: 28, right: 12, left: 4, bottom: 8 }}
          >
            <CartesianGrid stroke="rgba(15, 23, 42, 0.08)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: 'rgba(15, 23, 42, 0.78)', fontSize: 12, fontWeight: 700 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(15, 23, 42, 0.16)' }}
              interval={0}
              angle={-40}
              textAnchor="end"
              height={64}
            />
            <YAxis
              domain={yDomain}
              tickCount={5}
              tick={{ fill: 'rgba(15, 23, 42, 0.55)', fontSize: 11, fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v: number) => (Number.isInteger(v) ? `${v}` : v.toFixed(0)) + '%'}
            />
            <ReferenceLine
              y={0}
              stroke="rgba(15, 23, 42, 0.3)"
              strokeWidth={1.2}
            />
            <Bar
              dataKey="value"
              maxBarSize={48}
              radius={[4, 4, 0, 0]}
              stroke="rgba(15, 23, 42, 0.12)"
              strokeWidth={1}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.fill} fillOpacity={d.isNA ? 0 : 0.9} />
              ))}
              <LabelList
                dataKey="display"
                content={(p: unknown) => <ReturnLabelList {...(p as LabelProps)} />}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
