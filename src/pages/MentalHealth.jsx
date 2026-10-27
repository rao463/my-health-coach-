import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Smile,
  Meh,
  Frown,
  Heart,
  Wind,
  MessageSquare,
  BookOpen,
  Send,
  Brain,
  Sparkles,
  Bot,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RotateCcw,
  Target,
  TrendingUp,
  Moon,
  Sun,
  Zap,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Leaf,
  Coffee,
  Activity,
  X,
  Trash2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

// Mood options with values
const moodOptions = [
  { id: "great", label: "Great", icon: Smile, color: "text-green-500", bgColor: "bg-green-100", value: 5 },
  { id: "good", label: "Good", icon: Smile, color: "text-emerald-500", bgColor: "bg-emerald-100", value: 4 },
  { id: "okay", label: "Okay", icon: Meh, color: "text-yellow-500", bgColor: "bg-yellow-100", value: 3 },
  { id: "low", label: "Low", icon: Frown, color: "text-orange-500", bgColor: "bg-orange-100", value: 2 },
  { id: "struggling", label: "Struggling", icon: Frown, color: "text-red-500", bgColor: "bg-red-100", value: 1 },
];

// Guided exercise types
const exerciseTypes = [
  { id: "breathing", label: "Deep Breathing", icon: Wind, color: "bg-blue-500" },
  { id: "meditation", label: "Meditation", icon: Brain, color: "bg-purple-500" },
  { id: "grounding", label: "Grounding", icon: Leaf, color: "bg-green-500" },
  { id: "relaxation", label: "Relaxation", icon: Moon, color: "bg-indigo-500" },
];

