import React, { useState, useEffect } from "react";
import { Smile, Meh, Frown, Heart, Wind, MessageSquare, BookOpen, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

// Mood Button Component
const MoodButton = ({ mood, selectedMood, onSelect }) => (
  <button
    aria-label={mood.label}
    onClick={() => onSelect(mood)}
    className={`flex flex-col items-center p-3 rounded-xl border transition ${
      selectedMood === mood.label
        ? "bg-blue-100 border-blue-500"
        : "border-gray-200 hover:bg-gray-100"
    }`}
  >
    {mood.icon}
    <span className="mt-1 text-sm">{mood.label}</span>
  </button>
);

// Journal Entry Component
const JournalEntry = ({ entry, onDelete, onEdit }) => (
  <div className="border p-3 rounded-lg mb-2 bg-gray-50 flex justify-between items-start">
    <div>
      <p className="text-gray-700">{entry.text}</p>
      <span className="text-xs text-gray-400">{entry.date}</span>
    </div>
    <div className="flex flex-col space-y-1 ml-3">
      <button
        onClick={() => onEdit(entry.id)}
        className="text-blue-600 text-sm hover:underline"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(entry.id)}
        className="text-red-500 text-sm hover:underline"
      >
        Delete
      </button>
    </div>
  </div>
);

