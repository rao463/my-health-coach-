import React from "react";

const About = () => {
  return (
    <section className="bg-gradient-to-r from-blue-50 to-white py-20">
      <div className="container mx-auto px-6 md:flex md:items-center md:gap-10">
        {/* Left Side - Text */}
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h2 className="text-4xl font-bold text-blue-700 mb-4">About My Health Coach</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            My Health Coach is an AI-powered web platform designed to help
            individuals take control of their health journey. It combines
            intelligent tools for tracking symptoms, setting reminders, and
            improving nutrition, fitness, and mental well-being — all in one
            easy-to-use website.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our mission is to make health management accessible, proactive, and
            personalized — without the need for expensive devices or complex
            apps. Whether you want to check symptoms, store records, or find
            motivation, My Health Coach is here to guide you.
          </p>
        </div>

        {/* Right Side - Image */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src="https://img.freepik.com/free-vector/healthcare-technology-illustration_23-2148888659.jpg"
            alt="About Health Assistant"
            className="rounded-2xl shadow-lg w-full max-w-md"
          />
        </div>
      </div>
    </section>
  );
};

export default About;