const MentalHealth = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  // Core states
  const [currentMood, setCurrentMood] = useState("");
  const [stressLevel, setStressLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState("okay");
  const [energyLevel, setEnergyLevel] = useState("moderate");
  const [moodHistory, setMoodHistory] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [journalText, setJournalText] = useState("");

  // AI states
  const [ollamaStatus, setOllamaStatus] = useState("checking");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAssessment, setShowAssessment] = useState(true);
  const [recommendations, setRecommendations] = useState("");
  const [mainConcerns, setMainConcerns] = useState("");

  // Chat states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Exercise states
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseContent, setExerciseContent] = useState("");
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("inhale");
  const [breathingTimer, setBreathingTimer] = useState(0);
  const [breathingCycles, setBreathingCycles] = useState(0);

  // Load data from localStorage
  useEffect(() => {
    const storedMoods = JSON.parse(localStorage.getItem("mentalHealthMoods")) || [];
    const storedJournals = JSON.parse(localStorage.getItem("mentalHealthJournals")) || [];
    const storedChat = JSON.parse(localStorage.getItem("mentalHealthChat")) || [];
    setMoodHistory(storedMoods);
    setJournalEntries(storedJournals);
    setChatHistory(storedChat);
    checkOllamaStatus();
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("mentalHealthMoods", JSON.stringify(moodHistory));
  }, [moodHistory]);

  useEffect(() => {
    localStorage.setItem("mentalHealthJournals", JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem("mentalHealthChat", JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Check Ollama status
  const checkOllamaStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/ai/mentalhealth/health`);
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

  // Breathing exercise timer
  useEffect(() => {
    let interval;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathingTimer((prev) => {
          if (prev <= 1) {
            // Cycle through phases
            if (breathingPhase === "inhale") {
              setBreathingPhase("hold");
              return 4;
            } else if (breathingPhase === "hold") {
              setBreathingPhase("exhale");
              return 6;
            } else {
              setBreathingPhase("inhale");
              setBreathingCycles((c) => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathingActive, breathingPhase]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Log mood
  const logMood = (mood) => {
    setCurrentMood(mood.id);
    const entry = {
      id: Date.now(),
      mood: mood.id,
      value: mood.value,
      date: new Date().toISOString(),
      stressLevel,
    };
    setMoodHistory([...moodHistory, entry]);
  };

  // Save journal entry
  const saveJournal = () => {
    if (!journalText.trim()) return;
    const entry = {
      id: Date.now(),
      text: journalText.trim(),
      date: new Date().toISOString(),
      mood: currentMood,
    };
    setJournalEntries([entry, ...journalEntries]);
    setJournalText("");
  };

  // Delete journal entry
  const deleteJournal = (id) => {
    setJournalEntries(journalEntries.filter((e) => e.id !== id));
  };

  // Get AI recommendations
  const getRecommendations = async () => {
    setAiLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/ai/mentalhealth/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentMood,
          stressLevel,
          sleepQuality,
          energyLevel,
          mainConcerns,
        }),
      });
      const data = await response.json();
      if (data.ollamaStatus) setOllamaStatus(data.ollamaStatus);
      if (data.recommendations) {
        setRecommendations(data.recommendations);
      } else if (data.fallbackRecommendations) {
        const fallback = data.fallbackRecommendations
          .map((r) => `${r.title}: ${r.description}`)
          .join("\n\n");
        setRecommendations(fallback);
      }
      setShowAssessment(false);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
    } finally {
      setAiLoading(false);
    }
  };

  // Get guided exercise
  const getGuidedExercise = async (type) => {
    setSelectedExercise(type);
    setExerciseLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/ai/mentalhealth/exercise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseType: type.id,
          duration: "5",
          currentState: currentMood || "neutral",
        }),
      });
      const data = await response.json();
      if (data.exercise) {
        setExerciseContent(data.exercise);
      } else if (data.fallbackExercise) {
        setExerciseContent(data.fallbackExercise);
      }
    } catch (error) {
      console.error("Failed to get exercise:", error);
    } finally {
      setExerciseLoading(false);
    }
  };

  // Chat with AI - sends conversation history for context
  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage.trim();
    setChatMessage("");

    // Add user message to history
    const updatedHistory = [...chatHistory, { role: "user", content: userMsg }];
    setChatHistory(updatedHistory);
    setChatLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/ai/mentalhealth/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          context: { currentMood, stressLevel },
          // Send conversation history so Maya can remember what was discussed
          conversationHistory: chatHistory,
        }),
      });
      const data = await response.json();
      if (data.ollamaStatus) setOllamaStatus(data.ollamaStatus);
      setChatHistory((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "I'm here for you. Please try again in a moment." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Start breathing exercise
  const startBreathing = () => {
    setBreathingActive(true);
    setBreathingPhase("inhale");
    setBreathingTimer(4);
    setBreathingCycles(0);
  };

  // Stop breathing exercise
  const stopBreathing = () => {
    setBreathingActive(false);
    setBreathingTimer(0);
    setBreathingCycles(0);
  };

  // Chart data
  const chartData = moodHistory.slice(-14).map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("en-US", { weekday: "short" }),
    mood: entry.value,
    stress: entry.stressLevel,
  }));

  // Get mood label
  const getMoodInfo = (moodId) => moodOptions.find((m) => m.id === moodId) || moodOptions[2];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Mental Wellness</h1>
                <p className="text-gray-500">Track mood, manage stress, find peace</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  ollamaStatus === "online"
                    ? "bg-green-100 text-green-700"
                    : ollamaStatus === "checking"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {ollamaStatus === "online" ? "AI Online" : ollamaStatus === "checking" ? "Checking..." : "AI Offline"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Mood Check */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            How are you feeling right now?
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {moodOptions.map((mood) => {
              const MoodIcon = mood.icon;
              return (
                <button
                  key={mood.id}
                  onClick={() => logMood(mood)}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                    currentMood === mood.id
                      ? `${mood.bgColor} border-current ${mood.color}`
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <MoodIcon className={`w-8 h-8 ${mood.color}`} />
                  <span className="mt-2 text-sm font-medium">{mood.label}</span>
                </button>
              );
            })}
          </div>
          {currentMood && (
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Thanks for checking in! You're feeling{" "}
                <span className={`font-semibold ${getMoodInfo(currentMood).color}`}>
                  {getMoodInfo(currentMood).label}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Stress & Assessment */}
          <div className="space-y-6">
            {/* Stress Level */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Stress Level
              </h3>
              <div className="space-y-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-green-300 via-yellow-300 to-red-400 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Calm</span>
                  <span className="font-semibold text-lg text-gray-700">{stressLevel}/10</span>
                  <span>Very Stressed</span>
                </div>
              </div>
            </div>

            {/* Quick Assessment */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                Daily Check-In
              </h3>
              <div className="space-y-4">
                {/* Sleep Quality */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    <Moon className="w-4 h-4 inline mr-1" /> Sleep Quality
                  </label>
                  <div className="flex gap-2">
                    {["poor", "okay", "good", "great"].map((quality) => (
                      <button
                        key={quality}
                        onClick={() => setSleepQuality(quality)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition capitalize ${
                          sleepQuality === quality
                            ? "bg-indigo-500 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {quality}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    <Coffee className="w-4 h-4 inline mr-1" /> Energy Level
                  </label>
                  <div className="flex gap-2">
                    {["low", "moderate", "high", "energized"].map((level) => (
                      <button
                        key={level}
                        onClick={() => setEnergyLevel(level)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition capitalize ${
                          energyLevel === level
                            ? "bg-amber-500 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Concerns */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    What's on your mind? (optional)
                  </label>
                  <input
                    type="text"
                    value={mainConcerns}
                    onChange={(e) => setMainConcerns(e.target.value)}
                    placeholder="e.g., work stress, relationships, health worries"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - AI Recommendations */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-purple-800 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                Maya's Recommendations
              </h3>
              {!showAssessment && (
                <button
                  onClick={() => {
                    setShowAssessment(true);
                    setRecommendations("");
                  }}
                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  New Assessment
                </button>
              )}
            </div>

            {(ollamaStatus === "offline" || ollamaStatus === "no-model") && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  {ollamaStatus === "no-model" ? (
                    <>
                      <strong>Model not found.</strong> Run: <code className="bg-amber-100 px-1 rounded">ollama pull llama3.2</code>
                    </>
                  ) : (
                    <>
                      <strong>AI is offline.</strong> Start with: <code className="bg-amber-100 px-1 rounded">ollama serve</code>
                    </>
                  )}
                </p>
              </div>
            )}

            {showAssessment ? (
              <div className="space-y-4">
                <p className="text-purple-700 text-sm">
                  Complete your daily check-in above, then get personalized wellness recommendations.
                </p>
                <button
                  onClick={getRecommendations}
                  disabled={aiLoading || !currentMood}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-5 h-5" />
                      Get Personalized Recommendations
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Your Personalized Recommendations
                </h4>
                <div className="text-gray-700 text-sm whitespace-pre-line">{recommendations}</div>
              </div>
            )}
          </div>
        </div>

        {/* Guided Exercises Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            Guided Exercises
          </h3>

          {/* Exercise Types */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {exerciseTypes.map((type) => {
              const TypeIcon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => getGuidedExercise(type)}
                  className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                    selectedExercise?.id === type.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className={`p-2 ${type.color} rounded-lg`}>
                    <TypeIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Breathing Exercise */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Wind className="w-5 h-5" />
              Quick Breathing Exercise
            </h4>
            {breathingActive ? (
              <div className="text-center space-y-4">
                <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-1000 ${
                  breathingPhase === "inhale" ? "bg-blue-400 scale-110" :
                  breathingPhase === "hold" ? "bg-blue-500 scale-110" : "bg-blue-300 scale-90"
                }`}>
                  <div className="text-white text-center">
                    <p className="text-2xl font-bold">{breathingTimer}</p>
                    <p className="text-sm capitalize">{breathingPhase}</p>
                  </div>
                </div>
                <p className="text-blue-700">Cycles completed: {breathingCycles}</p>
                <button
                  onClick={stopBreathing}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 mx-auto"
                >
                  <Pause className="w-4 h-4" />
                  Stop
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-blue-700 text-sm">
                  4-4-6 Breathing: Inhale 4s, Hold 4s, Exhale 6s
                </p>
                <button
                  onClick={startBreathing}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start
                </button>
              </div>
            )}
          </div>

          {/* Exercise Content */}
          {selectedExercise && (
            <div className="mt-4 bg-gray-50 rounded-xl p-6">
              {exerciseLoading ? (
                <div className="flex items-center justify-center gap-2 text-gray-500 py-8">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Preparing your {selectedExercise.label} exercise...
                </div>
              ) : (
                <>
                  <h4 className="font-semibold text-gray-700 mb-3">
                    {selectedExercise.label} Exercise
                  </h4>
                  <div className="text-gray-700 text-sm whitespace-pre-line">{exerciseContent}</div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mood Chart & Journal */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Mood Trends */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Mood Trends
            </h3>
            {chartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      stroke="#8b5cf6"
                      fill="url(#moodGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                Log your mood to see trends
              </div>
            )}
          </div>

          {/* Journal */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              Reflection Journal
            </h3>
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="Write about your thoughts, feelings, or anything on your mind..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none mb-3"
            />
            <button
              onClick={saveJournal}
              disabled={!journalText.trim()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              Save Reflection
            </button>

            {/* Recent Entries */}
            {journalEntries.length > 0 && (
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                {journalEntries.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex justify-between items-start">
                      <p className="text-gray-700 flex-1">{entry.text}</p>
                      <button
                        onClick={() => deleteJournal(entry.id)}
                        className="text-red-400 hover:text-red-500 text-xs ml-2"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Chat Section - Maya */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 mb-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="flex-1 flex items-center justify-between text-gray-700 font-bold"
            >
              <span className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <span className="block">Chat with Maya</span>
                  <span className="text-xs font-normal text-purple-600">Your supportive wellness friend</span>
                </div>
              </span>
              {chatOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {chatHistory.length > 0 && (
              <div className="flex items-center gap-1 ml-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Are you sure you want to clear all chat history with Maya?")) {
                      setChatHistory([]);
                      localStorage.removeItem("mentalHealthChat");
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  title="Clear chat history"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {chatOpen && (
            <div className="mt-4 space-y-4">
              {/* Chat History */}
              <div className="h-96 overflow-y-auto rounded-xl p-4 bg-white space-y-3">
                {chatHistory.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-purple-700 font-medium text-lg">Hey there! I'm Maya</p>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto">
                      I'm here to listen and support you through whatever you're going through.
                      Think of me as a caring friend who's always available to chat.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {["I'm feeling stressed", "I need someone to talk to", "I had a rough day"].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setChatMessage(suggestion);
                          }}
                          className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full text-sm transition"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`group flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <Heart className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="relative">
                      <div
                        className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                          msg.role === "user"
                            ? "bg-purple-500 text-white rounded-br-md"
                            : "bg-gray-100 text-gray-700 rounded-bl-md"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <button
                        onClick={() => {
                          const newHistory = chatHistory.filter((_, i) => i !== idx);
                          setChatHistory(newHistory);
                        }}
                        className={`absolute -top-2 ${msg.role === "user" ? "-left-6" : "-right-6"} opacity-0 group-hover:opacity-100 p-1 bg-red-100 hover:bg-red-200 text-red-500 rounded-full transition-opacity`}
                        title="Delete message"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-2 text-gray-500 text-sm">
                      <span className="flex items-center gap-2">
                        <span className="flex gap-1">
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                        </span>
                        Maya is typing...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                  placeholder="Tell me what's on your mind..."
                  className="flex-1 border border-purple-200 rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none bg-white"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={chatLoading || !chatMessage.trim()}
                  className="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-center text-gray-400">
                Maya is here to listen and support you. For crisis support, please reach out to a professional.
              </p>
            </div>
          )}
        </div>

        {/* Resources */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl shadow-lg p-6 mb-6 border border-pink-200">
          <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Mental Health Resources
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-2">Quick Tips</h4>
              <ul className="text-gray-600 space-y-1">
                <li>- Take regular breaks from screens</li>
                <li>- Practice gratitude daily</li>
                <li>- Stay connected with loved ones</li>
                <li>- Get enough sleep (7-9 hours)</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-2">Need Help?</h4>
              <p className="text-gray-600 mb-2">
                If you're in crisis or need immediate support, please reach out to a mental health professional or helpline.
              </p>
              <p className="text-purple-600 font-medium">You are not alone.</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentalHealth;
