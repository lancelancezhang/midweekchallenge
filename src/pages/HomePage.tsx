import { ChallengePostCard } from '../components/ChallengePostCard'
import { CHALLENGES } from '../data/challenges'

export function HomePage() {
  return (
    <main className="stack">
      {CHALLENGES.map((post) => (
        <ChallengePostCard key={post.id} post={post} />
      ))}
    </main>
  )
}

