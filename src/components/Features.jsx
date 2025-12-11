import React from "react";
import { HeartPulse, Bell, Apple, Smile, FileText } from "lucide-react";

const features = [
  {
    icon: <HeartPulse className="w-10 h-10 text-blue-600" />,
    title: "AI Symptom Checker",
    desc: "Describe your symptoms and get personalized health insights powered by AI.",
  },
  {
    icon: <Bell className="w-10 h-10 text-blue-600" />,
    title: "Medication Reminders",
    desc: "Never miss a dose — set reminders for your medications and treatments easily.",
  },
  {
    icon: <Apple className="w-10 h-10 text-blue-600" />,
    title: "Nutrition & Fitness",
    desc: "Receive daily food and activity tips tailored to your lifestyle and goals.",
  },
  {
    icon: <Smile className="w-10 h-10 text-blue-600" />,
    title: "Mental Health Support",
    desc: "Access tools and exercises designed to support your emotional well-being.",
  },
  {
    icon: <FileText className="w-10 h-10 text-blue-600" />,
    title: "Health Record Management",
    desc: "Upload and organize your medical reports securely in one place.",
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-blue-700 mb-4">
          Key Features
        </h2>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          Explore how My Health Coach helps you stay on top of your health
          journey with powerful and easy-to-use tools.
        </p>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 bg-blue-50 rounded-2xl shadow-sm hover:shadow-md transition duration-300"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

