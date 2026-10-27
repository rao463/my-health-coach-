import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Utensils, Coffee, Sun, Moon, Cookie, Plus, Trash2, Edit2, Check, X, Lightbulb, Target, TrendingUp, AlertCircle, Sparkles, Send, Loader2, Bot, RefreshCw } from "lucide-react";

const mealTypes = [
  { id: "breakfast", label: "Breakfast", icon: Coffee, color: "bg-orange-500", lightColor: "bg-orange-50", borderColor: "border-orange-200" },
  { id: "lunch", label: "Lunch", icon: Sun, color: "bg-yellow-500", lightColor: "bg-yellow-50", borderColor: "border-yellow-200" },
  { id: "dinner", label: "Dinner", icon: Moon, color: "bg-indigo-500", lightColor: "bg-indigo-50", borderColor: "border-indigo-200" },
  { id: "snacks", label: "Snacks", icon: Cookie, color: "bg-pink-500", lightColor: "bg-pink-50", borderColor: "border-pink-200" },
];

const COLORS = ["#f97316", "#eab308", "#6366f1", "#ec4899"];

const fallbackTips = [
  "Aim to fill half your plate with fruits and vegetables at each meal.",
  "Drink at least 8 glasses of water daily to stay hydrated.",
  "Include lean protein in every meal to maintain muscle mass.",
  "Choose whole grains over refined grains for sustained energy.",
  "Limit added sugars to less than 10% of your daily calories.",
];

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const Nutrition = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [goalCalories, setGoalCalories] = useState(2000);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);

  // AI States
  const [aiTip, setAiTip] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState("checking"); // "online", "offline", "checking", "error"

  // Form states for adding new meal items
  const [newItem, setNewItem] = useState({ name: "", calories: "", notes: "" });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("nutritionEntries")) || [];
    setEntries(stored);
    const storedGoal = localStorage.getItem("calorieGoal");
    if (storedGoal) setGoalCalories(Number(storedGoal));
    // Check Ollama status on load
    checkOllamaStatus();
  }, []);

  // Check if Ollama is running
  const checkOllamaStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/ai/nutrition/health`);
      const data = await response.json();
      if (data.ollama === "online" && data.modelAvailable) {
        setOllamaStatus("online");
        console.log("Using Ollama model:", data.model);
      } else if (data.ollama === "online" && !data.modelAvailable) {
        setOllamaStatus("no-model");
      } else {
        setOllamaStatus("offline");
      }
    } catch {
      setOllamaStatus("offline");
    }
  };

  useEffect(() => {
    localStorage.setItem("nutritionEntries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("calorieGoal", goalCalories.toString());
  }, [goalCalories]);

  // Fetch AI tip when entries change
  useEffect(() => {
    const todayEntries = entries.filter((e) => e.date === selectedDate);
    if (todayEntries.length > 0) {
      fetchAiTip();
    } else {
      setAiTip(fallbackTips[Math.floor(Math.random() * fallbackTips.length)]);
    }
  }, [selectedDate]);

  const getTodayEntries = () => entries.filter((e) => e.date === selectedDate);

  const getEntriesByMealType = (mealType) =>
    getTodayEntries().filter((e) => e.mealType === mealType);

  const getMealTypeCalories = (mealType) =>
    getEntriesByMealType(mealType).reduce((sum, e) => sum + (e.calories || 0), 0);

  const totalCalories = getTodayEntries().reduce((sum, e) => sum + (e.calories || 0), 0);
  const remainingCalories = goalCalories - totalCalories;

  // Fetch AI-powered nutrition tip from Ollama
  const fetchAiTip = async () => {
    setAiLoading(true);
    try {
      const todayMeals = getTodayEntries();
      const mealBreakdown = {
        breakfast: getMealTypeCalories("breakfast"),
        lunch: getMealTypeCalories("lunch"),
        dinner: getMealTypeCalories("dinner"),
        snacks: getMealTypeCalories("snacks"),
      };

      const response = await fetch(`${API_BASE}/api/ai/nutrition/tip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meals: todayMeals,
          totalCalories,
          goalCalories,
          mealBreakdown,
        }),
      });

      const data = await response.json();
      // Update Ollama status
      if (data.ollamaStatus) {
        setOllamaStatus(data.ollamaStatus);
      }
      if (data.tip) {
        setAiTip(data.tip);
      } else if (data.fallbackTip) {
        setAiTip(data.fallbackTip);
      } else {
        setAiTip(fallbackTips[Math.floor(Math.random() * fallbackTips.length)]);
      }
    } catch (error) {
      console.error("Failed to fetch AI tip:", error);
      setAiTip(fallbackTips[Math.floor(Math.random() * fallbackTips.length)]);
      setOllamaStatus("offline");
    } finally {
      setAiLoading(false);
    }
  };

  // Chat with AI nutritionist
  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage.trim();
    setChatHistory((prev) => [...prev, { role: "user", content: userMessage }]);
    setChatMessage("");
    setChatLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/ai/nutrition/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          context: { totalCalories, goalCalories },
        }),
      });

      const data = await response.json();
      if (data.response) {
        setChatHistory((prev) => [...prev, { role: "assistant", content: data.response }]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, I couldn't process that. Please try again." },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Make sure Ollama is running locally." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const addEntry = (mealType) => {
    if (!newItem.name) return;
    const entry = {
      id: Date.now(),
      name: newItem.name.trim(),
      calories: Number(newItem.calories) || 0,
      notes: newItem.notes.trim(),
      mealType,
      date: selectedDate,
    };
    setEntries([...entries, entry]);
    setNewItem({ name: "", calories: "", notes: "" });
    setExpandedMeal(null);
  };

  const deleteEntry = (id) => setEntries(entries.filter((e) => e.id !== id));

  const startEdit = (entry) => {
    setEditingEntry({ ...entry });
  };

  const saveEdit = () => {
    if (!editingEntry.name) return;
    setEntries(
      entries.map((e) =>
        e.id === editingEntry.id
          ? { ...e, name: editingEntry.name.trim(), calories: Number(editingEntry.calories) || 0, notes: editingEntry.notes?.trim() || "" }
          : e
      )
    );
    setEditingEntry(null);
  };

  const cancelEdit = () => setEditingEntry(null);

  // Chart data for calories by meal type
  const pieData = mealTypes.map((type, index) => ({
    name: type.label,
    value: getMealTypeCalories(type.id),
    color: COLORS[index],
  })).filter((d) => d.value > 0);

  // Weekly chart data
  const getWeekDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const weeklyChartData = getWeekDates().map((date) => ({
    date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
    calories: entries.filter((e) => e.date === date).reduce((sum, e) => sum + (e.calories || 0), 0),
    goal: goalCalories,
  }));

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Utensils className="w-10 h-10 text-blue-600" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Nutrition Tracker</h1>
                <p className="text-gray-500">Log meals, track calories, eat smarter</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600">Date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-gray-500" />
                <label className="text-sm font-medium text-gray-600">Goal:</label>
                <input
                  type="number"
                  value={goalCalories}
                  onChange={(e) => setGoalCalories(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-24 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="text-sm text-gray-500">cal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Consumed</p>
            <p className="text-2xl font-bold text-blue-600">{totalCalories}</p>
            <p className="text-xs text-gray-400">calories</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Remaining</p>
            <p className={`text-2xl font-bold ${remainingCalories < 0 ? "text-red-500" : "text-green-600"}`}>
              {remainingCalories}
            </p>
            <p className="text-xs text-gray-400">calories</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Goal</p>
            <p className="text-2xl font-bold text-gray-700">{goalCalories}</p>
            <p className="text-xs text-gray-400">calories</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Progress</p>
            <p className="text-2xl font-bold text-indigo-600">
              {Math.min(Math.round((totalCalories / goalCalories) * 100), 100)}%
            </p>
            <div className="w-full bg-gray-200 h-2 rounded mt-1">
              <div
                className={`h-2 rounded ${totalCalories > goalCalories ? "bg-red-500" : "bg-indigo-600"}`}
                style={{ width: `${Math.min((totalCalories / goalCalories) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* AI-Powered Nutrition Tip */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-purple-800 flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  AI NutriCoach
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      ollamaStatus === "online"
                        ? "bg-green-100 text-green-700"
                        : ollamaStatus === "checking"
                        ? "bg-yellow-100 text-yellow-700"
                        : ollamaStatus === "no-model"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {ollamaStatus === "online" ? "AI Online" : ollamaStatus === "checking" ? "Checking..." : ollamaStatus === "no-model" ? "Model Missing" : "Ollama Offline"}
                  </span>
                </p>
                <button
                  onClick={fetchAiTip}
                  disabled={aiLoading}
                  className="p-1 text-purple-600 hover:bg-purple-100 rounded transition disabled:opacity-50"
                  title="Get new tip"
                >
                  <RefreshCw className={`w-4 h-4 ${aiLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
              {(ollamaStatus === "offline" || ollamaStatus === "no-model") && (
                <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700">
                    {ollamaStatus === "no-model" ? (
                      <><strong>Model not found.</strong> Run: <code className="bg-amber-100 px-1 rounded">ollama pull llama3.2</code></>
                    ) : (
                      <><strong>Ollama is offline.</strong> Start with: <code className="bg-amber-100 px-1 rounded">ollama serve</code> then <code className="bg-amber-100 px-1 rounded">ollama pull llama3.2</code></>
                    )}
                  </p>
                </div>
              )}
              {aiLoading ? (
                <div className="flex items-center gap-2 text-purple-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Analyzing your nutrition...</span>
                </div>
              ) : (
                <p className="text-purple-700 text-sm">{aiTip}</p>
              )}
            </div>
          </div>

          {/* Chat Toggle Button */}
          <button
            onClick={() => setAiChatOpen(!aiChatOpen)}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm font-medium"
          >
            <Bot className="w-4 h-4" />
            {aiChatOpen ? "Close Chat" : "Ask AI Nutritionist"}
          </button>

          {/* AI Chat Interface */}
          {aiChatOpen && (
            <div className="mt-4 bg-white rounded-xl border border-purple-200 overflow-hidden">
              {/* Chat History */}
              <div className="h-64 overflow-y-auto p-4 space-y-3">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Ask me anything about nutrition!</p>
                    <p className="text-xs mt-1">e.g., "What should I eat for dinner?" or "How can I get more protein?"</p>
                  </div>
                ) : (
                  chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.role === "user"
                            ? "bg-purple-600 text-white rounded-br-none"
                            : "bg-gray-100 text-gray-700 rounded-bl-none"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <p className="text-xs text-purple-600 font-medium mb-1 flex items-center gap-1">
                            <Bot className="w-3 h-3" /> NutriCoach
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t border-purple-100 p-3 flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                  placeholder="Ask about nutrition, meal ideas, tips..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={chatLoading || !chatMessage.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Meal Logging Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {mealTypes.map((mealType) => {
            const MealIcon = mealType.icon;
            const mealEntries = getEntriesByMealType(mealType.id);
            const mealCalories = getMealTypeCalories(mealType.id);

            return (
              <div
                key={mealType.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden border ${mealType.borderColor}`}
              >
                {/* Meal Header */}
                <div className={`${mealType.color} px-4 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2 text-white">
                    <MealIcon className="w-5 h-5" />
                    <span className="font-semibold">{mealType.label}</span>
                  </div>
                  <span className="text-white font-medium">{mealCalories} cal</span>
                </div>

                {/* Meal Items */}
                <div className={`${mealType.lightColor} p-4 min-h-[120px]`}>
                  {mealEntries.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No items logged</p>
                  ) : (
                    <div className="space-y-2">
                      {mealEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="bg-white rounded-lg p-3 shadow-sm flex items-start justify-between gap-2"
                        >
                          {editingEntry?.id === entry.id ? (
                            // Edit Mode
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                value={editingEntry.name}
                                onChange={(e) => setEditingEntry({ ...editingEntry, name: e.target.value })}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                placeholder="Food item"
                              />
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  value={editingEntry.calories}
                                  onChange={(e) => setEditingEntry({ ...editingEntry, calories: e.target.value })}
                                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                  placeholder="Cal"
                                />
                                <input
                                  type="text"
                                  value={editingEntry.notes || ""}
                                  onChange={(e) => setEditingEntry({ ...editingEntry, notes: e.target.value })}
                                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                                  placeholder="Notes"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={saveEdit}
                                  className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <>
                              <div className="flex-1">
                                <p className="font-medium text-gray-700">{entry.name}</p>
                                {entry.notes && (
                                  <p className="text-xs text-gray-500 mt-1">{entry.notes}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600">
                                  {entry.calories > 0 ? `${entry.calories} cal` : "-"}
                                </span>
                                <button
                                  onClick={() => startEdit(entry)}
                                  className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteEntry(entry.id)}
                                  className="p-1 text-red-500 hover:bg-red-100 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Item Form */}
                  {expandedMeal === mealType.id ? (
                    <div className="mt-3 bg-white rounded-lg p-3 shadow-sm space-y-2">
                      <input
                        type="text"
                        placeholder="Food item name"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Calories (optional)"
                          value={newItem.calories}
                          onChange={(e) => setNewItem({ ...newItem, calories: e.target.value })}
                          className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Notes (optional)"
                          value={newItem.notes}
                          onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addEntry(mealType.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition"
                        >
                          Add Item
                        </button>
                        <button
                          onClick={() => {
                            setExpandedMeal(null);
                            setNewItem({ name: "", calories: "", notes: "" });
                          }}
                          className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setExpandedMeal(mealType.id)}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add {mealType.label} Item
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart - Calorie Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-700 mb-4">Today's Calorie Distribution</h3>
            {pieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Log meals to see distribution
              </div>
            )}
          </div>

          {/* Bar Chart - Weekly Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-700 mb-4">Weekly Calorie Intake</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="calories" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
