import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import emailjs from "@emailjs/browser";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    emailjs
      .send(
        "service_9t6qgsy",     
        "template_lswst1d",     
        formData,
        "IWtbhw"       
      )
      .then(
        (response) => {
          console.log("SUCCESS!", response.status, response.text);
          setSubmitted(true);
          setFormData({ name: "", email: "", message: "" });
          setLoading(false);
        },
        (error) => {
          console.log("FAILED...", error);
          alert("Oops! Something went wrong. Please try again.");
          setLoading(false);
        }
      );
  };

  return (
    <div className="min-h-screen flex flex-col pt-24 px-4 md:px-6 bg-gray-50">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Back Button */}
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800 font-semibold mb-4 inline-block"
        >
          &larr; Back to Home
        </Link>

        {/* Header */}
        <h1 className="text-3xl font-bold text-blue-700 text-center">
          Contact Us
        </h1>
        <p className="text-gray-600 text-center">
          Have questions or feedback? Send us a message and we’ll get back to you!
        </p>

        {/* Contact Info */}
        <div className="space-y-4 text-gray-700">
          <div className="flex items-center space-x-4">
            <Mail className="w-6 h-6 text-blue-600" />
            <span>razanousman06@gmail.com</span>
          </div>
          <div className="flex items-center space-x-4">
            <Phone className="w-6 h-6 text-blue-600" />
            <span>+961 3 13 40 64</span>
          </div>
        </div>

        {/* Contact Form */}
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-2xl shadow-md space-y-4"
          >
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg text-white ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } transition`}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        ) : (
          <div className="bg-green-100 text-green-700 p-6 rounded-2xl text-center shadow-md">
            <h2 className="text-xl font-semibold">Thank you!</h2>
            <p className="mt-2">Your message has been sent successfully.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Send Another Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contact;

