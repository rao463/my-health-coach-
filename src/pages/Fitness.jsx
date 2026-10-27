import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Dumbbell,
  Heart,
  PersonStanding,
  Flame,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Zap,
  Award,
  Activity,
  Bot,
  Sparkles,
  Send,
  RefreshCw,
  Loader2,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const workoutTypes = [
  {
    id: "cardio",
    label: "Cardio",
    icon: Heart,
    color: "bg-red-500",
    lightColor: "bg-red-50",
    borderColor: "border-red-200",
    chartColor: "#ef4444",
  },
  {
    id: "strength",
    label: "Strength",
    icon: Dumbbell,
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    borderColor: "border-blue-200",
    chartColor: "#3b82f6",
  },
  {
    id: "flexibility",
    label: "Flexibility",
    icon: PersonStanding,
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    borderColor: "border-purple-200",
    chartColor: "#8b5cf6",
  },
  {
    id: "hiit",
    label: "HIIT",
    icon: Zap,
    color: "bg-orange-500",
    lightColor: "bg-orange-50",
    borderColor: "border-orange-200",
    chartColor: "#f97316",
  },
];

const intensityLevels = [
  { value: "low", label: "Low", multiplier: 0.8, color: "text-green-600" },
  { value: "moderate", label: "Moderate", multiplier: 1.0, color: "text-yellow-600" },
  { value: "high", label: "High", multiplier: 1.3, color: "text-orange-600" },
  { value: "extreme", label: "Extreme", multiplier: 1.5, color: "text-red-600" },
];

const COLORS = ["#ef4444", "#3b82f6", "#8b5cf6", "#f97316"];

