import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FileText,
  FlaskConical,
  Pill,
  Stethoscope,
  Plus,
  Edit2,
  Trash2,
  Bell,
  Search,
  Calendar,
  Heart,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Activity,
  TrendingUp,
  FileCheck,
  Lightbulb,
  Info,
} from "lucide-react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

// Record type configurations
const recordTypes = {
  "medical-history": {
    label: "Medical History",
    icon: FileText,
    color: "bg-blue-500",
    lightColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
  },
  "lab-result": {
    label: "Lab Results",
    icon: FlaskConical,
    color: "bg-purple-500",
    lightColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
  },
  prescription: {
    label: "Prescriptions",
    icon: Pill,
    color: "bg-green-500",
    lightColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
  },
  "doctor-note": {
    label: "Doctor's Notes",
    icon: Stethoscope,
    color: "bg-amber-500",
    lightColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
  },
};

const HealthRecordManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const chatEndRef = useRef(null);

  // Record states
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctorNotes, setDoctorNotes] = useState([]);

  // UI states
  const [activeTab, setActiveTab] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("medical-history");
  const [editingRecord, setEditingRecord] = useState(null);
  const [search, setSearch] = useState("");

  // AI Maya states
  const [ollamaStatus, setOllamaStatus] = useState("checking");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Form states for different record types
  const [newMedicalHistory, setNewMedicalHistory] = useState({
    condition: "",
    diagnosedDate: "",
    status: "active",
    doctor: "",
    notes: "",
  });

  const [newLabResult, setNewLabResult] = useState({
    testName: "",
    value: "",
    unit: "",
    referenceRange: "",
    date: "",
    status: "normal",
    notes: "",
  });

  const [newPrescription, setNewPrescription] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    prescribedDate: "",
    endDate: "",
    doctor: "",
    purpose: "",
    notes: "",
  });

  const [newDoctorNote, setNewDoctorNote] = useState({
    visitDate: "",
    doctor: "",
    reason: "",
    diagnosis: "",
    recommendations: "",
    followUp: "",
    notes: "",
  });

  // Load data from localStorage
  useEffect(() => {
    const storedMedicalHistory = JSON.parse(localStorage.getItem("healthMedicalHistory")) || [];
    const storedLabResults = JSON.parse(localStorage.getItem("healthLabResults")) || [];
    const storedPrescriptions = JSON.parse(localStorage.getItem("healthPrescriptions")) || [];
    const storedDoctorNotes = JSON.parse(localStorage.getItem("healthDoctorNotes")) || [];
    const storedChat = JSON.parse(localStorage.getItem("healthRecordChat")) || [];

    setMedicalHistory(storedMedicalHistory);
    setLabResults(storedLabResults);
    setPrescriptions(storedPrescriptions);
    setDoctorNotes(storedDoctorNotes);
    setChatHistory(storedChat);

    checkOllamaStatus();
  }, [location]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("healthMedicalHistory", JSON.stringify(medicalHistory));
  }, [medicalHistory]);

  useEffect(() => {
    localStorage.setItem("healthLabResults", JSON.stringify(labResults));
  }, [labResults]);

  useEffect(() => {
    localStorage.setItem("healthPrescriptions", JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem("healthDoctorNotes", JSON.stringify(doctorNotes));
  }, [doctorNotes]);

  useEffect(() => {
    localStorage.setItem("healthRecordChat", JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Check Ollama status
  const checkOllamaStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/ai/healthrecord/health`);
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

  // Chat with Maya
  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage.trim();
    setChatMessage("");

    const updatedHistory = [...chatHistory, { role: "user", content: userMsg }];
    setChatHistory(updatedHistory);
    setChatLoading(true);

    try {
      // Build context from records
      const recentLabs = labResults.slice(0, 3).map(l => `${l.testName}: ${l.value} ${l.unit}`).join(", ");
      const medications = prescriptions.filter(p => !p.endDate || new Date(p.endDate) > new Date()).map(p => p.medication).join(", ");
      const conditions = medicalHistory.filter(m => m.status === "active").map(m => m.condition).join(", ");

      const response = await fetch(`${API_BASE}/api/ai/healthrecord/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          context: {
            recentLabResults: recentLabs || "None recorded",
            medications: medications || "None recorded",
            conditions: conditions || "None recorded",
          },
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
        { role: "assistant", content: "I'm here to help with your health records. Please try again in a moment." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Open modal for adding new record
  const openAddModal = (type) => {
    setModalType(type);
    setEditingRecord(null);
    resetFormByType(type);
    setModalOpen(true);
  };

  // Reset form based on type
  const resetFormByType = (type) => {
    if (type === "medical-history") {
      setNewMedicalHistory({ condition: "", diagnosedDate: "", status: "active", doctor: "", notes: "" });
    } else if (type === "lab-result") {
      setNewLabResult({ testName: "", value: "", unit: "", referenceRange: "", date: "", status: "normal", notes: "" });
    } else if (type === "prescription") {
      setNewPrescription({ medication: "", dosage: "", frequency: "", prescribedDate: "", endDate: "", doctor: "", purpose: "", notes: "" });
    } else if (type === "doctor-note") {
      setNewDoctorNote({ visitDate: "", doctor: "", reason: "", diagnosis: "", recommendations: "", followUp: "", notes: "" });
    }
  };

  // Save record
  const handleSaveRecord = () => {
    const id = editingRecord?.id || Date.now();
    const timestamp = new Date().toISOString();

    if (modalType === "medical-history") {
      if (!newMedicalHistory.condition) return;
      const record = { ...newMedicalHistory, id, updatedAt: timestamp };
      if (editingRecord) {
        setMedicalHistory(medicalHistory.map(r => r.id === id ? record : r));
      } else {
        setMedicalHistory([record, ...medicalHistory]);
      }
    } else if (modalType === "lab-result") {
      if (!newLabResult.testName) return;
      const record = { ...newLabResult, id, updatedAt: timestamp };
      if (editingRecord) {
        setLabResults(labResults.map(r => r.id === id ? record : r));
      } else {
        setLabResults([record, ...labResults]);
      }
    } else if (modalType === "prescription") {
      if (!newPrescription.medication) return;
      const record = { ...newPrescription, id, updatedAt: timestamp };
      if (editingRecord) {
        setPrescriptions(prescriptions.map(r => r.id === id ? record : r));
      } else {
        setPrescriptions([record, ...prescriptions]);
      }
    } else if (modalType === "doctor-note") {
      if (!newDoctorNote.visitDate) return;
      const record = { ...newDoctorNote, id, updatedAt: timestamp };
      if (editingRecord) {
        setDoctorNotes(doctorNotes.map(r => r.id === id ? record : r));
      } else {
        setDoctorNotes([record, ...doctorNotes]);
      }
    }

    setModalOpen(false);
  };

  // Edit record
  const handleEdit = (type, record) => {
    setModalType(type);
    setEditingRecord(record);
    if (type === "medical-history") setNewMedicalHistory(record);
    else if (type === "lab-result") setNewLabResult(record);
    else if (type === "prescription") setNewPrescription(record);
    else if (type === "doctor-note") setNewDoctorNote(record);
    setModalOpen(true);
  };

  // Delete record
  const handleDelete = (type, id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    if (type === "medical-history") setMedicalHistory(medicalHistory.filter(r => r.id !== id));
    else if (type === "lab-result") setLabResults(labResults.filter(r => r.id !== id));
    else if (type === "prescription") setPrescriptions(prescriptions.filter(r => r.id !== id));
    else if (type === "doctor-note") setDoctorNotes(doctorNotes.filter(r => r.id !== id));
  };

  // Filter records by search
  const filterRecords = (records, fields) => {
    if (!search) return records;
    const searchLower = search.toLowerCase();
    return records.filter(r => fields.some(f => r[f]?.toLowerCase().includes(searchLower)));
  };

  // Get summary stats
  const totalRecords = medicalHistory.length + labResults.length + prescriptions.length + doctorNotes.length;
  const activeConditions = medicalHistory.filter(m => m.status === "active").length;
  const activePrescriptions = prescriptions.filter(p => !p.endDate || new Date(p.endDate) > new Date()).length;
  const abnormalLabs = labResults.filter(l => l.status === "abnormal" || l.status === "critical").length;

  // Render record card
  const renderRecordCard = (type, record, fields) => {
    const config = recordTypes[type];
    const TypeIcon = config.icon;

    return (
      <div key={record.id} className={`bg-white rounded-xl shadow-md p-4 border-l-4 ${config.borderColor} hover:shadow-lg transition`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 ${config.lightColor} rounded-lg`}>
              <TypeIcon className={`w-5 h-5 ${config.textColor}`} />
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold ${config.textColor}`}>{fields.title}</h4>
              {fields.subtitle && <p className="text-sm text-gray-600">{fields.subtitle}</p>}
              {fields.details && <p className="text-sm text-gray-500 mt-1">{fields.details}</p>}
              {fields.date && (
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {fields.date}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {fields.status && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                fields.status === "active" || fields.status === "normal" ? "bg-green-100 text-green-700" :
                fields.status === "abnormal" ? "bg-yellow-100 text-yellow-700" :
                fields.status === "critical" ? "bg-red-100 text-red-700" :
                "bg-gray-100 text-gray-700"
              }`}>
                {fields.status}
              </span>
            )}
            <button
              onClick={() => handleEdit(type, record)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(type, record.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileCheck className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Health Records</h1>
                <p className="text-gray-500">Securely manage your personal health information</p>
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
                {ollamaStatus === "online" ? "Maya Online" : ollamaStatus === "checking" ? "Checking..." : "Maya Offline"}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalRecords}</p>
              <p className="text-xs text-gray-500">Total Records</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Activity className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{activeConditions}</p>
              <p className="text-xs text-gray-500">Active Conditions</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Pill className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{activePrescriptions}</p>
              <p className="text-xs text-gray-500">Active Medications</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FlaskConical className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${abnormalLabs > 0 ? "text-red-600" : "text-gray-800"}`}>{abnormalLabs}</p>
              <p className="text-xs text-gray-500">Abnormal Labs</p>
            </div>
          </div>
        </div>

        {/* Search and Quick Add */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search all records..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(recordTypes).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    onClick={() => openAddModal(key)}
                    className={`flex items-center gap-2 px-3 py-2 ${config.color} text-white rounded-lg hover:opacity-90 transition text-sm`}
                  >
                    <Plus className="w-4 h-4" />
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Records
          </button>
          {Object.entries(recordTypes).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap flex items-center gap-2 ${
                  activeTab === key ? `${config.color} text-white` : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Records Grid */}
        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          {/* Medical History */}
          {(activeTab === "all" || activeTab === "medical-history") && (
            <>
              {activeTab === "all" && medicalHistory.length > 0 && (
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Medical History
                  </h3>
                </div>
              )}
              {filterRecords(medicalHistory, ["condition", "doctor", "notes"]).map(record =>
                renderRecordCard("medical-history", record, {
                  title: record.condition,
                  subtitle: record.doctor ? `Dr. ${record.doctor}` : null,
                  details: record.notes,
                  date: record.diagnosedDate,
                  status: record.status,
                })
              )}
            </>
          )}

          {/* Lab Results */}
          {(activeTab === "all" || activeTab === "lab-result") && (
            <>
              {activeTab === "all" && labResults.length > 0 && (
                <div className="lg:col-span-2 mt-4">
                  <h3 className="text-lg font-semibold text-purple-700 mb-3 flex items-center gap-2">
                    <FlaskConical className="w-5 h-5" /> Lab Results
                  </h3>
                </div>
              )}
              {filterRecords(labResults, ["testName", "notes"]).map(record =>
                renderRecordCard("lab-result", record, {
                  title: record.testName,
                  subtitle: `${record.value} ${record.unit}${record.referenceRange ? ` (Range: ${record.referenceRange})` : ""}`,
                  details: record.notes,
                  date: record.date,
                  status: record.status,
                })
              )}
            </>
          )}

          {/* Prescriptions */}
          {(activeTab === "all" || activeTab === "prescription") && (
            <>
              {activeTab === "all" && prescriptions.length > 0 && (
                <div className="lg:col-span-2 mt-4">
                  <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <Pill className="w-5 h-5" /> Prescriptions
                  </h3>
                </div>
              )}
              {filterRecords(prescriptions, ["medication", "doctor", "purpose", "notes"]).map(record =>
                renderRecordCard("prescription", record, {
                  title: record.medication,
                  subtitle: `${record.dosage} - ${record.frequency}`,
                  details: record.purpose || record.notes,
                  date: record.prescribedDate,
                  status: record.endDate && new Date(record.endDate) < new Date() ? "completed" : "active",
                })
              )}
            </>
          )}

          {/* Doctor's Notes */}
          {(activeTab === "all" || activeTab === "doctor-note") && (
            <>
              {activeTab === "all" && doctorNotes.length > 0 && (
                <div className="lg:col-span-2 mt-4">
                  <h3 className="text-lg font-semibold text-amber-700 mb-3 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" /> Doctor's Notes
                  </h3>
                </div>
              )}
              {filterRecords(doctorNotes, ["doctor", "reason", "diagnosis", "recommendations", "notes"]).map(record =>
                renderRecordCard("doctor-note", record, {
                  title: record.reason || "Doctor Visit",
                  subtitle: record.doctor ? `Dr. ${record.doctor}` : null,
                  details: record.diagnosis || record.recommendations || record.notes,
                  date: record.visitDate,
                })
              )}
            </>
          )}

          {/* Empty state */}
          {totalRecords === 0 && (
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-8 text-center">
              <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No health records yet. Start by adding your first record!</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {Object.entries(recordTypes).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => openAddModal(key)}
                      className={`flex items-center gap-2 px-4 py-2 ${config.color} text-white rounded-lg hover:opacity-90 transition`}
                    >
                      <Plus className="w-4 h-4" />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* AI Maya Chat Section */}
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
                  <span className="block">Ask Maya About Your Records</span>
                  <span className="text-xs font-normal text-purple-600">Get help understanding your health information</span>
                </div>
              </span>
              {chatOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {chatHistory.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Clear chat history with Maya?")) {
                    setChatHistory([]);
                    localStorage.removeItem("healthRecordChat");
                  }
                }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition ml-3"
                title="Clear chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {chatOpen && (
            <div className="mt-4 space-y-4">
              {(ollamaStatus === "offline" || ollamaStatus === "no-model") && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">
                    {ollamaStatus === "no-model" ? (
                      <><strong>Model not found.</strong> Run: <code className="bg-amber-100 px-1 rounded">ollama pull llama3.2</code></>
                    ) : (
                      <><strong>Maya is offline.</strong> Start Ollama with: <code className="bg-amber-100 px-1 rounded">ollama serve</code></>
                    )}
                  </p>
                </div>
              )}

              {/* Chat History */}
              <div className="h-80 overflow-y-auto rounded-xl p-4 bg-white space-y-3">
                {chatHistory.length === 0 && (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-purple-700 font-medium">Hi! I'm Maya</p>
                    <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
                      I can help you understand your health records, explain lab results, or answer questions about your medications.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {["What do my lab results mean?", "Explain my medications", "Help me prepare for my doctor visit"].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setChatMessage(suggestion)}
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
                        onClick={() => setChatHistory(chatHistory.filter((_, i) => i !== idx))}
                        className={`absolute -top-2 ${msg.role === "user" ? "-left-6" : "-right-6"} opacity-0 group-hover:opacity-100 p-1 bg-red-100 hover:bg-red-200 text-red-500 rounded-full transition-opacity`}
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
                  placeholder="Ask Maya about your health records..."
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
                Maya can help explain your records, but always consult your healthcare provider for medical advice.
              </p>
            </div>
          )}
        </div>

        {/* Important Notice */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 mb-6 border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Important Health Information Notice</h3>
              <p className="text-sm text-blue-700">
                This tool helps you organize and understand your health records. For medical advice, diagnoses, or treatment decisions, always consult with your healthcare provider. In case of emergency, call your local emergency services.
              </p>
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

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editingRecord ? "Edit" : "Add"} {recordTypes[modalType].label}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Medical History Form */}
              {modalType === "medical-history" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
                    <input
                      type="text"
                      value={newMedicalHistory.condition}
                      onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, condition: e.target.value })}
                      placeholder="e.g., Type 2 Diabetes, Hypertension"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosed Date</label>
                      <input
                        type="date"
                        value={newMedicalHistory.diagnosedDate}
                        onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, diagnosedDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={newMedicalHistory.status}
                        onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, status: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="resolved">Resolved</option>
                        <option value="managed">Managed</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                    <input
                      type="text"
                      value={newMedicalHistory.doctor}
                      onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, doctor: e.target.value })}
                      placeholder="Diagnosing physician"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={newMedicalHistory.notes}
                      onChange={(e) => setNewMedicalHistory({ ...newMedicalHistory, notes: e.target.value })}
                      placeholder="Additional details..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {/* Lab Result Form */}
              {modalType === "lab-result" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Test Name *</label>
                    <input
                      type="text"
                      value={newLabResult.testName}
                      onChange={(e) => setNewLabResult({ ...newLabResult, testName: e.target.value })}
                      placeholder="e.g., Complete Blood Count, HbA1c"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                      <input
                        type="text"
                        value={newLabResult.value}
                        onChange={(e) => setNewLabResult({ ...newLabResult, value: e.target.value })}
                        placeholder="e.g., 5.6"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <input
                        type="text"
                        value={newLabResult.unit}
                        onChange={(e) => setNewLabResult({ ...newLabResult, unit: e.target.value })}
                        placeholder="e.g., mg/dL"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={newLabResult.status}
                        onChange={(e) => setNewLabResult({ ...newLabResult, status: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                      >
                        <option value="normal">Normal</option>
                        <option value="abnormal">Abnormal</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reference Range</label>
                      <input
                        type="text"
                        value={newLabResult.referenceRange}
                        onChange={(e) => setNewLabResult({ ...newLabResult, referenceRange: e.target.value })}
                        placeholder="e.g., 4.0-5.6"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Test Date</label>
                      <input
                        type="date"
                        value={newLabResult.date}
                        onChange={(e) => setNewLabResult({ ...newLabResult, date: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={newLabResult.notes}
                      onChange={(e) => setNewLabResult({ ...newLabResult, notes: e.target.value })}
                      placeholder="Additional notes..."
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {/* Prescription Form */}
              {modalType === "prescription" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name *</label>
                    <input
                      type="text"
                      value={newPrescription.medication}
                      onChange={(e) => setNewPrescription({ ...newPrescription, medication: e.target.value })}
                      placeholder="e.g., Metformin, Lisinopril"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                      <input
                        type="text"
                        value={newPrescription.dosage}
                        onChange={(e) => setNewPrescription({ ...newPrescription, dosage: e.target.value })}
                        placeholder="e.g., 500mg"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                      <input
                        type="text"
                        value={newPrescription.frequency}
                        onChange={(e) => setNewPrescription({ ...newPrescription, frequency: e.target.value })}
                        placeholder="e.g., Twice daily"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={newPrescription.prescribedDate}
                        onChange={(e) => setNewPrescription({ ...newPrescription, prescribedDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date (if applicable)</label>
                      <input
                        type="date"
                        value={newPrescription.endDate}
                        onChange={(e) => setNewPrescription({ ...newPrescription, endDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prescribing Doctor</label>
                    <input
                      type="text"
                      value={newPrescription.doctor}
                      onChange={(e) => setNewPrescription({ ...newPrescription, doctor: e.target.value })}
                      placeholder="Doctor's name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                    <input
                      type="text"
                      value={newPrescription.purpose}
                      onChange={(e) => setNewPrescription({ ...newPrescription, purpose: e.target.value })}
                      placeholder="e.g., Blood sugar control"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={newPrescription.notes}
                      onChange={(e) => setNewPrescription({ ...newPrescription, notes: e.target.value })}
                      placeholder="Special instructions, side effects to watch..."
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {/* Doctor's Note Form */}
              {modalType === "doctor-note" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date *</label>
                      <input
                        type="date"
                        value={newDoctorNote.visitDate}
                        onChange={(e) => setNewDoctorNote({ ...newDoctorNote, visitDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                      <input
                        type="text"
                        value={newDoctorNote.doctor}
                        onChange={(e) => setNewDoctorNote({ ...newDoctorNote, doctor: e.target.value })}
                        placeholder="Doctor's name"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                    <input
                      type="text"
                      value={newDoctorNote.reason}
                      onChange={(e) => setNewDoctorNote({ ...newDoctorNote, reason: e.target.value })}
                      placeholder="e.g., Annual checkup, Follow-up"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                    <input
                      type="text"
                      value={newDoctorNote.diagnosis}
                      onChange={(e) => setNewDoctorNote({ ...newDoctorNote, diagnosis: e.target.value })}
                      placeholder="Diagnosis or findings"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                    <textarea
                      value={newDoctorNote.recommendations}
                      onChange={(e) => setNewDoctorNote({ ...newDoctorNote, recommendations: e.target.value })}
                      placeholder="Doctor's recommendations..."
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up</label>
                    <input
                      type="text"
                      value={newDoctorNote.followUp}
                      onChange={(e) => setNewDoctorNote({ ...newDoctorNote, followUp: e.target.value })}
                      placeholder="e.g., Return in 3 months"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                    <textarea
                      value={newDoctorNote.notes}
                      onChange={(e) => setNewDoctorNote({ ...newDoctorNote, notes: e.target.value })}
                      placeholder="Any other notes..."
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRecord}
                className={`px-4 py-2 text-white rounded-lg transition ${recordTypes[modalType].color} hover:opacity-90`}
              >
                {editingRecord ? "Update" : "Save"} Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRecordManagement;
