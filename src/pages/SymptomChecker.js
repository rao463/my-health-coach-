import React, { useState } from "react";
import { HeartPulse, Send } from "lucide-react";
import { Link } from "react-router-dom";

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setResult({
        summary: "Your symptoms suggest a possible mild condition such as a cold or allergy.",
        recommendation: "Stay hydrated, rest well, and monitor your symptoms. If they persist or worsen, consult a doctor.",
      });
      setLoading(false);
    }, 2000);
  };

  const handleClear = () => {
    setSymptoms("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-6">
      <div className="container mx-auto max-w-3xl bg-white shadow-lg rounded-2xl p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <HeartPulse className="w-14 h-14 text-blue-600 mb-2" />
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700 text-center">
            AI Symptom Checker
          </h1>
          <p className="text-gray-600 text-center mt-2 md:text-lg">
            Describe your symptoms and our AI will suggest possible causes and next steps.
          </p>
        </div>

        {/* Symptom Form */}
        <form onSubmit={handleCheck} className="space-y-4">
          <textarea
            className="w-full border border-gray-300 rounded-lg p-4 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            rows="5"
            placeholder="Example: I've been having headaches and a sore throat..."
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

        {/* Result */}
        {result && (
          <div className="mt-8 bg-blue-50 border border-blue-100 p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">Possible Summary</h2>
            <p className="text-gray-700 mb-4">{result.summary}</p>
            <h3 className="text-lg font-semibold text-blue-700">Recommendation</h3>
            <p className="text-gray-700">{result.recommendation}</p>
          </div>
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

export default SymptomChecker;
