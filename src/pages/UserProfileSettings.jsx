import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, User, Activity } from "lucide-react";

const UserProfileSettings = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    calorieGoal: "",
    waterGoal: "",
    fitnessGoal: "",
    notifications: {
      medication: true,
      upcomingRecords: true,
      generalReminders: true,
    },
    privacySync: false,
  });

  // Load from localStorage
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("userProfile")) || {};
    setUserData((prev) => ({ ...prev, ...savedData }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (field) => {
    setUserData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: !prev.notifications[field],
      },
    }));
  };

  const handlePrivacyToggle = () => {
    setUserData((prev) => ({ ...prev, privacySync: !prev.privacySync }));
  };

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify(userData));
    alert("Profile & Settings saved!");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
            Profile & Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Update your personal info, health goals, and preferences
          </p>
        </div>

        {/* Profile Info */}
        <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-blue-700">
            <User className="w-5 h-5" /> Personal Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={userData.name}
              onChange={handleInputChange}
              className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={userData.email}
              onChange={handleInputChange}
              className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={userData.age}
              onChange={handleInputChange}
              className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <select
              name="gender"
              value={userData.gender}
              onChange={handleInputChange}
              className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="number"
              name="weight"
              placeholder="Weight (kg)"
              value={userData.weight}
              onChange={handleInputChange}
              className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <input
              type="number"
              name="height"
              placeholder="Height (cm)"
              value={userData.height}
              onChange={handleInputChange}
              className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
        </div>

        {/* Health Goals */}
        <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-blue-700">
            <Activity className="w-5 h-5" /> Health Goals
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="number"
              name="calorieGoal"
              placeholder="Daily Calorie Goal"
              value={userData.calorieGoal}
              onChange={handleInputChange}
              className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <input
              type="number"
              name="waterGoal"
              placeholder="Daily Water Goal (ml)"
              value={userData.waterGoal}
              onChange={handleInputChange}
              className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <input
              type="number"
              name="fitnessGoal"
              placeholder="Daily Fitness Goal (min)"
              value={userData.fitnessGoal}
              onChange={handleInputChange}
              className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-blue-700">
            <Bell className="w-5 h-5" /> Notification Preferences
          </h2>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center justify-between">
              Medication Reminders
              <input
                type="checkbox"
                checked={userData.notifications.medication}
                onChange={() => handleToggle("medication")}
                className="h-5 w-5 accent-blue-600"
              />
            </label>
            <label className="flex items-center justify-between">
              Upcoming Records Alerts
              <input
                type="checkbox"
                checked={userData.notifications.upcomingRecords}
                onChange={() => handleToggle("upcomingRecords")}
                className="h-5 w-5 accent-blue-600"
              />
            </label>
            <label className="flex items-center justify-between">
              General Reminders
              <input
                type="checkbox"
                checked={userData.notifications.generalReminders}
                onChange={() => handleToggle("generalReminders")}
                className="h-5 w-5 accent-blue-600"
              />
            </label>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
          <h2 className="text-xl font-semibold text-blue-700">Privacy & Data</h2>
          <label className="flex items-center justify-between">
            Enable Data Sync
            <input
              type="checkbox"
              checked={userData.privacySync}
              onChange={handlePrivacyToggle}
              className="h-5 w-5 accent-blue-600"
            />
          </label>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-md"
          >
            Save Changes
          </button>
        </div>

        {/* Back to Dashboard */}
        <div className="text-right mt-4">
          <Link
            to="/dashboard"
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition shadow-md"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSettings;
