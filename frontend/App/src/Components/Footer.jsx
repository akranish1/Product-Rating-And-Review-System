import React from 'react'
import { Link } from 'react-router-dom'

// Standard SVGs with refined hover transitions
const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
  </svg>
);
const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-[#0A0A0A] text-gray-400 py-16 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand Section - Takes more space on large screens */}
          <div className="lg:col-span-4">
            <div className="text-white text-2xl font-black tracking-tighter mb-4">
              Rate<span className="text-green-500">Right</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs mb-6">
              Empowering consumers through transparent reviews and community-driven insights. 
              Find the best products with confidence.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: <FacebookIcon />, href: "#" },
                { icon: <XIcon />, href: "#" },
                { icon: <LinkedInIcon />, href: "#" }
              ].map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.href} 
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-blue-600 hover:scale-110 transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">About</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">How It Works</a></li>
              <li><a href="/about" className="hover:text-blue-400 transition-colors">Our Team</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Community</h3>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Trust in Reviews</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Guidelines</a></li>
            </ul>
          </div>

          {/* Localization & Newsletter Section */}
          <div className="lg:col-span-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Settings</h3>
            <p className="text-xs mb-4">Select your preferred region</p>
            <div className="relative mb-8">
              <select className="bg-white/5 text-white text-sm border border-white/10 px-4 py-3 pr-10 rounded-xl w-full appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:bg-white/10 transition-all cursor-pointer">
                <option className="bg-[#1c1c1c]">India</option>
                <option className="bg-[#1c1c1c]">United States</option>
                <option className="bg-[#1c1c1c]">United Kingdom</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px]">
          <p>© {new Date().getFullYear()} RateRight Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer