import type { ChallengePost } from '../types'
import { getLeaderboardMemberOrder } from '../lib/leaderboardOrder'
import { MemberChip } from './MemberChip'
import { ReturnBarChart } from './ReturnBarChart'
import { LeaderboardTable } from './LeaderboardTable'

export function ChallengePostCard({ post }: { post: ChallengePost }) {
  return (
    <article className="post">
      <header className="postHeader">
        <div className="postTitleRow">
          <div className="postTitleBlock">
            <h2 className="postTitle">{post.title}</h2>
            <div className="postWeek muted">{post.weekLabel}</div>
          </div>
          <div className="postMeta">
            <span className="muted">Author</span> <MemberChip name={post.author} />
          </div>
        </div>
        <p className="postDescription">{post.description}</p>
      </header>

      <LeaderboardTable
        initialRanking={post.initialRanking}
        answers={post.answers}
        notes={post.notes}
      />
      {post.returnPercentages ? (
        <div className="returnChartCard">
          <ReturnBarChart
            values={post.returnPercentages}
            memberOrder={getLeaderboardMemberOrder(post.initialRanking, post.answers)}
          />
        </div>
      ) : null}
    </article>
  )
}

