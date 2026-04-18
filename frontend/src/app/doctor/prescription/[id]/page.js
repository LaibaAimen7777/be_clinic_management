"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";

const VA_OPTIONS = [
  "6/6",
  "6/9",
  "6/12",
  "6/18",
  "6/24",
  "6/36",
  "6/60",
  "3/60",
  "1/60",
  "HM",
  "PL",
  "NPL",
  "Custom",
];
const IOP_OPTIONS = [
  "10",
  "12",
  "14",
  "16",
  "18",
  "20",
  "22",
  "24",
  "26",
  "28",
  "30",
  "Custom",
];
const AT_OPTIONS = [
  "10/10",
  "12/12",
  "14/14",
  "16/16",
  "18/18",
  "20/20",
  "Custom",
];
const FREQ_OPTIONS = [
  "Once daily",
  "Twice daily",
  "Thrice daily",
  "Four times daily",
  "Every 4 hours",
  "Every 6 hours",
  "At bedtime",
  "SOS",
];
const ROUTE_OPTIONS = [
  "Topical",
  "Oral",
  "IV",
  "IM",
  "Subconjunctival",
  "Intravitreal",
];

function EyeField({ label, value, onChange, options }) {
  const [custom, setCustom] = useState(false);
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      {custom ? (
        <div className="flex gap-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 p-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 text-sm"
            placeholder="Type value"
            autoFocus
          />
          <button
            onClick={() => setCustom(false)}
            className="text-xs text-gray-400 hover:text-gray-600 px-1"
          >
            ↩
          </button>
        </div>
      ) : (
        <select
          value={value}
          onChange={(e) => {
            if (e.target.value === "Custom") {
              setCustom(true);
              onChange("");
            } else onChange(e.target.value);
          }}
          className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 text-sm"
        >
          <option value="">—</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      )}
    </div>
  );
}

