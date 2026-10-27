import React, { useState } from "react";
import { HeartPulse, Send } from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState("");
  const [resultText, setResultText] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResultText("");
    setEntries(null);

    const arr = symptoms
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (arr.length === 0) {
      setError("Please enter at least one symptom.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/ai/symptoms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: arr }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Server error");
      }

      setResultText(data.advice || "");
      setEntries(data?.data?.entries || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSymptoms("");
    setResultText("");
    setEntries([]);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-6">
      <div className="container mx-auto max-w-3xl bg-white shadow-lg rounded-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <HeartPulse className="w-14 h-14 text-blue-600 mb-2" />
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700 text-center">
            AI Symptom Checker
          </h1>
          <p className="text-gray-600 text-center mt-2 md:text-lg">
            Enter your symptoms and get AI-based suggestions.
          </p>
        </div>

        <form onSubmit={handleCheck} className="space-y-4">
          <textarea
            className="w-full border border-gray-300 rounded-lg p-4 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            rows="5"
            placeholder="Example: headache, sore throat, fatigue"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            required
          />

          <div className="flex flex-col md:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
            >
              {loading ? "Analyzing..." : <Send className="w-5 h-5" />}
              Check Symptoms
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition"
            >
              Clear
            </button>
          </div>
        </form>

        {resultText && (
          <div className="mt-8 bg-blue-50 border border-blue-100 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">AI Advice</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{resultText}</p>
          </div>
        )}

        {entries && entries.length > 0 && (
          <div className="mt-4 bg-white border rounded p-4">
            <h3 className="font-semibold mb-2">Per-symptom suggestions</h3>
            <ul className="list-disc list-inside">
              {entries.map((it, idx) => (
                <li key={idx} className="mb-2">
                  <strong>{it.symptom}</strong> — Likelihood: {it.likelihood}%
                  <br />
                  <em>{it.advice}</em>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="mt-8 bg-red-50 border border-red-100 p-6 rounded-xl">
            <p className="text-red-700">{error}</p>
          </div>
        )}

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

export default SymptomChecker;

