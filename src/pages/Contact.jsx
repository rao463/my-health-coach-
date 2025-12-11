import React, { useState } from "react";
import { Mail, Phone, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // simple validation
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill out all fields before submitting.");
      return;
    }

    // simulate message send
    alert("✅ Thank you! Your message has been sent successfully.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-6">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">Contact Us</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Have a question, suggestion, or feedback? We’d love to hear from you!
          Fill out the form below, and our team will get back to you soon.
        </p>
      </div>

      {/* Contact Info + Form Section */}
      <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-8 md:p-12">
        {/* Left - Contact Info */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">
            Get in Touch
          </h2>
          <p className="text-gray-600">
            Our support team is available to help with any inquiries regarding
            your account, features, or general feedback.
          </p>

          <a
            href="mailto:razanousman06@gmail.com"
            className="flex items-center space-x-4 text-gray-700 hover:text-blue-600"
          >
            <Mail className="w-6 h-6 text-blue-600" />
            <span>razanousman06@gmail.com</span>
          </a>

          <a
            href="tel:+96170123456"
            className="flex items-center space-x-4 text-gray-700 hover:text-blue-600"
          >
            <Phone className="w-6 h-6 text-blue-600" />
            <span>+961 03 13 40 64</span>
          </a>
        </div>

        {/* Right - Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Message
            </label>
            <textarea
              rows="5"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Send Message 
          </button>
        </form>
      </div>

      {/* Back Button */}
      <div className="max-w-6xl mx-auto mt-10 text-center">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Contact;

