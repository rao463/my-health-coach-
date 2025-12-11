import React, { useEffect, useState } from "react";
import { HeartPulse, Bell, Apple, Dumbbell, Brain, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [records, setRecords] = useState([]);

  // Load records from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("healthRecords")) || [];
    setRecords(saved);
  }, []);

  const upcomingRecords = records.filter(r => new Date(r.date) > new Date());

  const getDaysLeft = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getAlertColor = (days) => {
    if (days <= 3) return "bg-red-100 text-red-700";
    if (days <= 7) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-6">
      <div className="container mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2 md:text-lg">
            Your personal health overview and quick access to tools.
          </p>
        </div>

        {/* Upcoming Alerts */}
        {upcomingRecords.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
              <Bell className="w-5 h-5" /> Upcoming Alerts
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {upcomingRecords.map((record, index) => {
                const daysLeft = getDaysLeft(record.date);
                return (
                  <Link
                    to="/health-records"
                    key={index}
                    className={`p-4 rounded-2xl shadow-md ${getAlertColor(daysLeft)} hover:scale-105 transition transform`}
                  >
                    <span className="font-semibold">{record.type}</span>
                    <p className="text-sm">Date: {record.date}</p>
                    <p className="text-sm">In {daysLeft} day{daysLeft > 1 ? "s" : ""}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Link
            to="/symptom-checker"
            className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition flex flex-col items-start cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <HeartPulse className="w-10 h-10 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-blue-700">Symptom Checker</h2>
            </div>
            <p className="text-gray-600">Describe your symptoms and get AI-powered suggestions.</p>
          </Link>

          <Link
            to="/medication-reminder"
            className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition flex flex-col items-start cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <Bell className="w-10 h-10 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-blue-700">Medication Reminder</h2>
            </div>
            <p className="text-gray-600">Keep track of your medications and never miss a dose.</p>
          </Link>

          <Link
            to="/nutrition-fitness"
            className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition flex flex-col items-start cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <Apple className="w-10 h-10 text-blue-600 mr-3" />
              <Dumbbell className="w-10 h-10 text-blue-600 mr-1" />
              <h2 className="text-xl font-semibold text-blue-700">Nutrition & Fitness</h2>
            </div>
            <p className="text-gray-600">Track your meals, workouts, and stay on top of your health goals.</p>
          </Link>

          <Link
            to="/mental-health"
            className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition flex flex-col items-start cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <Brain className="w-10 h-10 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-blue-700">Mental Health</h2>
            </div>
            <p className="text-gray-600">Track your mood, write reflections, and get daily wellness tips.</p>
          </Link>

          {/* Health Records full width */}
          <div className="md:col-span-2">
            <Link
              to="/health-records"
              className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition flex flex-col items-start w-full"
            >
              <div className="flex items-center mb-4">
                <FileText className="w-10 h-10 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-blue-700">Health Records</h2>
              </div>
              <p className="text-gray-600">View and manage your personal health history.</p>
              <div className="mt-4 text-right text-gray-500 font-medium">
                {records.length} Record{records.length !== 1 && "s"}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
