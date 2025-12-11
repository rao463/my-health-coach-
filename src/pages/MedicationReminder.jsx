import React, { useState } from "react";
import { Bell, Plus, Clock, RefreshCcw } from "lucide-react";
import { Link } from "react-router-dom";

const MedicationReminder = () => {
  const [medication, setMedication] = useState("");
  const [time, setTime] = useState("");
  const [reminders, setReminders] = useState([]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!medication || !time) return;
    setReminders([...reminders, { name: medication.trim(), time }]);
    setMedication("");
    setTime("");
  };

  const handleClearAll = () => {
    setReminders([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-6">
      <div className="container mx-auto max-w-3xl bg-white shadow-lg rounded-2xl p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <Bell className="w-14 h-14 text-blue-600 mb-2" />
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700 text-center">
            Medication Reminder
          </h1>
          <p className="text-gray-600 text-center mt-2 md:text-lg">
            Add your medications with time to get reminders so you never miss a dose.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Medication name"
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg p-4 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-40 border border-gray-300 rounded-lg p-4 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
          >
            <Plus className="w-5 h-5" /> Add
          </button>
        </form>

        {/* Medication List */}
        {reminders.length > 0 ? (
          <div className="space-y-4">
            {reminders.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-600">{item.time}</span>
                </div>
              </div>
            ))}
            <button
              onClick={handleClearAll}
              className="flex items-center justify-center gap-2 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
            >
              <RefreshCcw className="w-5 h-5" /> Clear All
            </button>
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-4">No medications added yet.</p>
        )}

        {/* Back to Dashboard */}
        <div className="mt-6 text-center">
          <Link
            to="/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MedicationReminder;
