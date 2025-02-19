
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { title: 'Learn in Public', path: '/learn' },
    { title: 'My Resume', path: '/resume' },
    { title: 'My Projects', path: '/projects' },
    { title: 'My Certifications', path: '/certifications' },
    { title: 'My Achievements', path: '/achievements' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-panel">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-800 hover:text-gray-600 transition-colors duration-200"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link to="/" className="text-xl font-semibold">
          Portfolio
        </Link>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-[72px] left-0 w-full h-screen bg-white/95 backdrop-blur-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="container mx-auto px-4 py-8">
          <ul className="space-y-6">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="nav-item text-xl block"
                  onClick={() => setIsOpen(false)}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
