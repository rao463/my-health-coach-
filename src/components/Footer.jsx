import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-blue-700 text-white py-10 mt-12">
      <div className="container mx-auto px-6 text-center md:text-left">
        {/* Top Section */}
        <div className="md:flex md:justify-between md:items-start">
          {/* Brand Info */}
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-2">My Health Coach</h2>
            <p className="text-blue-100">
              Empowering people to take control of their health through
              AI-driven insights, motivation, and personalized care — anytime,
              anywhere.
            </p>
          </div>

          {/* Quick Links */}
          <div className="mt-8 md:mt-0">
            <h3 className="text-lg font-semibold mb-3 border-b border-blue-400 inline-block pb-1">
              Quick Links
            </h3>
            <ul className="space-y-2 text-blue-100">
              <li>
                <Link
                  to="/"
                  className="hover:text-white transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="hover:text-white transition-colors duration-200"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/mental-health"
                  className="hover:text-white transition-colors duration-200"
                >
                  Mental Health
                </Link>
              </li>
              <li>
                <Link
                  to="/nutrition-fitness"
                  className="hover:text-white transition-colors duration-200"
                >
                  Nutrition & Fitness
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-8 border-blue-500" />

        {/* Bottom Section */}
        <div className="text-center text-blue-100 text-sm">
          <p>
            © {new Date().getFullYear()} <span className="font-semibold">My Health Coach</span>.
            All Rights Reserved.
          </p>
          <p className="mt-1">
            <Link to="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>{" "}
            |{" "}
            <Link to="/terms" className="hover:text-white">
              Terms of Use
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
