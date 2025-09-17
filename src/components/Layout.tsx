import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Newspaper, User, LogOut } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  showAdminNav?: boolean
}

export function Layout({ children, showAdminNav = false }: LayoutProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Newspaper className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">NewsHub</span>
            </Link>

            <nav className="flex items-center space-x-4">
              {showAdminNav && user ? (
                <>
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{user.email}</span>
                    <button
                      onClick={handleSignOut}
                      className="text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/admin/login"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Admin Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            © 2025 NewsHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}