import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import Features from "./components/Features.jsx";
import About from "./components/About.jsx";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import SymptomChecker from "./pages/SymptomChecker";
import MedicationReminder from "./pages/MedicationReminder";
import NutritionFitness from "./pages/NutritionFitness";
import Nutrition from "./pages/Nutrition";
import Fitness from "./pages/Fitness";
import MentalHealth from "./pages/MentalHealth";
import HealthRecordManagement from "./pages/HealthRecordManagement";
import UserProfileSettings from "./pages/UserProfileSettings";
import Profile from "./pages/Profile";
import Login from "./pages/Login"; 
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute.jsx";
import AddToHomeScreen from "./components/AddToHomeScreen";
import AIChatPage from "./pages/AIChatPage";

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <main className="flex-1">
        {/* Optional homepage title */}
        {isHomePage && (
          <div className="pt-24 text-center">
            <h1 className="text-4xl font-bold text-blue-700">
              Welcome to My Health Coach
            </h1>
            <p className="text-gray-600 mt-3 text-lg">
              Your AI-powered personal health partner
            </p>
          </div>
        )}

        {/* Routes */}
        <Routes>
          {/* Home page */}
          <Route
            path="/"
            element={
              <>
                <Hero />
                <Features />
                <About />
              </>
            }
          />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected pages */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/symptom-checker" element={<PrivateRoute><SymptomChecker /></PrivateRoute>} />
          <Route path="/medication-reminder" element={<PrivateRoute><MedicationReminder /></PrivateRoute>} />
          <Route path="/nutrition-fitness" element={<PrivateRoute><NutritionFitness /></PrivateRoute>} />
          <Route path="/nutrition" element={<PrivateRoute><Nutrition /></PrivateRoute>} />
          <Route path="/fitness" element={<PrivateRoute><Fitness /></PrivateRoute>} />
          <Route path="/mental-health" element={<PrivateRoute><MentalHealth /></PrivateRoute>} />
          <Route path="/health-records" element={<PrivateRoute><HealthRecordManagement /></PrivateRoute>} />
          <Route path="/user-profile" element={<PrivateRoute><UserProfileSettings /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Contact */}
          <Route path="/contact" element={<Contact />} />

          {/* AI Chat Coach */}
          <Route path="/ai-chat" element={<AIChatPage />} />
        </Routes>
      </main>

      {/* Add to Home Screen PWA */}
      <AddToHomeScreen />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;

