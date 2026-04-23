import type { MemberName } from '../types'
import { MEMBER_NAMES } from '../data/members'

/**
 * Member row order: matches the leaderboard table (answers key order, then
 * any remaining members in MEMBER_NAMES order), or `initialRanking` if set.
 */
export function getLeaderboardMemberOrder(
  initialRanking: readonly MemberName[] | undefined,
  answers: Partial<Record<MemberName, string>> | undefined,
): MemberName[] {
  if (initialRanking && initialRanking.length > 0) {
    return [...initialRanking]
  }

  const fromAnswers = (answers ? (Object.keys(answers) as MemberName[]) : []).filter((m) =>
    MEMBER_NAMES.includes(m),
  )

  const unique: MemberName[] = []
  for (const name of fromAnswers) {
    if (!unique.includes(name)) unique.push(name)
  }

  for (const name of MEMBER_NAMES) {
    if (!unique.includes(name)) unique.push(name)
  }

  return unique
}
