import { ChallengePostCard } from './components/ChallengePostCard'
import { CHALLENGES } from './data/challenges'

export function App() {
  return (
    <div className="app">
      <header className="pageHeader">
        <div>
          <h1 className="pageTitle">Mid Week Challenge</h1>
        </div>
      </header>

      <main className="stack">
        {CHALLENGES.map((post) => (
          <ChallengePostCard key={post.id} post={post} />
        ))}
      </main>
    </div>
  )
}

