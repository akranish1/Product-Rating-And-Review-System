import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const [isLogged, setIsLogged] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const check = () => {
      const u =
        localStorage.getItem('currentUser') ||
        localStorage.getItem('user')
      setIsLogged(Boolean(u))
    }

    check()

    const onStorage = () => check()
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('user')
    setIsLogged(false)
    navigate('/auth')
  }

  return (
    <nav className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-semibold">
              MySite
            </Link>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="hover:text-gray-600 dark:hover:text-gray-300">
              Home
            </Link>
            <Link to="/about" className="hover:text-gray-600 dark:hover:text-gray-300">
              About
            </Link>

            {isLogged && (
              <Link to="/profile" className="hover:text-gray-600 dark:hover:text-gray-300">
                Profile
              </Link>
            )}

            {!isLogged ? (
              <Link to="/auth" className="hover:text-gray-600 dark:hover:text-gray-300">
                Login
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setOpen(v => !v)}
              aria-label="Toggle menu"
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link onClick={() => setOpen(false)} to="/" className="block px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700">
              Home
            </Link>
            <Link onClick={() => setOpen(false)} to="/about" className="block px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700">
              About
            </Link>

            {isLogged && (
              <Link onClick={() => setOpen(false)} to="/profile" className="block px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700">
                Profile
              </Link>
            )}

            {!isLogged ? (
              <Link onClick={() => setOpen(false)} to="/auth" className="block px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700">
                Login
              </Link>
            ) : (
              <button
                onClick={() => {
                  setOpen(false)
                  handleLogout()
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-red-500 hover:bg-gray-200 dark:hover:bg-slate-700"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