export default function PrescriptionPage() {
  const { id } = useParams();
  const router = useRouter();
  const printRef = useRef();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");

  // Eye exam
  const [exam, setExam] = useState({
    vaRight: "",
    vaLeft: "",
    iopRight: "",
    iopLeft: "",
    atRight: "",
    atLeft: "",
    antSeg: "",
    fundus: "",
  });

  // Systemic history
  const [systemic, setSystemic] = useState({
    dm: false,
    htn: false,
    ihd: false,
    asthma: false,
  });

  // Medicines
  const [medicines, setMedicines] = useState([]);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetch(`/api/patients/${id}`)
      .then((r) => r.json())
      .then((d) => setPatient(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!searchQ.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/medicines?q=${encodeURIComponent(searchQ)}`,
        );
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQ]);

  const selectMedicine = (med) => {
    setMedicines([
      ...medicines,
      {
        id: med.id,
        name: med.name,
        type: med.type,
        dose: "",
        frequency: "Once daily",
        route: "Topical",
      },
    ]);
    setSearchQ("");
    setSearchResults([]);
  };

  const updateMed = (i, field, val) => {
    const updated = [...medicines];
    updated[i][field] = val;
    setMedicines(updated);
  };

  const removeMed = (i) =>
    setMedicines(medicines.filter((_, idx) => idx !== i));

  const handleSaveAndPrint = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: id,
          medicines,
          diagnosis,
          treatment,
          ...exam,
          ...systemic,
        }),
      });
      if (res.ok) {
        setTimeout(() => {
          window.print();

          // optional delay so print dialog doesn't block navigation instantly
          setTimeout(() => {
            router.push("/doctor/patientToday");
          }, 500);
        }, 300);
      } else {
        toast.error("Failed to save prescription.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto mb-3" />
        <p className="text-sm text-gray-400">Loading patient...</p>
      </div>
    );
  if (!patient)
    return (
      <p className="text-center mt-20 text-gray-500">Patient not found.</p>
    );

  const dateStr = new Date(patient.date).toLocaleDateString("en-PK", {
    timeZone: "Asia/Karachi",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <>
      {/* ── SCREEN UI ── */}
      <div className="min-h-screen bg-accent-soft p-4 md:p-8 print:hidden text-slate-900">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/doctor/patientToday")}
              className="px-5 py-2.5 bg-white border border-borderSoft text-slate-600 rounded-xl font-bold text-sm hover:border-primary hover:text-primary transition-all"
            >
              BACK
            </button>
            <div className="text-right">
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Prescription
              </h1>
            </div>
          </div>

          {/* Patient Info Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100">
              {[
                ["Patient Name", patient.name],
                ["Age ", `${patient.age} Years`],
                [
                  "Guardian/Relative",
                  `${patient.relativeType} ${patient.relativeName}`,
                ],
                ["Registration ID", patient.cnicOrMrNo],
              ].map(([label, value]) => (
                <div key={label} className="bg-white p-5">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    {label}
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {value || "—"}
                  </span>
                </div>
              ))}
              <div className="bg-slate-50 p-5 md:col-span-2 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Consultation Date
                </span>
                <span className="text-sm font-mono font-bold text-slate-600">
                  {dateStr}
                </span>
              </div>
            </div>
          </div>

          {/* Eye Examination Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                Eye Examination
              </h2>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-6 items-end">
                <div />
                <div className="text-center pb-2 border-b-2 border-blue-100">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                    Right Eye (OD)
                  </span>
                </div>
                <div className="text-center pb-2 border-b-2 border-emerald-100">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    Left Eye (OS)
                  </span>
                </div>

                {[
                  {
                    label: "VA (Visual Acuity)",
                    right: "vaRight",
                    left: "vaLeft",
                    options: VA_OPTIONS,
                  },
                  {
                    label: "IOP (Pressure)",
                    right: "iopRight",
                    left: "iopLeft",
                    options: IOP_OPTIONS,
                  },
                  {
                    label: "AT (Tonometry)",
                    right: "atRight",
                    left: "atLeft",
                    options: AT_OPTIONS,
                  },
                ].map((row) => (
                  <React.Fragment key={row.label}>
                    <span className="text-xs font-bold text-slate-500 mb-3">
                      {row.label}
                    </span>
                    <EyeField
                      value={exam[row.right]}
                      onChange={(v) => setExam({ ...exam, [row.right]: v })}
                      options={row.options}
                    />
                    <EyeField
                      value={exam[row.left]}
                      onChange={(v) => setExam({ ...exam, [row.left]: v })}
                      options={row.options}
                    />
                  </React.Fragment>
                ))}
              </div>

              {/* High Contrast Inputs for Ant Seg & Fundus */}
              <div className="grid grid-cols-1 gap-6 pt-6 border-t border-slate-100">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">
                    Anterior Segment (Ant. Seg)
                  </label>
                  <input
                    type="text"
                    value={exam.antSeg}
                    onChange={(e) =>
                      setExam({ ...exam, antSeg: e.target.value })
                    }
                    // placeholder="e.g. Clear cornea, quiet AC..."
                    className="w-full p-4 bg-white rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-0 outline-none text-slate-900 font-medium placeholder:text-slate-400 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">
                    Fundus Examination
                  </label>
                  <input
                    type="text"
                    value={exam.fundus}
                    onChange={(e) =>
                      setExam({ ...exam, fundus: e.target.value })
                    }
                    // placeholder="e.g. Healthy disc, normal macula..."
                    className="w-full p-4 bg-white rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-0 outline-none text-slate-900 font-medium placeholder:text-slate-400 transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Systemic History - Pill Style */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">
              Systemic History
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                ["dm", "Diabetes"],
                ["htn", "Hypertension"],
                ["ihd", "Heart Disease"],
                ["asthma", "Asthma"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() =>
                    setSystemic({ ...systemic, [key]: !systemic[key] })
                  }
                  className={`px-5 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all ${
                    systemic[key]
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Medicines Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">
              Rx / Medications
            </h2>

            <div className="relative mb-6">
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Type medicine name to search..."
                className="w-full p-3 bg-blue-50 border border-blue-800 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
              {/* Results Dropdown */}
              {(searchResults.length > 0 || searching) && (
                <div className="absolute z-20 w-full bg-white border-2 border-slate-900 rounded-2xl shadow-2xl mt-2 overflow-hidden">
                  {searchResults.map((med) => (
                    <button
                      key={med.id}
                      onClick={() => selectMedicine(med)}
                      className="w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors flex justify-between items-center group"
                    >
                      <span className="font-bold text-slate-800 group-hover:text-blue-600">
                        {med.name}
                      </span>
                      <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase">
                        {med.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              {medicines.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-sm text-slate-400 font-medium">
                    No medications added yet.
                  </p>
                </div>
              )}
              {medicines.map((med, i) => (
                <div
                  key={i}
                  className="relative bg-slate-50 rounded-2xl p-5 border-l-4 border-blue-600 group"
                >
                  <button
                    onClick={() => removeMed(i)}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  <div className="mb-4">
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight">
                      {med.name}
                    </span>
                    <span className="ml-3 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 uppercase">
                      {med.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        Dosage
                      </label>
                      <input
                        type="text"
                        value={med.dose}
                        onChange={(e) => updateMed(i, "dose", e.target.value)}
                        className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-sm font-bold focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        Frequency
                      </label>
                      <select
                        value={med.frequency}
                        onChange={(e) =>
                          updateMed(i, "frequency", e.target.value)
                        }
                        className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-sm font-bold focus:border-blue-500 outline-none"
                      >
                        {FREQ_OPTIONS.map((opt) => (
                          <option key={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                        Route
                      </label>
                      <select
                        value={med.route}
                        onChange={(e) => updateMed(i, "route", e.target.value)}
                        className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-sm font-bold focus:border-blue-500 outline-none"
                      >
                        {ROUTE_OPTIONS.map((opt) => (
                          <option key={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Restored Add Medicine Button */}
            <button
              onClick={() => router.push("/medicines/add")}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-bold hover:bg-slate-50 hover:border-slate-300 hover:text-slate-600 transition-all flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span> Add New Medicine to Library
            </button>
          </div>

          {/* Diagnosis & Treatment */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="grid gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Clinical Diagnosis
                </label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={2}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-slate-900 outline-none text-sm font-medium transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Treatment & Advice
                </label>
                <textarea
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  rows={2}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-slate-900 outline-none text-sm font-medium transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Big Action Button */}
          <button
            onClick={handleSaveAndPrint}
            disabled={saving}
            className="w-full bg-primary text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-950 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? "Storing Record..." : "Confirm & Print Prescription"}
          </button>
        </div>
      </div>

      {/* ── PRINT LAYOUT ── */}
      <div className="hidden print:block text-black bg-white w-full">
        <style>{`
          @media print {
            @page { size: A5; margin: 8mm; }
            body { margin: 0; -webkit-print-color-adjust: exact; }
          }
        `}</style>

        {/* Header */}
        <div className="w-full mb-2">
          <img
            src="/images/bec_notePad_top.png"
            alt="Doctor Header"
            style={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </div>
        {/* <div
          style={{
            borderBottom: "2.5px solid #000",
            paddingBottom: "6px",
            marginBottom: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ direction: "rtl", flex: 1 }}>
            <p style={{ fontSize: "8px", color: "#555", margin: 0 }}>
              کالج روڈ نزد ڈسٹرکٹ ہیڈکوارٹر ہسپتال لیہ
            </p>
            <p
              style={{
                fontSize: "19px",
                fontWeight: "bold",
                margin: "2px 0",
                fontFamily: "serif",
              }}
            >
              بخت بھری اے آئی کلینک
            </p>
            <p style={{ fontSize: "8px", margin: 0 }}>
              <b>پی ایم ڈی سی نمبر: 24176-P</b>
            </p>
            <p style={{ fontSize: "8px", margin: 0 }}>
              پنجاب ہیلتھ کیئر کمیشن: R-41350
            </p>
          </div>
          <div style={{ width: "58px", textAlign: "center", padding: "0 6px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                border: "1px solid #ccc",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "7px",
                color: "#aaa",
                margin: "0 auto",
              }}
            >
              Logo
            </div>
          </div>
          <div style={{ flex: 1, direction: "rtl", textAlign: "left" }}>
            <p
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                fontFamily: "serif",
                margin: 0,
              }}
            >
              ڈاکٹر ارشاد احمد شیخ
            </p>
            <p style={{ fontSize: "8px", margin: "2px 0" }}>
              ایم بی بی ایس، ڈی اے او
            </p>
            <p style={{ fontSize: "8px", margin: 0 }}>فیلوآئی سرجن</p>
          </div>
        </div> */}

        {/* Patient row */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            fontSize: "10px",
            borderBottom: "1px solid #ccc",
            paddingBottom: "5px",
            marginBottom: "5px",
          }}
        >
          <span>
            Patient: <b>{patient.name}</b>
          </span>
          <span style={{ marginLeft: "auto" }}>
            {patient.relativeType} {patient.relativeName}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: "12px",
            fontSize: "10px",
            borderBottom: "1px solid #ccc",
            paddingBottom: "5px",
            marginBottom: "8px",
          }}
        >
          <span>
            Date: <b>{dateStr}</b>
          </span>
          <span>
            MR/CNIC: <b>{patient.cnicOrMrNo}</b>
          </span>
          <span style={{ marginLeft: "auto" }}>
            Age: <b>{patient.age}</b>
          </span>
        </div>

        {diagnosis && (
          <div style={{ fontSize: "9px", marginBottom: "6px" }}>
            <b>Diagnosis: </b>
            {diagnosis}
          </div>
        )}
        {treatment && (
          <div style={{ fontSize: "9px", marginBottom: "8px" }}>
            <b>Treatment: </b>
            {treatment}
          </div>
        )}

        {/* Eye Exam table */}
        {(exam.vaRight ||
          exam.vaLeft ||
          exam.iopRight ||
          exam.iopLeft ||
          exam.atRight ||
          exam.atLeft ||
          exam.antSeg ||
          exam.fundus) && (
          <table
            style={{
              width: "100%",
              fontSize: "9px",
              borderCollapse: "collapse",
              marginBottom: "8px",
              border: "1px solid #ddd",
            }}
          >
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th
                  style={{
                    padding: "3px 5px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Finding
                </th>
                <th
                  style={{
                    padding: "3px 5px",
                    border: "1px solid #ddd",
                    textAlign: "center",
                  }}
                >
                  Right (OD)
                </th>
                <th
                  style={{
                    padding: "3px 5px",
                    border: "1px solid #ddd",
                    textAlign: "center",
                  }}
                >
                  Left (OS)
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["VA", exam.vaRight, exam.vaLeft],
                ["IOP", exam.iopRight, exam.iopLeft],
                ["AT", exam.atRight, exam.atLeft],
              ].map(([label, r, l]) =>
                r || l ? (
                  <tr key={label}>
                    <td
                      style={{
                        padding: "2px 5px",
                        border: "1px solid #ddd",
                        fontWeight: "bold",
                      }}
                    >
                      {label}
                    </td>
                    <td
                      style={{
                        padding: "2px 5px",
                        border: "1px solid #ddd",
                        textAlign: "center",
                      }}
                    >
                      {r || "—"}
                    </td>
                    <td
                      style={{
                        padding: "2px 5px",
                        border: "1px solid #ddd",
                        textAlign: "center",
                      }}
                    >
                      {l || "—"}
                    </td>
                  </tr>
                ) : null,
              )}
              {exam.antSeg && (
                <tr>
                  <td
                    style={{
                      padding: "2px 5px",
                      border: "1px solid #ddd",
                      fontWeight: "bold",
                    }}
                  >
                    Ant. Seg
                  </td>
                  <td
                    colSpan={2}
                    style={{ padding: "2px 5px", border: "1px solid #ddd" }}
                  >
                    {exam.antSeg}
                  </td>
                </tr>
              )}
              {exam.fundus && (
                <tr>
                  <td
                    style={{
                      padding: "2px 5px",
                      border: "1px solid #ddd",
                      fontWeight: "bold",
                    }}
                  >
                    Fundus
                  </td>
                  <td
                    colSpan={2}
                    style={{ padding: "2px 5px", border: "1px solid #ddd" }}
                  >
                    {exam.fundus}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Systemic history */}
        {(systemic.dm || systemic.htn || systemic.ihd || systemic.asthma) && (
          <p style={{ fontSize: "9px", marginBottom: "8px" }}>
            <b>Systemic History: </b>
            {[
              ["dm", "DM"],
              ["htn", "HTN"],
              ["ihd", "IHD"],
              ["asthma", "Asthma"],
            ]
              .filter(([k]) => systemic[k])
              .map(([, l]) => l)
              .join(", ")}
          </p>
        )}

        {/* Medicines */}
        {medicines.length > 0 && (
          <table
            style={{
              width: "100%",
              fontSize: "9px",
              borderCollapse: "collapse",
              marginBottom: "8px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1.5px solid #000" }}>
                <th style={{ textAlign: "left", padding: "2px 4px" }}>#</th>
                <th style={{ textAlign: "left", padding: "2px 4px" }}>
                  Medicine
                </th>
                <th style={{ textAlign: "left", padding: "2px 4px" }}>Type</th>
                <th style={{ textAlign: "left", padding: "2px 4px" }}>Dose</th>
                <th style={{ textAlign: "left", padding: "2px 4px" }}>
                  Frequency
                </th>
                <th style={{ textAlign: "left", padding: "2px 4px" }}>Route</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((m, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "2px 4px" }}>{i + 1}</td>
                  <td style={{ padding: "2px 4px" }}>{m.name}</td>
                  <td style={{ padding: "2px 4px" }}>{m.type}</td>
                  <td style={{ padding: "2px 4px" }}>{m.dose}</td>
                  <td style={{ padding: "2px 4px" }}>{m.frequency}</td>
                  <td style={{ padding: "2px 4px" }}>{m.route}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Spacer + Signature */}
        <div style={{ minHeight: "60px" }} />
        <div
          style={{
            textAlign: "right",
            fontSize: "9px",
            borderTop: "1px solid #ccc",
            paddingTop: "4px",
            marginBottom: "6px",
          }}
        >
          (Signature &amp; Stamp)
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "2px solid #000",
            paddingTop: "4px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "8px",
          }}
        >
          <span style={{ direction: "rtl" }}>
            ٹائم لینے کیلئے صبح 8:30 بجے — <b>0308-7706630</b>
          </span>
          <span style={{ direction: "rtl", textAlign: "right" }}>
            اوقات کار: صبح 9 تا 2، شام 6 تا 9 | جمعہ بند
          </span>
        </div>
      </div>
    </>
  );
}