// Chat Message Component
const ChatMessage = ({ message, fromUser }) => (
  <div
    className={`mb-2 flex ${fromUser ? "justify-end" : "justify-start"}`}
  >
    <div
      className={`p-2 rounded-lg max-w-xs break-words ${
        fromUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      {message}
    </div>
  </div>
);

const MentalHealth = () => {
  const [selectedMood, setSelectedMood] = useState("");
  const [journal, setJournal] = useState("");
  const [journalEntries, setJournalEntries] = useState([]);
  const [coachMessage, setCoachMessage] = useState("");
  const [moodHistory, setMoodHistory] = useState([]);
  const [breathingTimer, setBreathingTimer] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  // Moods & Coach responses
  const moods = [
    { label: "Happy", icon: <Smile className="text-yellow-500" />, value: 5 },
    { label: "Okay", icon: <Meh className="text-green-500" />, value: 3 },
    { label: "Sad", icon: <Frown className="text-blue-500" />, value: 2 },
    { label: "Anxious", icon: <Frown className="text-red-500" />, value: 1 },
  ];

  const responses = {
    Happy: "Keep up the positivity! Remember to share your happiness.",
    Okay: "It’s okay to feel okay. Try doing something you love today.",
    Sad: "Take a moment for yourself — journaling or a walk might help.",
    Anxious: "Breathe deeply. You’re doing your best — one step at a time.",
  };

  // Load data from localStorage
  useEffect(() => {
    const moodsLS = JSON.parse(localStorage.getItem("moodHistory")) || [];
    const journalsLS = JSON.parse(localStorage.getItem("journalEntries")) || [];
    const chatLS = JSON.parse(localStorage.getItem("chatMessages")) || [];
    setMoodHistory(moodsLS);
    setJournalEntries(journalsLS);
    setChatMessages(chatLS);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("moodHistory", JSON.stringify(moodHistory));
  }, [moodHistory]);

  useEffect(() => {
    localStorage.setItem("journalEntries", JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Handle mood selection
  const handleMoodSelect = (mood) => {
    setSelectedMood(mood.label);
    setCoachMessage(responses[mood.label]);
    const newEntry = { date: new Date().toLocaleDateString(), value: mood.value };
    setMoodHistory([...moodHistory, newEntry]);
  };

  // Handle journal
  const handleSaveJournal = () => {
    if (!journal.trim()) return;
    const newEntry = {
      id: Date.now(),
      text: journal,
      date: new Date().toLocaleDateString(),
    };
    setJournalEntries([newEntry, ...journalEntries]);
    setCoachMessage("Thank you for sharing. Reflecting helps your well-being.");
    setJournal("");
  };

  const handleDeleteJournal = (id) => {
    setJournalEntries(journalEntries.filter((entry) => entry.id !== id));
  };

  const handleEditJournal = (id) => {
    const entry = journalEntries.find((e) => e.id === id);
    if (entry) {
      setJournal(entry.text);
      handleDeleteJournal(id);
    }
  };

  // Breathing Timer
  useEffect(() => {
    let timer;
    if (breathingTimer > 0) {
      timer = setTimeout(() => setBreathingTimer(breathingTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [breathingTimer]);

  const startBreathingTimer = () => setBreathingTimer(10);

  // AI Chat Logic
  const handleSendChat = () => {
    if (!chatInput.trim()) return;

    const userMessage = { text: chatInput, fromUser: true };
    setChatMessages([...chatMessages, userMessage]);

    // Simple AI keyword-based response
    let aiResponse = "I hear you. Thank you for sharing.";
    const text = chatInput.toLowerCase();
    if (text.includes("sad") || text.includes("unhappy") || text.includes("down")) {
      aiResponse = "I'm here with you. Remember, it's okay to feel sad sometimes.";
    } else if (text.includes("anxious") || text.includes("nervous") || text.includes("worried")) {
      aiResponse = "Take a deep breath. You're safe and capable of handling this.";
    } else if (text.includes("happy") || text.includes("good") || text.includes("joy")) {
      aiResponse = "That's wonderful! Keep cherishing these happy moments.";
    } else if (text.includes("tired") || text.includes("exhausted") || text.includes("sleep")) {
      aiResponse = "Rest is important. Make sure to take care of yourself.";
    }

    const aiMessage = { text: aiResponse, fromUser: false };
    setChatMessages([...chatMessages, userMessage, aiMessage]);
    setChatInput("");
  };

  // Chart data
  const data = {
    labels: moodHistory.map((entry) => entry.date),
    datasets: [
      {
        label: "Mood Trend",
        data: moodHistory.map((entry) => entry.value),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
            Mental Health & Wellness
          </h1>
          <p className="text-gray-600 mt-2 md:text-lg">
            Track your emotions, reflect on your thoughts, and find calm moments daily.
          </p>
        </div>

        {/* Mood Tracker & Coach */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-blue-600" /> Mood Tracker
            </h2>
            <div className="flex justify-around mb-6">
              {moods.map((mood) => (
                <MoodButton
                  key={mood.label}
                  mood={mood}
                  selectedMood={selectedMood}
                  onSelect={handleMoodSelect}
                />
              ))}
            </div>
            <Line data={data} />
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-blue-600" /> Coach
              </h2>
              <p className="text-gray-600">
                {coachMessage || "Your coach will respond once you log a mood or save a reflection."}
              </p>
            </div>
          </div>
        </div>

        {/* Journal Section */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" /> Journal & Reflection
          </h2>
          <textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="Write about your day or express what’s on your mind..."
            className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            rows={4}
          />
          <div className="flex justify-end space-x-2 mb-4">
            <button
              onClick={handleSaveJournal}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Save Reflection
            </button>
          </div>
          <div>
            {journalEntries.map((entry) => (
              <JournalEntry
                key={entry.id}
                entry={entry}
                onDelete={handleDeleteJournal}
                onEdit={handleEditJournal}
              />
            ))}
          </div>
        </div>

        {/* Calm Breathing & Resources */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-3 flex items-center">
              <Wind className="w-5 h-5 mr-2 text-blue-600" /> Calm Breathing
            </h2>
            <p className="text-gray-600 mb-4">
              Try this 10-second breathing reset: Inhale — hold — exhale.
            </p>
            <div className="flex space-x-3 items-center">
              <button
                onClick={startBreathingTimer}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Start 10s Timer
              </button>
              {breathingTimer > 0 && (
                <span className="text-gray-700 font-bold">{breathingTimer}s</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-blue-700 mb-3">Resources</h2>
            <ul className="text-gray-600 list-disc list-inside space-y-2">
              <li>Try a 5–10 minute guided meditation for relaxation.</li>
              <li>Listen to calming music or nature sounds.</li>
              <li>Write down three things you’re grateful for.</li>
              <li>Connect with a friend or family member for support.</li>
            </ul>
          </div>
        </div>

        {/* AI Chat Box */}
        <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">AI Chat Coach</h2>
          <div className="h-64 overflow-y-auto border rounded-lg p-3 mb-3 bg-gray-50">
            {chatMessages.map((msg, index) => (
              <ChatMessage key={index} message={msg.text} fromUser={msg.fromUser} />
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type how you feel..."
              className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
            />
            <button
              onClick={handleSendChat}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
            >
              <Send className="w-4 h-4 mr-1" /> Send
            </button>
          </div>
        </div>

        {/* Back Button */}
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

export default MentalHealth;
