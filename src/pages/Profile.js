import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Droplets,
  Scale,
  Ruler,
  Edit3,
  Save,
  X,
  AlertCircle,
  Camera,
  Settings,
} from "lucide-react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    height: "",
    weight: "",
    bloodType: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    profileImage: "",
  });

  // Load profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("healthProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    // Also load from userProfile for shared data
    const userProfile = localStorage.getItem("userProfile");
    if (userProfile) {
      const userData = JSON.parse(userProfile);
      setProfile(prev => ({
        ...prev,
        firstName: userData.name?.split(" ")[0] || prev.firstName,
        lastName: userData.name?.split(" ").slice(1).join(" ") || prev.lastName,
        email: userData.email || prev.email,
        height: userData.height || prev.height,
        weight: userData.weight || prev.weight,
        gender: userData.gender || prev.gender,
      }));
    }
  }, []);

  // Save profile
  const handleSave = () => {
    localStorage.setItem("healthProfile", JSON.stringify(profile));

    // Also update userProfile for shared data
    const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
    userProfile.name = `${profile.firstName} ${profile.lastName}`.trim();
    userProfile.email = profile.email;
    userProfile.height = profile.height;
    userProfile.weight = profile.weight;
    userProfile.gender = profile.gender;
    localStorage.setItem("userProfile", JSON.stringify(userProfile));

    setIsEditing(false);
    alert("Profile saved!");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove profile image
  const removeProfileImage = () => {
    setProfile(prev => ({ ...prev, profileImage: "" }));
  };

  // Calculate BMI
  const getBMI = () => {
    if (profile.height && profile.weight) {
      const heightM = parseFloat(profile.height) / 100;
      const bmi = parseFloat(profile.weight) / (heightM * heightM);
      return bmi.toFixed(1);
    }
    return null;
  };

  const bmi = getBMI();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl p-6 text-white text-center mb-6">
          <div className="relative w-24 h-24 mx-auto mb-3">
            <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-white/20">
              <img
                src={
                  profile.profileImage ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    profile.firstName || profile.lastName
                      ? `${profile.firstName} ${profile.lastName}`.trim()
                      : "User"
                  )}&background=3b82f6&color=fff&size=128`
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {isEditing && (
              <div className="absolute -bottom-1 -right-1 flex gap-1">
                <label className="bg-white text-blue-600 p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {profile.profileImage && (
                  <button
                    onClick={removeProfileImage}
                    className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold">
            {profile.firstName || profile.lastName
              ? `${profile.firstName} ${profile.lastName}`.trim()
              : "My Profile"}
          </h1>
          {profile.email && <p className="text-blue-100 text-sm mt-1">{profile.email}</p>}
        </div>

        {/* Edit Button */}
        <div className="flex justify-end mb-4">
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <Save className="w-4 h-4" /> Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-500"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Edit3 className="w-4 h-4" /> Edit
            </button>
          )}
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" /> Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              ) : (
                <p className="font-medium text-gray-800">{profile.firstName || "—"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              ) : (
                <p className="font-medium text-gray-800">{profile.lastName || "—"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                <Mail className="w-4 h-4 inline mr-1" /> Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              ) : (
                <p className="font-medium text-gray-800">{profile.email || "—"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                <Phone className="w-4 h-4 inline mr-1" /> Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              ) : (
                <p className="font-medium text-gray-800">{profile.phone || "—"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" /> Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="dateOfBirth"
                  value={profile.dateOfBirth}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              ) : (
                <p className="font-medium text-gray-800">
                  {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "—"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Gender</label>
              {isEditing ? (
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="font-medium text-gray-800">{profile.gender || "—"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Health Info */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-green-600" /> Health Information
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                <Ruler className="w-4 h-4 inline mr-1" /> Height (cm)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="height"
                  value={profile.height}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              ) : (
                <p className="font-medium text-gray-800">{profile.height || "—"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                <Scale className="w-4 h-4 inline mr-1" /> Weight (kg)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="weight"
                  value={profile.weight}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              ) : (
                <p className="font-medium text-gray-800">{profile.weight || "—"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                <Droplets className="w-4 h-4 inline mr-1" /> Blood Type
              </label>
              {isEditing ? (
                <select
                  name="bloodType"
                  value={profile.bloodType}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              ) : (
                <p className="font-medium text-gray-800">{profile.bloodType || "—"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">BMI</label>
              <p className="font-medium text-gray-800">{bmi || "—"}</p>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" /> Emergency Contact
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Contact Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="emergencyContactName"
                  value={profile.emergencyContactName}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              ) : (
                <p className="font-medium text-gray-800">{profile.emergencyContactName || "—"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Contact Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={profile.emergencyContactPhone}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              ) : (
                <p className="font-medium text-gray-800">{profile.emergencyContactPhone || "—"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-4">
          <Link
            to="/user-profile"
            className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition shadow-md flex items-center gap-2"
          >
            <Settings className="w-4 h-4" /> Settings
          </Link>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-md"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
