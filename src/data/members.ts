import type { Member, MemberName } from '../types'

export const MEMBERS: readonly Member[] = [
  { name: 'Lance', color: '#2563EB' }, // blue
  { name: 'Ricky', color: '#DC2626' }, // red
  { name: 'Jacob', color: '#16A34A' }, // green
  { name: 'William', color: '#7C3AED' }, // violet
  { name: 'Carlos', color: '#F59E0B' }, // amber
  { name: 'Daniel', color: '#0EA5E9' }, // sky
  { name: 'Logan', color: '#EC4899' }, // pink
] as const

export const MEMBER_NAMES: readonly MemberName[] = MEMBERS.map((m) => m.name)

export const MEMBER_BY_NAME: Record<MemberName, Member> = MEMBERS.reduce(
  (acc, m) => {
    acc[m.name] = m
    return acc
  },
  {} as Record<MemberName, Member>,
)

