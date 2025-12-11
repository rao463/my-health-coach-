import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const categories = ["All", "Breakfast", "Lunch", "Dinner", "Snack"];

const Nutrition = () => {
  const navigate = useNavigate();
  const [meal, setMeal] = useState("");
  const [category, setCategory] = useState("");
  const [calories, setCalories] = useState("");
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState("All");
  const [goalCalories, setGoalCalories] = useState(2000);
  const [search, setSearch] = useState([]);
  const [openCard, setOpenCard] = useState({}); // For collapsible cards

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("nutritionEntries")) || [];
    setEntries(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("nutritionEntries", JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    if (!meal || !category || !calories) return;
    const newEntry = {
      id: Date.now(),
      meal,
      category,
      calories: Number(calories),
      date: new Date().toLocaleDateString()
    };
    setEntries([...entries, newEntry]);
    setMeal(""); setCategory(""); setCalories("");
  };

  const deleteEntry = (id) => setEntries(entries.filter(e => e.id !== id));

  const editEntry = (id) => {
    const entry = entries.find(e => e.id === id);
    setMeal(entry.meal);
    setCategory(entry.category);
    setCalories(entry.calories);
    deleteEntry(id);
  };

  const toggleCard = (id) => setOpenCard(prev => ({...prev, [id]: !prev[id]}));
  const isOpen = (id) => openCard[id];

  const filteredEntries = entries.filter(e =>
    (filter === "All" || e.category === filter) &&
    e.meal.toLowerCase().includes(search.toLowerCase())
  );

  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);

  // Chart Data
  const dates = [...new Set(entries.map(e => e.date))];
  const chartData = dates.map(date => ({
    date,
    calories: entries.filter(e => e.date === date).reduce((sum, e) => sum + e.calories, 0)
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col min-h-screen">
      <h2 className="text-3xl font-bold mb-4">Nutrition Tracker</h2>

      {/* Goal & Search */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2">
          <label className="font-semibold">Daily Goal:</label>
          <input type="number" value={goalCalories} onChange={e => setGoalCalories(Number(e.target.value))} className="border p-1 rounded w-28"/>
        </div>
        <input type="text" placeholder="Search meal..." value={search} onChange={e => setSearch(e.target.value)} className="border p-2 rounded flex-1"/>
      </div>

      {/* Inputs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input type="text" placeholder="Meal Name" value={meal} onChange={(e) => setMeal(e.target.value)} className="border p-2 rounded flex-1"/>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 rounded">
          <option value="">Select Category</option>
          {categories.filter(c => c !== "All").map(cat => <option key={cat}>{cat}</option>)}
        </select>
        <input type="number" placeholder="Calories" value={calories} onChange={(e) => setCalories(e.target.value)} className="border p-2 rounded w-28"/>
        <button className="px-4 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={addEntry}>Add</button>
      </div>

      {/* Filter */}
      <div className="mb-4 flex items-center gap-2">
        <span>Filter by category:</span>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border p-2 rounded">
          {categories.map(cat => <option key={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Chart */}
      <div className="mb-6 w-full h-64 bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Calories per Day</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="date"/>
            <YAxis/>
            <Tooltip/>
            <Bar dataKey="calories" fill="#3b82f6"/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Mobile Cards */}
      <div className="flex flex-col gap-2 md:hidden">
        {filteredEntries.map(entry => (
          <div key={entry.id} className="border p-3 rounded shadow flex flex-col gap-1">
            <div className="flex justify-between font-bold cursor-pointer" onClick={() => toggleCard(entry.id)}>
              {entry.meal} {isOpen(entry.id) ? "-" : "+"}
            </div>
            {isOpen(entry.id) && (
              <div>
                <div>Category: {entry.category}</div>
                <div>Calories: {entry.calories}</div>
                <div>Date: {entry.date}</div>
                <div className="flex gap-2 mt-2">
                  <button className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500" onClick={() => editEntry(entry.id)}>Edit</button>
                  <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => deleteEntry(entry.id)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full border-collapse border mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Meal</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Calories</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map(entry => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="border p-2">{entry.meal}</td>
                <td className="border p-2">{entry.category}</td>
                <td className="border p-2">{entry.calories}</td>
                <td className="border p-2">{entry.date}</td>
                <td className="border p-2 flex gap-2">
                  <button className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500" onClick={() => editEntry(entry.id)}>Edit</button>
                  <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => deleteEntry(entry.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filteredEntries.length === 0 && <tr><td colSpan="5" className="border p-2 text-center text-gray-500">No meals found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Total & Progress */}
      <div className="mt-4 mb-6">
        <div className="font-bold text-lg mb-1">Total Calories: {totalCalories}</div>
        <div className="w-full bg-gray-200 h-4 rounded">
          <div className="bg-blue-600 h-4 rounded" style={{ width: `${Math.min((totalCalories / goalCalories) * 100, 100)}%` }}></div>
        </div>

        {/* View Dashboard */}
        <div className="mt-4">
          <button className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={() => navigate("/dashboard")}>View Dashboard</button>
        </div>
      </div>

      {/* Back */}
      <div className="fixed bottom-4 left-[60%]">
        <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
};

export default Nutrition;
