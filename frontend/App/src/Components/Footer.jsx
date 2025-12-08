import React from 'react'

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white hover:text-gray-300">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white hover:text-gray-300">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
  </svg>
);

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white hover:text-gray-300">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-[#1c1c1c] text-white py-12 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-2xl font-semibold">
          MySite
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: About */}
          <div>
            <h3 className="font-bold mb-4">About</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:underline">About us</a></li>
              <li><a href="#" className="hover:underline">Contact</a></li>
              <li><a href="#" className="hover:underline">How Trustpilot works</a></li>
            </ul>
          </div>

          {/* Column 2: Community */}
          <div>
            <h3 className="font-bold mb-4">Community</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:underline">Trust in reviews</a></li>
              <li><a href="#" className="hover:underline">Help Center</a></li>
              <li><a href="#" className="hover:underline">Log in</a></li>
              <li><a href="#" className="hover:underline">Sign up</a></li>
            </ul>
          </div>

          {/* Column 3: Follow us on & Country */}
          <div>
            <h3 className="font-bold mb-4">Follow us on</h3>
            <div className="flex space-x-4 mb-8">
              <a href="#"><FacebookIcon /></a>
              <a href="#"><XIcon /></a>
              <a href="#"><LinkedInIcon /></a>
            </div>
            <h3 className="font-bold mb-4">Choose country</h3>
            <div className="relative">
              <select className="bg-[#2b2b2b] text-white px-4 py-3 pr-8 rounded w-full appearance-none hover:bg-[#3a3a3a] cursor-pointer">
                <option>India</option>
                <option>United States</option>
                <option>United Kingdom</option>
                {/* Add more countries if needed */}
              </select>
              {/* for the option icon */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
