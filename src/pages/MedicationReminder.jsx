import React, { useState } from "react";
import { Bell, Plus, Clock, RefreshCcw, Edit2, Trash2, X, Check, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const MedicationReminder = () => {
  const [medication, setMedication] = useState("");
  const [time, setTime] = useState("");
  const [reminders, setReminders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editTime, setEditTime] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!medication || !time) return;
    setReminders([
      ...reminders,
      { id: Date.now(), name: medication.trim(), time },
    ]);
    setMedication("");
    setTime("");
  };

  const handleDelete = (id) => {
    setReminders(reminders.filter((item) => item.id !== id));
  };

  const handleEditStart = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditTime(item.time);
  };

  const handleEditSave = (id) => {
    if (!editName || !editTime) return;
    setReminders(
      reminders.map((item) =>
        item.id === id ? { ...item, name: editName.trim(), time: editTime } : item
      )
    );
    setEditingId(null);
    setEditName("");
    setEditTime("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName("");
    setEditTime("");
  };

  const handleClearAll = () => {
    setReminders([]);
  };

  // Get upcoming doses sorted by time
  const getUpcomingDoses = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    return [...reminders]
      .map((item) => {
        const [hours, minutes] = item.time.split(":").map(Number);
        const itemTime = hours * 60 + minutes;
        const isUpcoming = itemTime >= currentTime;
        return { ...item, itemTime, isUpcoming };
      })
      .sort((a, b) => {
        // Upcoming doses first, then past doses
        if (a.isUpcoming && !b.isUpcoming) return -1;
        if (!a.isUpcoming && b.isUpcoming) return 1;
        return a.itemTime - b.itemTime;
      });
  };

  const formatTime12Hour = (time24) => {
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const upcomingDoses = getUpcomingDoses();

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
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition"
          >
            <Plus className="w-5 h-5" /> Add
          </button>
        </form>

        {/* Upcoming Doses Section */}
        {reminders.length > 0 && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-green-700">Upcoming Doses</h2>
            </div>
            <div className="space-y-2">
              {upcomingDoses.filter((d) => d.isUpcoming).length > 0 ? (
                upcomingDoses
                  .filter((d) => d.isUpcoming)
                  .map((dose) => (
                    <div
                      key={dose.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"
                    >
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-700">{dose.name}</span>
                      <span className="text-green-600 font-medium">
                        {formatTime12Hour(dose.time)}
                      </span>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-sm">No more doses remaining for today.</p>
              )}
            </div>
          </div>
        )}

        {/* Medication List */}
        {reminders.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">All Medications</h2>
            {reminders.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-xl"
              >
                {editingId === item.id ? (
                  // Edit Mode
                  <div className="flex flex-1 flex-col md:flex-row items-center gap-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="w-32 border border-gray-300 rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSave(item.id)}
                        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="p-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">{item.name}</span>
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-600">{formatTime12Hour(item.time)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditStart(item)}
                        className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            <button
              onClick={handleClearAll}
              className="flex items-center justify-center gap-2 w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition"
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
