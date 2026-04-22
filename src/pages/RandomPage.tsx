import { Link } from 'react-router-dom'
import { SpinningWheel } from '../wheel/SpinningWheel'

export function RandomPage() {
  return (
    <div className="app">
      <header className="pageHeader">
        <div>
          <h1 className="pageTitle">Random</h1>
        </div>
        <nav className="nav">
          <Link className="navLink" to="/">
            Back
          </Link>
        </nav>
      </header>

      <main className="randomLayout">
        <SpinningWheel />
      </main>
    </div>
  )
}

