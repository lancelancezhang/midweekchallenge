import { Link } from 'react-router-dom'
import { PODCAST_EPISODES } from '../data/podcasts'
import { MemberChip } from '../components/MemberChip'

export function PodcastPage() {
  return (
    <div className="app">
      <header className="pageHeader">
        <div>
          <h1 className="pageTitle">3 guys 1 lane</h1>
        </div>
        <nav className="nav">
          <Link className="navLink" to="/">
            Back
          </Link>
          <Link className="navLink" to="/random">
            Wheel
          </Link>
        </nav>
      </header>

      <main className="stack podcastStack">
        {PODCAST_EPISODES.map((ep) => (
          <article key={ep.id} className="post podcastCard">
            <h2 className="postTitle">{ep.title}</h2>
            <time className="podcastDate" dateTime={ep.date}>
              {ep.date}
            </time>
            {ep.people && ep.people.length > 0 ? (
              <div className="podcastPeople" aria-label="Episode people">
                {ep.people.map((name) => (
                  <MemberChip key={name} name={name} />
                ))}
              </div>
            ) : null}
            <p className="postDescription podcastDescription">{ep.description}</p>
            <div className="podcastLinks">
              {ep.links.map((link) => (
                <a
                  key={link.href + link.label}
                  className="navLink podcastExtLink"
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </article>
        ))}
      </main>
    </div>
  )
}
