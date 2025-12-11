import React from "react";
import { Apple, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";

const NutritionFitness = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-6">
      <div className="container mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
            Nutrition & Fitness
          </h1>
          <p className="text-gray-600 mt-2 md:text-lg">
            Choose one to track your nutrition or fitness.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nutrition Card */}
          <Link
            to="/nutrition"
            className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition flex flex-col items-start"
          >
            <div className="flex items-center mb-4">
              <Apple className="w-10 h-10 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-blue-700">Nutrition</h2>
            </div>
            <p className="text-gray-600">
              Log your meals, track calories, and get personalized nutrition tips.
            </p>
          </Link>

          {/* Fitness Card */}
          <Link
            to="/fitness"
            className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition flex flex-col items-start"
          >
            <div className="flex items-center mb-4">
              <Dumbbell className="w-10 h-10 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-blue-700">Fitness</h2>
            </div>
            <p className="text-gray-600">
              Track your workouts, set goals, and monitor your progress.
            </p>
          </Link>
        </div>

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

export default NutritionFitness;
