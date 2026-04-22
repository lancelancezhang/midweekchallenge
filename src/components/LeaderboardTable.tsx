import { useMemo } from 'react'
import type { MemberName } from '../types'
import { MEMBER_NAMES } from '../data/members'
import { MemberChip } from './MemberChip'

export function LeaderboardTable({
  initialRanking,
  answers,
  notes,
}: {
  initialRanking?: readonly MemberName[]
  answers?: Partial<Record<MemberName, string>>
  notes?: Partial<Record<MemberName, string>>
}) {
  const ranking = useMemo(() => {
    if (initialRanking && initialRanking.length > 0) return [...initialRanking]

    // If answers are present, follow the key insertion order from challenges.ts
    const fromAnswers = (answers ? (Object.keys(answers) as MemberName[]) : []).filter(
      (m) => MEMBER_NAMES.includes(m),
    )

    const unique: MemberName[] = []
    for (const name of fromAnswers) {
      if (!unique.includes(name)) unique.push(name)
    }

    for (const name of MEMBER_NAMES) {
      if (!unique.includes(name)) unique.push(name)
    }

    return unique
  }, [answers, initialRanking])

  return (
    <div className="card">
      <div className="cardHeader">
        <div className="cardTitle">Leaderboard</div>
      </div>

      <div className="tableWrap" role="region" aria-label="Leaderboard table">
        <table className="table">
          <thead>
            <tr>
              <th className="colRank">Rank</th>
              <th>Member</th>
              <th className="colAnswer">Answer</th>
              <th className="colNotes">Notes</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((member, idx) => {
              const answer = answers?.[member]?.trim()
              const note = notes?.[member]?.trim()
              return (
                <tr key={`${idx}-${member}`}>
                  <td className="colRank">{idx + 1}</td>
                  <td>
                    <MemberChip name={member} />
                  </td>
                  <td className="colAnswer">
                    <span className={answer ? 'answerText' : 'answerText muted'}>
                      {answer || '—'}
                    </span>
                  </td>
                  <td className="colNotes">
                    <span className={note ? 'answerText' : 'answerText muted'}>
                      {note || '—'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

