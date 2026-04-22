import { Link, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
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
                <Link className="navLink" to="/random">
                  Random wheel
                </Link>
              </nav>
            </header>
            <HomePage />
          </div>
        }
      />
      <Route path="/random" element={<RandomPage />} />
    </Routes>
  )
}

