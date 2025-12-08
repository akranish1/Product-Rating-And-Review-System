import React from 'react'

const Navbar = () => {
  return (
    <div>
<nav className="bg-[#1c1c1c] shadow-md text-[#ffffff] py-2">
  <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
    {/* Logo */}
    <div className="text-3xl font-semibold">MySite</div>

    {/* Links */}
    <div className="hidden md:flex gap-6">
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/contact">Login</a>
    </div>
  </div>
</nav>

    </div>
  )
}

export default Navbar
