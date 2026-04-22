import type { MemberName } from '../types'
import { MEMBER_BY_NAME } from '../data/members'

export function MemberChip({ name }: { name: MemberName }) {
  const member = MEMBER_BY_NAME[name]
  return (
    <span className="chip" style={{ ['--chip' as never]: member.color }}>
      {member.name}
    </span>
  )
}