const Fitness = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [weeklyGoal, setWeeklyGoal] = useState(2000);
  const [monthlyGoal, setMonthlyGoal] = useState(8000);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [filter, setFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [viewMode, setViewMode] = useState("week"); // "week" or "month"

  // Form states
  const [newWorkout, setNewWorkout] = useState({
    name: "",
    type: "cardio",
    duration: "",
    intensity: "moderate",
    calories: "",
    notes: "",
  });

  // AI FitCoach states
  const [showAiCoach, setShowAiCoach] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState("checking");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState("");
  const [showQuestionnaire, setShowQuestionnaire] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    fitnessLevel: "beginner",
    goals: "general-fitness",
    availableTime: "30-60",
    preferences: "",
    limitations: "",
    age: "",
    equipment: "",
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("fitnessWorkouts")) || [];
    setEntries(stored);
    const storedWeeklyGoal = localStorage.getItem("fitnessWeeklyGoal");
    const storedMonthlyGoal = localStorage.getItem("fitnessMonthlyGoal");
    if (storedWeeklyGoal) setWeeklyGoal(Number(storedWeeklyGoal));
    if (storedMonthlyGoal) setMonthlyGoal(Number(storedMonthlyGoal));
    // Load saved user profile
    const storedProfile = localStorage.getItem("fitnessUserProfile");
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    }
    // Check Ollama status
    checkOllamaStatus();
  }, []);

  // Check if Ollama is running
  const checkOllamaStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/ai/fitness/health`);
      const data = await response.json();
      if (data.ollama === "online" && data.modelAvailable) {
        setOllamaStatus("online");
      } else if (data.ollama === "online" && !data.modelAvailable) {
        setOllamaStatus("no-model");
      } else {
        setOllamaStatus("offline");
      }
    } catch {
      setOllamaStatus("offline");
    }
  };

  // Save user profile to localStorage
  useEffect(() => {
    localStorage.setItem("fitnessUserProfile", JSON.stringify(userProfile));
  }, [userProfile]);

  // Get AI sport recommendations
  const getRecommendations = async () => {
    setAiLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/ai/fitness/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userProfile),
      });
      const data = await response.json();
      if (data.ollamaStatus) {
        setOllamaStatus(data.ollamaStatus);
      }
      if (data.recommendations) {
        setAiRecommendations(data.recommendations);
      } else if (data.fallbackRecommendations) {
        const fallback = data.fallbackRecommendations
          .map((r, i) => `${i + 1}. ${r.sport} - ${r.reason}`)
          .join("\n");
        setAiRecommendations(fallback);
      }
      setShowQuestionnaire(false);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      setOllamaStatus("offline");
    } finally {
      setAiLoading(false);
    }
  };

  // Chat with AI fitness coach
  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage.trim();
    setChatMessage("");
    setChatHistory((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/ai/fitness/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          context: {
            totalCalories: weeklyCalories,
            weeklyGoal,
            recentActivities: recentActivities.map((a) => a.name).join(", "),
          },
        }),
      });
      const data = await response.json();
      if (data.ollamaStatus) {
        setOllamaStatus(data.ollamaStatus);
      }
      setChatHistory((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process your request. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("fitnessWorkouts", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("fitnessWeeklyGoal", weeklyGoal.toString());
    localStorage.setItem("fitnessMonthlyGoal", monthlyGoal.toString());
  }, [weeklyGoal, monthlyGoal]);

  // Get entries for selected date
  const getTodayEntries = () => entries.filter((e) => e.date === selectedDate);

  // Get entries by workout type
  const getEntriesByType = (type) => getTodayEntries().filter((e) => e.type === type);

  // Calculate calories by type for today
  const getTypeCalories = (type) =>
    getEntriesByType(type).reduce((sum, e) => sum + (e.calories || 0), 0);

  // Calculate total calories for today
  const todayCalories = getTodayEntries().reduce((sum, e) => sum + (e.calories || 0), 0);
  const todayDuration = getTodayEntries().reduce((sum, e) => sum + (e.duration || 0), 0);
  const todayWorkouts = getTodayEntries().length;

  // Weekly calculations
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const weeklyCalories = entries
    .filter((e) => weekDates.includes(e.date))
    .reduce((sum, e) => sum + (e.calories || 0), 0);

  // Monthly calculations
  const getMonthDates = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const monthDates = getMonthDates();
  const monthlyCalories = entries
    .filter((e) => monthDates.includes(e.date))
    .reduce((sum, e) => sum + (e.calories || 0), 0);

  // Add new workout
  const addWorkout = () => {
    if (!newWorkout.name || !newWorkout.duration) return;

    const entry = {
      id: Date.now(),
      name: newWorkout.name.trim(),
      type: newWorkout.type,
      duration: Number(newWorkout.duration),
      intensity: newWorkout.intensity,
      calories: Number(newWorkout.calories) || estimateCalories(newWorkout),
      notes: newWorkout.notes.trim(),
      date: selectedDate,
      timestamp: new Date().toISOString(),
    };

    setEntries([...entries, entry]);
    setNewWorkout({
      name: "",
      type: "cardio",
      duration: "",
      intensity: "moderate",
      calories: "",
      notes: "",
    });
    setShowAddForm(false);
  };

  // Estimate calories based on workout type, duration, and intensity
  const estimateCalories = (workout) => {
    const baseCaloriesPerMinute = {
      cardio: 10,
      strength: 8,
      flexibility: 4,
      hiit: 14,
    };
    const intensity = intensityLevels.find((i) => i.value === workout.intensity);
    const base = baseCaloriesPerMinute[workout.type] || 8;
    return Math.round(base * workout.duration * (intensity?.multiplier || 1));
  };

  // Delete workout
  const deleteEntry = (id) => setEntries(entries.filter((e) => e.id !== id));

  // Start editing
  const startEdit = (entry) => {
    setEditingEntry({ ...entry });
  };

  // Save edit
  const saveEdit = () => {
    if (!editingEntry.name || !editingEntry.duration) return;
    setEntries(
      entries.map((e) =>
        e.id === editingEntry.id
          ? {
              ...e,
              name: editingEntry.name.trim(),
              type: editingEntry.type,
              duration: Number(editingEntry.duration),
              intensity: editingEntry.intensity,
              calories: Number(editingEntry.calories),
              notes: editingEntry.notes?.trim() || "",
            }
          : e
      )
    );
    setEditingEntry(null);
  };

  // Cancel edit
  const cancelEdit = () => setEditingEntry(null);

  // Filter entries
  const filteredEntries =
    filter === "all" ? getTodayEntries() : getTodayEntries().filter((e) => e.type === filter);

  // Chart data - Weekly
  const weeklyChartData = weekDates.map((date) => ({
    date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
    calories: entries.filter((e) => e.date === date).reduce((sum, e) => sum + (e.calories || 0), 0),
    duration: entries.filter((e) => e.date === date).reduce((sum, e) => sum + (e.duration || 0), 0),
  }));

  // Pie chart data - Workout type distribution
  const pieData = workoutTypes
    .map((type) => ({
      name: type.label,
      value: entries
        .filter((e) => weekDates.includes(e.date) && e.type === type.id)
        .reduce((sum, e) => sum + (e.calories || 0), 0),
      color: type.chartColor,
    }))
    .filter((d) => d.value > 0);

  // Recent activities (last 5)
  const recentActivities = [...entries]
    .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))
    .slice(0, 5);

  // Format duration
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Get workout type info
  const getTypeInfo = (typeId) => workoutTypes.find((t) => t.id === typeId) || workoutTypes[0];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Activity className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Fitness Tracker</h1>
                <p className="text-gray-500">Log workouts, track progress, achieve goals</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
              >
                <Plus className="w-5 h-5" />
                Log Workout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <p className="text-sm text-gray-500">Today's Burn</p>
            </div>
            <p className="text-2xl font-bold text-orange-600">{todayCalories}</p>
            <p className="text-xs text-gray-400">calories</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <p className="text-sm text-gray-500">Duration</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{formatDuration(todayDuration)}</p>
            <p className="text-xs text-gray-400">today</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="w-5 h-5 text-purple-500" />
              <p className="text-sm text-gray-500">Workouts</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{todayWorkouts}</p>
            <p className="text-xs text-gray-400">sessions today</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-green-500" />
              <p className="text-sm text-gray-500">Weekly Goal</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {Math.min(Math.round((weeklyCalories / weeklyGoal) * 100), 100)}%
            </p>
            <div className="w-full bg-gray-200 h-2 rounded mt-1">
              <div
                className={`h-2 rounded ${weeklyCalories >= weeklyGoal ? "bg-green-500" : "bg-green-400"}`}
                style={{ width: `${Math.min((weeklyCalories / weeklyGoal) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Fitness Goals
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Weekly Goal */}
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-green-800">Weekly Goal</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                    className="w-20 border border-green-300 rounded px-2 py-1 text-sm text-center"
                  />
                  <span className="text-sm text-green-600">cal</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-700">{weeklyCalories} / {weeklyGoal} cal</span>
                <span className="text-sm font-medium text-green-700">
                  {Math.min(Math.round((weeklyCalories / weeklyGoal) * 100), 100)}%
                </span>
              </div>
              <div className="w-full bg-green-200 h-3 rounded-full">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                  style={{ width: `${Math.min((weeklyCalories / weeklyGoal) * 100, 100)}%` }}
                />
              </div>
              {weeklyCalories >= weeklyGoal && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <Award className="w-4 h-4" /> Weekly goal achieved!
                </p>
              )}
            </div>

            {/* Monthly Goal */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-blue-800">Monthly Goal</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={monthlyGoal}
                    onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                    className="w-20 border border-blue-300 rounded px-2 py-1 text-sm text-center"
                  />
                  <span className="text-sm text-blue-600">cal</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-700">{monthlyCalories} / {monthlyGoal} cal</span>
                <span className="text-sm font-medium text-blue-700">
                  {Math.min(Math.round((monthlyCalories / monthlyGoal) * 100), 100)}%
                </span>
              </div>
              <div className="w-full bg-blue-200 h-3 rounded-full">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all"
                  style={{ width: `${Math.min((monthlyCalories / monthlyGoal) * 100, 100)}%` }}
                />
              </div>
              {monthlyCalories >= monthlyGoal && (
                <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                  <Award className="w-4 h-4" /> Monthly goal achieved!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* AI FitCoach Section */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl shadow-lg p-6 mb-6 border border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  AI FitCoach
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
                    {ollamaStatus === "online"
                      ? "AI Online"
                      : ollamaStatus === "checking"
                      ? "Checking..."
                      : ollamaStatus === "no-model"
                      ? "Model Missing"
                      : "Offline"}
                  </span>
                </h3>
                <p className="text-sm text-emerald-600">
                  Get personalized sport recommendations based on your profile
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAiCoach(!showAiCoach)}
              className="p-2 hover:bg-emerald-100 rounded-lg transition"
            >
              {showAiCoach ? (
                <ChevronUp className="w-5 h-5 text-emerald-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-emerald-600" />
              )}
            </button>
          </div>

          {(ollamaStatus === "offline" || ollamaStatus === "no-model") && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                {ollamaStatus === "no-model" ? (
                  <>
                    <strong>Model not found.</strong> Run:{" "}
                    <code className="bg-amber-100 px-1 rounded">ollama pull llama3.2</code>
                  </>
                ) : (
                  <>
                    <strong>Ollama is offline.</strong> Start with:{" "}
                    <code className="bg-amber-100 px-1 rounded">ollama serve</code>
                  </>
                )}
              </p>
            </div>
          )}

          {showAiCoach && (
            <div className="space-y-4">
              {showQuestionnaire ? (
                <>
                  {/* Questionnaire */}
                  <div className="bg-white rounded-lg p-4 space-y-4">
                    <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Tell us about yourself
                    </h4>

                    {/* Fitness Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Current Fitness Level
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {["beginner", "intermediate", "advanced"].map((level) => (
                          <button
                            key={level}
                            onClick={() => setUserProfile({ ...userProfile, fitnessLevel: level })}
                            className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition capitalize ${
                              userProfile.fitnessLevel === level
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Goals */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Primary Fitness Goal
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { id: "weight-loss", label: "Weight Loss", icon: Flame },
                          { id: "muscle-building", label: "Build Muscle", icon: Dumbbell },
                          { id: "general-fitness", label: "Stay Fit", icon: Heart },
                          { id: "flexibility", label: "Flexibility", icon: PersonStanding },
                        ].map((goal) => {
                          const GoalIcon = goal.icon;
                          return (
                            <button
                              key={goal.id}
                              onClick={() => setUserProfile({ ...userProfile, goals: goal.id })}
                              className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition flex items-center gap-2 justify-center ${
                                userProfile.goals === goal.id
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <GoalIcon className="w-4 h-4" />
                              {goal.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Available Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Time Available per Session
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: "15-30", label: "15-30 min" },
                          { id: "30-60", label: "30-60 min" },
                          { id: "60-90", label: "1-1.5 hrs" },
                          { id: "90+", label: "90+ min" },
                        ].map((time) => (
                          <button
                            key={time.id}
                            onClick={() => setUserProfile({ ...userProfile, availableTime: time.id })}
                            className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition ${
                              userProfile.availableTime === time.id
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {time.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Age Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Age Range (optional)
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {["18-25", "26-35", "36-45", "46-55", "55+"].map((age) => (
                          <button
                            key={age}
                            onClick={() => setUserProfile({ ...userProfile, age })}
                            className={`py-2 px-2 rounded-lg border-2 text-sm font-medium transition ${
                              userProfile.age === age
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {age}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preferences & Limitations */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Preferences (optional)
                        </label>
                        <input
                          type="text"
                          value={userProfile.preferences}
                          onChange={(e) =>
                            setUserProfile({ ...userProfile, preferences: e.target.value })
                          }
                          placeholder="e.g., outdoor activities, team sports"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Limitations/Concerns (optional)
                        </label>
                        <input
                          type="text"
                          value={userProfile.limitations}
                          onChange={(e) =>
                            setUserProfile({ ...userProfile, limitations: e.target.value })
                          }
                          placeholder="e.g., bad knees, back pain"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Equipment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Available Equipment (optional)
                      </label>
                      <input
                        type="text"
                        value={userProfile.equipment}
                        onChange={(e) =>
                          setUserProfile({ ...userProfile, equipment: e.target.value })
                        }
                        placeholder="e.g., dumbbells, treadmill, gym access"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    {/* Get Recommendations Button */}
                    <button
                      onClick={getRecommendations}
                      disabled={aiLoading}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analyzing your profile...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Get Sport Recommendations
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Recommendations Display */}
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-600" />
                        Your Personalized Recommendations
                      </h4>
                      <button
                        onClick={() => {
                          setShowQuestionnaire(true);
                          setAiRecommendations("");
                        }}
                        className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retake Quiz
                      </button>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                      <p className="text-gray-700 whitespace-pre-line">{aiRecommendations}</p>
                    </div>
                  </div>

                  {/* Chat with AI */}
                  <div className="bg-white rounded-lg p-4">
                    <button
                      onClick={() => setChatOpen(!chatOpen)}
                      className="w-full flex items-center justify-between text-gray-700 font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-emerald-600" />
                        Ask FitCoach a Question
                      </span>
                      {chatOpen ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>

                    {chatOpen && (
                      <div className="mt-4 space-y-3">
                        {/* Chat History */}
                        {chatHistory.length > 0 && (
                          <div className="max-h-64 overflow-y-auto space-y-2 p-3 bg-gray-50 rounded-lg">
                            {chatHistory.map((msg, idx) => (
                              <div
                                key={idx}
                                className={`p-2 rounded-lg text-sm ${
                                  msg.role === "user"
                                    ? "bg-emerald-100 text-emerald-800 ml-8"
                                    : "bg-white border text-gray-700 mr-8"
                                }`}
                              >
                                {msg.role === "assistant" && (
                                  <span className="text-xs text-emerald-600 font-medium block mb-1">
                                    FitCoach:
                                  </span>
                                )}
                                {msg.content}
                              </div>
                            ))}
                            {chatLoading && (
                              <div className="flex items-center gap-2 text-gray-500 text-sm p-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                FitCoach is thinking...
                              </div>
                            )}
                          </div>
                        )}

                        {/* Chat Input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                            placeholder="Ask about workouts, sports, or fitness tips..."
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                          <button
                            onClick={sendChatMessage}
                            disabled={chatLoading || !chatMessage.trim()}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Add Workout Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Log Workout</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Workout Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workout Name *
                  </label>
                  <input
                    type="text"
                    value={newWorkout.name}
                    onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                    placeholder="e.g., Morning Run, Bench Press"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                {/* Workout Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workout Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {workoutTypes.map((type) => {
                      const TypeIcon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setNewWorkout({ ...newWorkout, type: type.id })}
                          className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition ${
                            newWorkout.type === type.id
                              ? `${type.borderColor} ${type.lightColor} border-2`
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <TypeIcon className={`w-5 h-5 ${newWorkout.type === type.id ? type.color.replace("bg-", "text-") : "text-gray-400"}`} />
                          <span className="text-xs font-medium">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration & Intensity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (min) *
                    </label>
                    <input
                      type="number"
                      value={newWorkout.duration}
                      onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value })}
                      placeholder="30"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Intensity
                    </label>
                    <select
                      value={newWorkout.intensity}
                      onChange={(e) => setNewWorkout({ ...newWorkout, intensity: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                    >
                      {intensityLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Calories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calories Burned (optional)
                  </label>
                  <input
                    type="number"
                    value={newWorkout.calories}
                    onChange={(e) => setNewWorkout({ ...newWorkout, calories: e.target.value })}
                    placeholder={`Auto-estimate: ~${estimateCalories(newWorkout)} cal`}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-estimate based on workout type and duration
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={newWorkout.notes}
                    onChange={(e) => setNewWorkout({ ...newWorkout, notes: e.target.value })}
                    placeholder="How did it feel? Any PRs?"
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={addWorkout}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition"
                  >
                    Log Workout
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workout Cards by Type */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-green-600" />
              Today's Workouts
            </h3>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="all">All Types</option>
              {workoutTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No workouts logged for this day</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm"
              >
                Log Your First Workout
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredEntries.map((entry) => {
                const typeInfo = getTypeInfo(entry.type);
                const TypeIcon = typeInfo.icon;
                const intensityInfo = intensityLevels.find((i) => i.value === entry.intensity);

                return (
                  <div
                    key={entry.id}
                    className={`bg-white rounded-xl shadow-lg overflow-hidden border ${typeInfo.borderColor}`}
                  >
                    {editingEntry?.id === entry.id ? (
                      // Edit Mode
                      <div className="p-4 space-y-3">
                        <input
                          type="text"
                          value={editingEntry.name}
                          onChange={(e) =>
                            setEditingEntry({ ...editingEntry, name: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={editingEntry.type}
                            onChange={(e) =>
                              setEditingEntry({ ...editingEntry, type: e.target.value })
                            }
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            {workoutTypes.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                          <select
                            value={editingEntry.intensity}
                            onChange={(e) =>
                              setEditingEntry({ ...editingEntry, intensity: e.target.value })
                            }
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            {intensityLevels.map((l) => (
                              <option key={l.value} value={l.value}>
                                {l.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={editingEntry.duration}
                            onChange={(e) =>
                              setEditingEntry({ ...editingEntry, duration: e.target.value })
                            }
                            placeholder="Duration"
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                          <input
                            type="number"
                            value={editingEntry.calories}
                            onChange={(e) =>
                              setEditingEntry({ ...editingEntry, calories: e.target.value })
                            }
                            placeholder="Calories"
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                          >
                            <Check className="w-4 h-4 mx-auto" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex-1 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm"
                          >
                            <X className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <div className={`${typeInfo.color} px-4 py-2 flex items-center justify-between`}>
                          <div className="flex items-center gap-2 text-white">
                            <TypeIcon className="w-5 h-5" />
                            <span className="font-medium">{typeInfo.label}</span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEdit(entry)}
                              className="p-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-white transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteEntry(entry.id)}
                              className="p-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-white transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-800 text-lg">{entry.name}</h4>
                          <div className="flex flex-wrap gap-3 mt-2 text-sm">
                            <span className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-4 h-4" />
                              {formatDuration(entry.duration)}
                            </span>
                            <span className="flex items-center gap-1 text-orange-600">
                              <Flame className="w-4 h-4" />
                              {entry.calories} cal
                            </span>
                            <span className={`flex items-center gap-1 ${intensityInfo?.color || "text-gray-600"}`}>
                              <Zap className="w-4 h-4" />
                              {intensityInfo?.label || entry.intensity}
                            </span>
                          </div>
                          {entry.notes && (
                            <p className="text-sm text-gray-500 mt-2 italic">{entry.notes}</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Weekly Progress Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Weekly Progress
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border">
                            <p className="font-medium">{payload[0].payload.date}</p>
                            <p className="text-orange-600">{payload[0].value} calories</p>
                            <p className="text-blue-600">{payload[0].payload.duration} min</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="calories" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Workout Type Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-700 mb-4">Workout Distribution (This Week)</h3>
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
                Log workouts to see distribution
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Recent Activities
            </h3>
            <div className="space-y-3">
              {recentActivities.map((activity) => {
                const typeInfo = getTypeInfo(activity.type);
                const TypeIcon = typeInfo.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${typeInfo.lightColor} rounded-lg`}>
                        <TypeIcon className={`w-5 h-5 ${typeInfo.color.replace("bg-", "text-")}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{activity.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-orange-600">{activity.calories} cal</p>
                      <p className="text-sm text-gray-500">{formatDuration(activity.duration)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

export default Fitness;
