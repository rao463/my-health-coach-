import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus, Edit2, Trash2, Bell } from "lucide-react";

const HealthRecordManagement = () => {
  const [records, setRecords] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({ type: "", date: "", notes: "" });
  const [editingIndex, setEditingIndex] = useState(null);
  const [search, setSearch] = useState("");
  const location = useLocation();

  // Load records from localStorage
  useEffect(() => {
    const savedRecords = JSON.parse(localStorage.getItem("healthRecords")) || [];
    setRecords(savedRecords);

    // Check if a record index was passed via location state (from Dashboard)
    if (location.state?.highlightIndex !== undefined) {
      setEditingIndex(location.state.highlightIndex);
      setNewRecord(savedRecords[location.state.highlightIndex]);
      setModalOpen(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);

  const saveRecords = (updatedRecords) => {
    setRecords(updatedRecords);
    localStorage.setItem("healthRecords", JSON.stringify(updatedRecords));
  };

  const handleAddOrUpdateRecord = () => {
    if (!newRecord.type || !newRecord.date) return;
    const updated = [...records];
    if (editingIndex !== null) {
      updated[editingIndex] = newRecord;
    } else {
      updated.unshift(newRecord);
    }
    saveRecords(updated);
    setNewRecord({ type: "", date: "", notes: "" });
    setEditingIndex(null);
    setModalOpen(false);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setNewRecord(records[index]);
    setModalOpen(true);
  };

  const handleDelete = (index) => {
    const updated = records.filter((_, i) => i !== index);
    saveRecords(updated);
  };

  const filteredRecords = records
    .filter(
      (r) =>
        r.type.toLowerCase().includes(search.toLowerCase()) ||
        r.notes.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const latestRecordDate = records.length > 0 ? records[0].date : "N/A";

  // Upcoming alerts (records with future dates)
  const upcomingRecords = records
    .filter((r) => new Date(r.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const getDaysLeft = (date) => {
    const today = new Date();
    const recordDate = new Date(date);
    const diffTime = recordDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getAlertColor = (days) => {
    if (days <= 3) return "bg-red-100 text-red-700";
    if (days <= 7) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 text-center">
          Health Records
        </h1>
        <p className="text-gray-600 text-center md:text-lg">
          Manage and track your personal health history.
        </p>

        {/* Upcoming Alerts */}
        {upcomingRecords.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
              <Bell className="w-5 h-5" /> Upcoming Alerts
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {upcomingRecords.map((record, index) => {
                const daysLeft = getDaysLeft(record.date);
                const recordIndex = records.findIndex(r => r.date === record.date && r.type === record.type);
                return (
                  <button
                    key={index}
                    onClick={() => {
                      handleEdit(recordIndex);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`p-4 rounded-2xl shadow-md ${getAlertColor(daysLeft)} hover:scale-105 transition transform w-full text-left`}
                  >
                    <span className="font-semibold">{record.type}</span>
                    <p className="text-sm">Date: {record.date}</p>
                    <p className="text-sm">In {daysLeft} day{daysLeft > 1 ? "s" : ""}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center">
            <span className="text-gray-500 text-sm">Total Records</span>
            <span className="text-2xl font-bold text-blue-700">{records.length}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center">
            <span className="text-gray-500 text-sm">Latest Record</span>
            <span className="text-2xl font-bold text-blue-700">{latestRecordDate}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center">
            <span className="text-gray-500 text-sm">Upcoming Records</span>
            <span className="text-2xl font-bold text-green-600">{upcomingRecords.length}</span>
          </div>
        </div>

        {/* Search and Add Button */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none w-full md:w-1/3"
          />
          <button
            onClick={() => { setModalOpen(true); setEditingIndex(null); setNewRecord({ type: "", date: "", notes: "" }); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Record
          </button>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-2xl shadow-md p-6 overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Notes</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td
                      className={`px-4 py-2 font-medium ${
                        record.type.toLowerCase().includes("vaccination") ? "text-green-600" :
                        record.type.toLowerCase().includes("allergy") ? "text-red-600" :
                        record.type.toLowerCase().includes("lab") ? "text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {record.type}
                    </td>
                    <td className="px-4 py-2">{record.date}</td>
                    <td className="px-4 py-2">{record.notes}</td>
                    <td className="px-4 py-2 flex space-x-2">
                      <button
                        onClick={() => handleEdit(index)}
                        className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg hover:bg-yellow-200 transition"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-gray-400 py-4">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
              <h2 className="text-xl font-semibold text-blue-700 mb-4">
                {editingIndex !== null ? "Edit Record" : "Add Record"}
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Type (Lab, Vaccination, Allergy...)"
                  value={newRecord.type}
                  onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
                  className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <input
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                  className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <textarea
                  placeholder="Notes"
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
                  rows={3}
                />
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOrUpdateRecord}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  {editingIndex !== null ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="text-right mt-8">
          <Link
            to="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-md"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HealthRecordManagement;
