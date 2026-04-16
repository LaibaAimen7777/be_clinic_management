"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

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
        setTimeout(() => window.print(), 300);
      } else {
        alert("Failed to save prescription.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <p className="text-center mt-20 text-gray-500">Loading...</p>;
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
      <div className="min-h-screen bg-gray-50 p-6 print:hidden">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-light text-gray-800">
              Create Prescription
            </h1>
            <div />
          </div>

          {/* Patient Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow p-5">
            <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-3">
              Patient
            </h2>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
              <p>
                <span className="text-gray-400">Name: </span>
                {patient.name}
              </p>
              <p>
                <span className="text-gray-400">Age: </span>
                {patient.age}
              </p>
              <p>
                <span className="text-gray-400">Relative: </span>
                {patient.relativeType} {patient.relativeName}
              </p>
              <p>
                <span className="text-gray-400">CNIC/MR: </span>
                {patient.cnicOrMrNo}
              </p>
              <p>
                <span className="text-gray-400">Date: </span>
                {dateStr}
              </p>
            </div>
          </div>

          {/* Eye Examination */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow p-5">
            <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-4">
              Eye Examination
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3 grid grid-cols-3 gap-2 text-xs text-center text-gray-400 font-medium pb-1 border-b border-gray-100">
                <span>Field</span>
                <span>Right Eye (OD)</span>
                <span>Left Eye (OS)</span>
              </div>

              <span className="text-sm text-gray-600 self-center">VA</span>
              <EyeField
                label=""
                value={exam.vaRight}
                onChange={(v) => setExam({ ...exam, vaRight: v })}
                options={VA_OPTIONS}
              />
              <EyeField
                label=""
                value={exam.vaLeft}
                onChange={(v) => setExam({ ...exam, vaLeft: v })}
                options={VA_OPTIONS}
              />

              <span className="text-sm text-gray-600 self-center">IOP</span>
              <EyeField
                label=""
                value={exam.iopRight}
                onChange={(v) => setExam({ ...exam, iopRight: v })}
                options={IOP_OPTIONS}
              />
              <EyeField
                label=""
                value={exam.iopLeft}
                onChange={(v) => setExam({ ...exam, iopLeft: v })}
                options={IOP_OPTIONS}
              />

              <span className="text-sm text-gray-600 self-center">AT</span>
              <EyeField
                label=""
                value={exam.atRight}
                onChange={(v) => setExam({ ...exam, atRight: v })}
                options={AT_OPTIONS}
              />
              <EyeField
                label=""
                value={exam.atLeft}
                onChange={(v) => setExam({ ...exam, atLeft: v })}
                options={AT_OPTIONS}
              />

              <span className="text-sm text-gray-600 self-center">
                Ant. Seg
              </span>
              <div className="col-span-2">
                <input
                  type="text"
                  value={exam.antSeg}
                  onChange={(e) => setExam({ ...exam, antSeg: e.target.value })}
                  placeholder="Anterior segment findings"
                  className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 text-sm"
                />
              </div>

              <span className="text-sm text-gray-600 self-center">Fundus</span>
              <div className="col-span-2">
                <input
                  type="text"
                  value={exam.fundus}
                  onChange={(e) => setExam({ ...exam, fundus: e.target.value })}
                  placeholder="Fundus findings"
                  className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Systemic History */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow p-5">
            <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-4">
              Systemic History
            </h2>
            <div className="flex gap-6">
              {[
                ["dm", "DM"],
                ["htn", "HTN"],
                ["ihd", "IHD"],
                ["asthma", "Asthma"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={systemic[key]}
                    onChange={(e) =>
                      setSystemic({ ...systemic, [key]: e.target.checked })
                    }
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Medicine Search */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow p-5">
            <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-4">
              Medicines
            </h2>

            {/* Search bar */}
            <div className="relative mb-4">
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search medicine by name..."
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 text-sm"
              />
              {(searchResults.length > 0 || searching) && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-52 overflow-y-auto">
                  {searching && (
                    <p className="p-3 text-sm text-gray-400">Searching...</p>
                  )}
                  {searchResults.map((med) => (
                    <button
                      key={med.id}
                      onClick={() => selectMedicine(med)}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm flex justify-between items-center border-b border-gray-50 last:border-0"
                    >
                      <span className="text-gray-800">{med.name}</span>
                      <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                        {med.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected medicines */}
            {medicines.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                No medicines added yet. Search above to add.
              </p>
            )}
            <div className="space-y-3">
              {medicines.map((med, i) => (
                <div
                  key={i}
                  className="border border-gray-100 rounded-xl p-3 bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-sm font-medium text-gray-800">
                        {med.name}
                      </span>
                      <span className="ml-2 text-xs text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">
                        {med.type}
                      </span>
                    </div>
                    <button
                      onClick={() => removeMed(i)}
                      className="text-red-400 hover:text-red-600 text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Dose
                      </label>
                      <input
                        type="text"
                        value={med.dose}
                        onChange={(e) => updateMed(i, "dose", e.target.value)}
                        placeholder="e.g. 5 mg/ml"
                        className="w-full p-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Frequency
                      </label>
                      <select
                        value={med.frequency}
                        onChange={(e) =>
                          updateMed(i, "frequency", e.target.value)
                        }
                        className="w-full p-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 text-sm"
                      >
                        {FREQ_OPTIONS.map((f) => (
                          <option key={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Route
                      </label>
                      <select
                        value={med.route}
                        onChange={(e) => updateMed(i, "route", e.target.value)}
                        className="w-full p-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 text-sm"
                      >
                        {ROUTE_OPTIONS.map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow p-5">
            <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-4">
              Diagnosis & Treatment
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Diagnosis
                </label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={2}
                  placeholder="e.g. Glaucoma, Cataract... (optional)"
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Treatment Plan
                </label>
                <textarea
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  rows={2}
                  placeholder="e.g. Surgery advised, follow up in 2 weeks... (optional)"
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 text-sm resize-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveAndPrint}
            disabled={saving}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save & Print Prescription"}
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
        <div
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
        </div>

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
