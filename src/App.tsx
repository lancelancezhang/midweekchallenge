import { Link, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { PodcastPage } from './pages/PodcastPage'
import { CoinatroPage } from './pages/CoinatroPage'
import { RandomPage } from './pages/RandomPage'

export function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="app">
            <header className="pageHeader">
              <div>
                <h1 className="pageTitle">Mid Week Challenge</h1>
              </div>
              <nav className="nav">
                <Link className="navLink" to="/podcast">
                  Podcast
                </Link>
                <Link className="navLink" to="/coinatro">
                  Coinatro
                </Link>
                <Link className="navLink" to="/random">
                  Wheel
                </Link>
              </nav>
            </header>
            <HomePage />
          </div>
        }
      />
      <Route path="/podcast" element={<PodcastPage />} />
      <Route path="/coinatro" element={<CoinatroPage />} />
      <Route path="/random" element={<RandomPage />} />
    </Routes>
  )
}

