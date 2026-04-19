"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function getPKTDate() {
  const now = new Date();
  const pkt = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Karachi" }),
  );
  const y = pkt.getFullYear();
  const m = String(pkt.getMonth() + 1).padStart(2, "0");
  const d = String(pkt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const today = getPKTDate();

const STATUS_TABS = ["All", "Waiting", "Checked", "Missed Appointment"];

export default function Appointments() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(today);
  const [editErrors, setEditErrors] = useState({});
  const [editIdType, setEditIdType] = useState("CNIC");
  const router = useRouter();

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/patients");
      const data = await res.json();
      if (Array.isArray(data)) setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const counts = {
    All: patients.length,
    Waiting: patients.filter((p) => p.status === "Waiting").length,
    Checked: patients.filter((p) => p.status === "Checked").length,
    "Missed Appointment": patients.filter((p) => p.status === "No-Show").length,
  };

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      p.cnicOrMrNo.toLowerCase().includes(q);
    const tabStatus =
      activeTab === "Missed Appointment" ? "No-Show" : activeTab;
    const matchTab = activeTab === "All" || p.status === tabStatus;
    return matchSearch && matchTab;
  });

  const startEdit = (patient) => {
    setEditingId(patient.id);
    setEditErrors({});
    const isCNIC = /^\d{5}-\d{7}-\d$/.test(patient.cnicOrMrNo);
    setEditIdType(isCNIC ? "CNIC" : "MR");
    setEditForm({
      name: patient.name,
      age: String(patient.age),
      relativeType: patient.relativeType,
      relativeName: patient.relativeName,
      cnicOrMrNo: patient.cnicOrMrNo,
      date: new Date(patient.date).toISOString().split("T")[0],
      status: patient.status,
    });
  };

  const handleSave = async (id) => {
    const errs = validateEdit();
    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, age: parseInt(editForm.age) }),
      });
      if (res.ok) {
        setEditingId(null);
        setEditErrors({});
        fetchPatients();
      } else alert("Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  const validateEdit = () => {
    const e = {};

    if (!/^[a-zA-Z\s\u0600-\u06FF]{2,100}$/.test(editForm.name.trim()))
      e.name = "Name must be at least 2 characters (letters only).";

    if (!editForm.relativeType)
      e.relativeType = "Please select a relative type.";

    if (!/^[a-zA-Z\s\u0600-\u06FF]{2,100}$/.test(editForm.relativeName.trim()))
      e.relativeName = "Please enter a valid relative name.";

    const age = parseInt(editForm.age);
    if (isNaN(age) || age < 1 || age > 120)
      e.age = "Age must be between 1 and 120.";

    const cnic = editForm.cnicOrMrNo.trim();
    const digitsOnly = cnic.replace(/\D/g, "");
    const isAllSame =
      digitsOnly.length > 0 &&
      [...digitsOnly].every((d) => d === digitsOnly[0]);

    if (editIdType === "CNIC") {
      if (!/^\d{5}-\d{7}-\d$/.test(cnic) || isAllSame)
        e.cnicOrMrNo = "Enter a valid CNIC: 42101-1234567-1";
    } else {
      if (!/^[A-Za-z0-9\-]{3,20}$/.test(cnic) || isAllSame)
        e.cnicOrMrNo = "Enter a valid MR No (3–20 alphanumeric characters).";
    }

    if (!editForm.date || editForm.date > today)
      e.date = "Date cannot be in the future.";

    return e;
  };

  const handleReschedule = async (id) => {
    if (!rescheduleDate || rescheduleDate < today) {
      alert("Please pick today or a future date.");
      return;
    }
    setSaving(true);
    try {
      const patient = patients.find((p) => p.id === id);
      const res = await fetch(`/api/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: patient.name,
          age: patient.age,
          relativeType: patient.relativeType,
          relativeName: patient.relativeName,
          cnicOrMrNo: patient.cnicOrMrNo,
          date: new Date(rescheduleDate).toISOString(),
          status: "Waiting",
        }),
      });
      if (res.ok) {
        setRescheduleId(null);
        setRescheduleDate(today);
        fetchPatients();
      } else alert("Failed to reschedule.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteConfirm(null);
        fetchPatients();
      } else alert("Failed to delete.");
    } catch {
      alert("Network error.");
    }
  };

  const inputCls =
    "w-full p-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary";

  const statusStyle = {
    Waiting: "bg-amber-50 text-amber-600 border-amber-200",
    Checked: "bg-emerald-50 text-emerald-600 border-emerald-200",
    "No-Show": "bg-red-50 text-red-500 border-red-200",
  };

  const statusBar = {
    Waiting: "bg-amber-400",
    Checked: "bg-emerald-400",
    "No-Show": "bg-red-400",
  };

  return (
    <>
      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Delete Record?
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              This will permanently delete <strong>{deleteConfirm.name}</strong>
              's record including all prescriptions. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-600 transition-all"
              >
                Delete Permanently
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                Keep Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Reschedule Appointment
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              Pick a new date for{" "}
              <strong>
                {patients.find((p) => p.id === rescheduleId)?.name}
              </strong>
              . Status will be reset to Waiting.
            </p>
            <input
              type="date"
              value={rescheduleDate}
              min={today}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-3 text-slate-800 outline-none focus:border-primary mb-5"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleReschedule(rescheduleId)}
                disabled={saving}
                className="flex-1 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-all"
              >
                {saving ? "Saving..." : "Confirm Reschedule"}
              </button>
              <button
                onClick={() => setRescheduleId(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-accent-soft p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                Appointments
              </h1>
              <p className="text-textMuted text-sm mt-1">
                {patients.length} total records
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/patients/add")}
                className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all"
              >
                + New Patient
              </button>
              <button
                onClick={() => router.push("/doctor/patientToday")}
                className="px-5 py-2.5 bg-white border border-borderSoft text-slate-600 rounded-xl font-bold text-sm hover:border-primary hover:text-primary transition-all"
              >
                Doctor Dashboard
              </button>
            </div>
          </div>

          {/* Status summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${activeTab === tab ? "border-primary bg-blue-50 shadow-md" : "border-borderSoft bg-white hover:border-primary/40"}`}
              >
                <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">
                  {tab}
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {counts[tab]}
                </p>
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or CNIC/MR No..."
            className="w-full mb-6 p-4 bg-white border border-borderSoft rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />

          {/* List */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto mb-3" />
              <p className="text-sm text-gray-400">Loading appointments...</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-slate-400 py-20">
              No appointments found.
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white rounded-2xl border border-borderSoft shadow-sm overflow-hidden"
                >
                  {editingId === patient.id ? (
                    <div className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {/* Name */}
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">
                            Full Name
                          </label>
                          <input
                            className={`${inputCls} ${editErrors.name ? "border-red-400" : ""}`}
                            value={editForm.name}
                            onChange={(e) => {
                              setEditForm({
                                ...editForm,
                                name: e.target.value,
                              });
                              setEditErrors({ ...editErrors, name: "" });
                            }}
                          />
                          {editErrors.name && (
                            <p className="text-red-500 text-xs mt-1">
                              {editErrors.name}
                            </p>
                          )}
                        </div>

                        {/* Age */}
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">
                            Age
                          </label>
                          <input
                            type="number"
                            className={`${inputCls} ${editErrors.age ? "border-red-400" : ""}`}
                            value={editForm.age}
                            min={1}
                            max={120}
                            onChange={(e) => {
                              setEditForm({ ...editForm, age: e.target.value });
                              setEditErrors({ ...editErrors, age: "" });
                            }}
                          />
                          {editErrors.age && (
                            <p className="text-red-500 text-xs mt-1">
                              {editErrors.age}
                            </p>
                          )}
                        </div>

                        {/* Relative Type */}
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">
                            Relative Type
                          </label>
                          <select
                            className={`${inputCls} ${editErrors.relativeType ? "border-red-400" : ""}`}
                            value={editForm.relativeType}
                            onChange={(e) => {
                              setEditForm({
                                ...editForm,
                                relativeType: e.target.value,
                              });
                              setEditErrors({
                                ...editErrors,
                                relativeType: "",
                              });
                            }}
                          >
                            <option value="">Select</option>
                            <option>S/O</option>
                            <option>D/O</option>
                            <option>W/O</option>
                          </select>
                          {editErrors.relativeType && (
                            <p className="text-red-500 text-xs mt-1">
                              {editErrors.relativeType}
                            </p>
                          )}
                        </div>

                        {/* Relative Name */}
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">
                            Relative Name
                          </label>
                          <input
                            className={`${inputCls} ${editErrors.relativeName ? "border-red-400" : ""}`}
                            value={editForm.relativeName}
                            onChange={(e) => {
                              setEditForm({
                                ...editForm,
                                relativeName: e.target.value,
                              });
                              setEditErrors({
                                ...editErrors,
                                relativeName: "",
                              });
                            }}
                          />
                          {editErrors.relativeName && (
                            <p className="text-red-500 text-xs mt-1">
                              {editErrors.relativeName}
                            </p>
                          )}
                        </div>

                        {/* CNIC / MR No */}
                        <div className="md:col-span-2">
                          <label className="text-xs text-slate-400 block mb-2">
                            CNIC / MR No
                          </label>
                          <div className="flex gap-2 mb-2">
                            {["CNIC", "MR"].map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => {
                                  setEditIdType(t);
                                  setEditForm({ ...editForm, cnicOrMrNo: "" });
                                  setEditErrors({
                                    ...editErrors,
                                    cnicOrMrNo: "",
                                  });
                                }}
                                className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                  editIdType === t
                                    ? "bg-primary text-white border-primary"
                                    : "bg-slate-50 text-slate-400 border-slate-200"
                                }`}
                              >
                                {t === "MR" ? "MR NO" : "CNIC"}
                              </button>
                            ))}
                          </div>
                          <input
                            className={`${inputCls} font-mono ${editErrors.cnicOrMrNo ? "border-red-400" : ""}`}
                            value={editForm.cnicOrMrNo}
                            placeholder={
                              editIdType === "CNIC"
                                ? "42101-1234567-1"
                                : "MR-2026-XXXX"
                            }
                            maxLength={editIdType === "CNIC" ? 15 : 20}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (editIdType === "CNIC") {
                                val = val.replace(/[^\d]/g, "");
                                if (val.length <= 5) val = val;
                                else if (val.length <= 12)
                                  val = val.slice(0, 5) + "-" + val.slice(5);
                                else
                                  val =
                                    val.slice(0, 5) +
                                    "-" +
                                    val.slice(5, 12) +
                                    "-" +
                                    val.slice(12, 13);
                              }
                              setEditForm({ ...editForm, cnicOrMrNo: val });
                              setEditErrors({ ...editErrors, cnicOrMrNo: "" });
                            }}
                          />
                          {editErrors.cnicOrMrNo && (
                            <p className="text-red-500 text-xs mt-1">
                              {editErrors.cnicOrMrNo}
                            </p>
                          )}
                          {editIdType === "CNIC" && !editErrors.cnicOrMrNo && (
                            <p className="text-slate-400 text-xs mt-1">
                              Dashes are added automatically as you type.
                            </p>
                          )}
                        </div>
                        {/* Date */}
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            className={`${inputCls} ${editErrors.date ? "border-red-400" : ""}`}
                            value={editForm.date}
                            max={today}
                            onChange={(e) => {
                              setEditForm({
                                ...editForm,
                                date: e.target.value,
                              });
                              setEditErrors({ ...editErrors, date: "" });
                            }}
                          />
                          {editErrors.date && (
                            <p className="text-red-500 text-xs mt-1">
                              {editErrors.date}
                            </p>
                          )}
                        </div>

                        {/* Status */}
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">
                            Status
                          </label>
                          <select
                            className={inputCls}
                            value={editForm.status}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                status: e.target.value,
                              })
                            }
                          >
                            <option>Waiting</option>
                            <option>Checked</option>
                            <option>Missed Appointment</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleSave(patient.id)}
                          disabled={saving}
                          className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-60"
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditErrors({});
                          }}
                          className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-2 h-10 rounded-full ${statusBar[patient.status] ?? "bg-gray-300"}`}
                        />
                        <div>
                          <p className="font-bold text-slate-800">
                            {patient.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {patient.relativeType} {patient.relativeName} · Age{" "}
                            {patient.age}
                          </p>
                          <p className="text-xs text-slate-400">
                            {patient.cnicOrMrNo} ·{" "}
                            {new Date(patient.date).toLocaleDateString(
                              "en-PK",
                              { timeZone: "Asia/Karachi" },
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle[patient.status] ?? ""}`}
                        >
                          {patient.status === "No-Show"
                            ? "Missed Appointment"
                            : patient.status}
                        </span>
                        <button
                          onClick={() => startEdit(patient)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all"
                        >
                          Edit
                        </button>
                        {patient.status === "No-Show" && (
                          <button
                            onClick={() => {
                              setRescheduleId(patient.id);
                              setRescheduleDate(today);
                            }}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all"
                          >
                            Reschedule
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirm(patient)}
                          className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
