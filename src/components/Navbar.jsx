import React, { useState, useEffect } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check login status
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    setLoggedIn(!!user);
  }, [location]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 left-0 z-50">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Clickable Logo from public folder */}
        <Link to="/">
          <img
            src="/logo.png" // logo file in public folder
            alt="My Health Coach Project Logo"
            style={{ height: "70px", width: "90px", marginRight: "60px" }} 
          />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 text-gray-700 font-medium">
          <li>
            <Link to="/" className="hover:text-blue-600">Home</Link>
          </li>

          {loggedIn && (
            <>
              <li>
                <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
              </li>
              <li>
                <Link to="/profile" className="flex items-center gap-1 hover:text-blue-600">
                  <User size={18} /> Profile
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 hover:text-red-600"
                >
                  <LogOut size={18} /> Logout
                </button>
              </li>
            </>
          )}

          {!loggedIn && (
            <>
              <li>
                <Link
                  to="/login"
                  className="hover:text-white hover:bg-blue-600 bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-white hover:bg-blue-600 bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute top-16 left-0 w-full bg-white shadow-lg rounded-b-lg md:hidden">
            <ul className="flex flex-col items-center space-y-4 py-4 text-gray-700 font-medium">
              <li>
                <Link to="/" className="hover:text-blue-600">Home</Link>
              </li>

              {loggedIn && (
                <>
                  <li>
                    <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/profile" className="flex items-center gap-1 hover:text-blue-600">
                      <User size={18} /> Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1 hover:text-red-600"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </li>
                </>
              )}

              {!loggedIn && (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="hover:text-blue-600 border border-blue-600 px-3 py-1 rounded"
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className="hover:text-white hover:bg-blue-600 bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Register
                    </Link>
                  </li>
                </>
              )}

              {/* Additional Links */}
              <li>
                <Link to="/ai-chat" className="hover:text-blue-600">AI Chat Coach</Link>
              </li>
              <li>
                <Link to="/symptom-checker" className="hover:text-blue-600">AI Symptom Checker</Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
