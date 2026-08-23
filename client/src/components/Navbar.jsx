import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'

const Navbar = () => {
  const { setShowLogin, user, logout, isOwner } = useAppContext()

  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const navigate = useNavigate()

  // Shared links for both user & owner
  const commonLinks = [
    { name: 'Home', path: '/' },
    { name: 'Cars', path: '/cars' },
    { name: 'My Bookings', path: '/bookings' },
    { name: 'Documents', path: '/documents' }
  ]

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 text-gray-600 border-b border-borderColor relative transition-all ${
        location.pathname === '/' && 'bg-light'
      }`}
    >
      <Link to='/'>
        <motion.img whileHover={{ scale: 1.05 }} src={assets.logo} alt='logo' className='h-8' />
      </Link>

      {/* MENU */}
      <div
        className={`max-sm:fixed max-sm:h-screen max-sm:w-full max-sm:top-16 max-sm:border-t border-borderColor right-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 max-sm:p-4 transition-all duration-300 z-50 ${
          location.pathname === '/' ? 'bg-light' : 'bg-white'
        } ${open ? 'max-sm:translate-x-0' : 'max-sm:translate-x-full'}`}
      >
        {/* Show links only if logged in */}
        {user &&
          commonLinks.map((link, index) => (
            <Link key={index} to={link.path}>
              {link.name}
            </Link>
          ))}

        {/* Search bar for both user & owner */}
        {user && (
          <div className='hidden lg:flex items-center text-sm gap-2 border border-borderColor px-3 rounded-full max-w-56'>
            <input
                type="text"
                value={search}
                onChange={(e) => {
                setSearch(e.target.value)
                navigate(`/cars?search=${e.target.value}`)
            }}
                className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
                placeholder="Search cars"
            />
            <img src={assets.search_icon} alt='search' />
          </div>
        )}

        <div className='flex max-sm:flex-col items-start sm:items-center gap-6'>
          {/* Owner Dashboard */}
          { isOwner && (
            <button onClick={() => navigate('/owner')} className='cursor-pointer'>
              Dashboard
            </button>
          )}

          {/* Login / Logout */}
          <button
            onClick={() => {
  if (user) {
    logout();
    navigate('/'); // or '/login' if you have a login page
  } else {
    setShowLogin(true);
  }
}}
            className='cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg'
          >
            {user ? 'Logout' : 'Login'}
          </button>
        </div>
      </div>

      {/* Mobile toggle */}
      <button className='sm:hidden cursor-pointer' aria-label='Menu' onClick={() => setOpen(!open)}>
        <img src={open ? assets.close_icon : assets.menu_icon} alt='menu' />
      </button>
    </motion.div>
  )
}

export default Navbar
