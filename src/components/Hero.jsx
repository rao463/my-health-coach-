import React from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
   const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white text-center px-6">
      <h1 className="text-5xl font-bold text-blue-700 mb-6">
        Empower Your Health with AI
      </h1>
      <p className="text-gray-700 text-lg max-w-2xl mb-8">
        My Health Coach helps you manage your well-being with smart recommendations,
        symptom tracking, and daily motivation — all in one place.
      </p>

      <button
        onClick={() => navigate("/dashboard")} // change this path to where you want users to go
        className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
      >
        Get Started
      </button>
    </div>
  );
};

export default Hero;
