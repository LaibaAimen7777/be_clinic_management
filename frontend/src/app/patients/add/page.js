"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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

const initialForm = {
  name: "",
  age: "",
  relativeType: "",
  relativeName: "",
  idType: "CNIC",
  cnicOrMrNo: "",
  date: today,
};

export default function AddPatient() {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [matchedPatient, setMatchedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const validate = () => {
    const e = {};
    if (!/^[a-zA-Z\s\u0600-\u06FF]{2,100}$/.test(formData.name.trim()))
      e.name = "Name must be at least 2 characters (letters only).";
    if (!formData.relativeType)
      e.relativeType = "Please select a relative type.";
    if (!/^[a-zA-Z\s\u0600-\u06FF]{2,100}$/.test(formData.relativeName.trim()))
      e.relativeName = "Please enter a valid relative name.";
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 1 || age > 120)
      e.age = "Age must be between 1 and 120.";
    const cnic = formData.cnicOrMrNo.trim();
    const digitsOnly = cnic.replace(/\D/g, "");
    const isAllSame =
      digitsOnly.length > 0 &&
      [...digitsOnly].every((d) => d === digitsOnly[0]);
    if (formData.idType === "CNIC") {
      if (!/^\d{5}-\d{7}-\d$/.test(cnic) || isAllSame)
        e.cnicOrMrNo = "Enter a valid CNIC: 42101-1234567-1";
    } else {
      if (!/^[A-Za-z0-9\-]{3,20}$/.test(cnic) || isAllSame)
        e.cnicOrMrNo = "Enter a valid MR No (3–20 alphanumeric characters).";
    }
    if (!formData.date || formData.date > today)
      e.date = "Date cannot be in the future.";
    return e;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleCNICChange = (e) => {
    let val = e.target.value;
    if (formData.idType === "CNIC") {
      val = val.replace(/[^\d]/g, "");
      if (val.length <= 5) val = val;
      else if (val.length <= 12) val = val.slice(0, 5) + "-" + val.slice(5);
      else
        val =
          val.slice(0, 5) + "-" + val.slice(5, 12) + "-" + val.slice(12, 13);
    }
    setFormData({ ...formData, cnicOrMrNo: val });
    setErrors({ ...errors, cnicOrMrNo: "" });
  };

  // Search for existing patient when CNIC is complete
  useEffect(() => {
    const cnic = formData.cnicOrMrNo.trim();
    const isComplete =
      formData.idType === "CNIC"
        ? /^\d{5}-\d{7}-\d$/.test(cnic)
        : cnic.length >= 3;
    if (!isComplete) {
      setMatchedPatient(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/patients/search?cnic=${encodeURIComponent(cnic)}`,
        );
        const data = await res.json();
        if (data && data.id) {
          setMatchedPatient(data);
          setShowModal(true);
        }
      } catch {}
    }, 400);
    return () => clearTimeout(timer);
  }, [formData.cnicOrMrNo]);

  const confirmExistingPatient = () => {
    if (!matchedPatient) return;
    const existingDate = new Date(matchedPatient.date)
      .toISOString()
      .split("T")[0];
    setFormData({
      name: matchedPatient.name,
      age: String(matchedPatient.age),
      relativeType: matchedPatient.relativeType,
      relativeName: matchedPatient.relativeName,
      idType:
        matchedPatient.cnicOrMrNo.includes("-") &&
        /^\d/.test(matchedPatient.cnicOrMrNo)
          ? "CNIC"
          : "MR",
      cnicOrMrNo: matchedPatient.cnicOrMrNo,
      date: today,
    });
    setShowModal(false);
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          age: parseInt(formData.age),
          relativeType: formData.relativeType,
          relativeName: formData.relativeName.trim(),
          cnicOrMrNo: formData.cnicOrMrNo.trim(),
          date: new Date(formData.date).toISOString(),
        }),
      });
      if (res.ok) {
        router.push("/appointments");
        toast.success("patient added successfully");
      } else {
        const data = await res.json();
        toast.error("Error: " + (data?.error || "Something went wrong."));
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Returning Patient Modal */}
      {showModal && matchedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full border border-gray-100">
            <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-cyan-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Returning Patient Found
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              This CNIC matches an existing record. Is this the same patient?
            </p>
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-1 text-sm">
              <p>
                <span className="text-slate-400">Name: </span>
                <span className="font-semibold text-slate-800">
                  {matchedPatient.name}
                </span>
              </p>
              <p>
                <span className="text-slate-400">Age: </span>
                <span className="font-semibold text-slate-800">
                  {matchedPatient.age}
                </span>
              </p>
              <p>
                <span className="text-slate-400">Relative: </span>
                <span className="font-semibold text-slate-800">
                  {matchedPatient.relativeType} {matchedPatient.relativeName}
                </span>
              </p>
              <p>
                <span className="text-slate-400">CNIC/MR: </span>
                <span className="font-mono text-slate-800">
                  {matchedPatient.cnicOrMrNo}
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmExistingPatient}
                className="flex-1 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all"
              >
                Yes, use this patient
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setMatchedPatient(null);
                }}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                No, new patient
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-accent-soft p-4 md:p-12 flex items-center justify-center font-sans">
        <div className="w-full max-w-5xl grid md:grid-cols-12 gap-0 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden border border-white">
          {/* Left Side */}
          <div className="md:col-span-4 bg-primary p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 rounded-full mb-8">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                  Registration Active
                </span>
              </div>
              <h2 className="text-4xl font-light mb-4">
                Patient <br />
                <span className="font-bold text-accent">Intake</span>
              </h2>
              <p className="text-textMuted text-sm leading-relaxed">
                Registering new visitors at{" "}
                <strong>Bakhtbari Eye Clinic</strong>. Enter CNIC to auto-detect
                returning patients.
              </p>
            </div>
            {/* <div className="relative z-10">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-[10px] uppercase text-textMuted font-bold mb-1">
                  Clinic ID
                </p>
                <p className="text-sm font-mono tracking-widest text-accent">
                  BEC-2026-OPD
                </p>
              </div>
            </div> */}
          </div>

          {/* Right Side */}
          <div className="md:col-span-8 p-8 md:p-16">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  Personal Details
                </h3>
                <p className="text-textMuted text-sm">
                  Basic patient information
                </p>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-textMuted uppercase tracking-widest">
                  Entry Date
                </p>
                <p className="text-sm font-bold text-slate-900">{today}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              {/* ID Section - FIRST so returning patient can auto-fill below fields */}
              <div className="md:col-span-2 bg-bgSoft p-6 rounded-[2rem] border border-borderSoft">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-700">
                    Verification ID{" "}
                    <span className="text-xs font-normal text-slate-400 ml-1">
                      — enter first to detect returning patients
                    </span>
                  </h4>
                  <div className="flex bg-white rounded-lg p-1 border border-borderSoft">
                    {["CNIC", "MR"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            idType: t,
                            cnicOrMrNo: "",
                          });
                          setErrors({ ...errors, cnicOrMrNo: "" });
                          setMatchedPatient(null);
                        }}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${formData.idType === t ? "bg-primary text-white shadow-md" : "text-textMuted"}`}
                      >
                        {t === "MR" ? "MR NO" : "CNIC"}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  name="cnicOrMrNo"
                  value={formData.cnicOrMrNo}
                  onChange={handleCNICChange}
                  placeholder={
                    formData.idType === "CNIC"
                      ? "42101-1234567-1"
                      : "MR-2026-XXXX"
                  }
                  maxLength={formData.idType === "CNIC" ? 15 : 20}
                  className={`w-full bg-white border-2 rounded-2xl px-6 py-4 outline-none focus:border-accent focus:ring-4 focus:ring-accentSoft transition-all font-mono text-lg tracking-wider text-gray-800 ${errors.cnicOrMrNo ? "border-red-400" : "border-borderSoft"}`}
                />
                {errors.cnicOrMrNo && (
                  <p className="text-red-500 text-xs mt-2">
                    {errors.cnicOrMrNo}
                  </p>
                )}
                {formData.idType === "CNIC" && !errors.cnicOrMrNo && (
                  <p className="text-slate-400 text-xs mt-2">
                    Dashes are added automatically as you type.
                  </p>
                )}
              </div>

              {/* Name */}
              <div className="relative group">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  placeholder=" "
                  className={`peer w-full bg-transparent border-b-2 py-2 outline-none transition-colors text-slate-800 font-medium ${errors.name ? "border-red-400" : "border-borderSoft focus:border-accent"}`}
                />
                <label className="absolute left-0 top-2 text-textMuted pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-accent peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">
                  Patient Full Name
                </label>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Age */}
              <div className="relative group">
                <input
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  type="number"
                  placeholder=" "
                  min={1}
                  max={120}
                  className={`peer w-full bg-transparent border-b-2 py-2 outline-none transition-colors text-slate-800 font-medium ${errors.age ? "border-red-400" : "border-borderSoft focus:border-accent"}`}
                />
                <label className="absolute left-0 top-2 text-textMuted pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-accent peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">
                  Age
                </label>
                {errors.age && (
                  <p className="text-red-500 text-xs mt-1">{errors.age}</p>
                )}
              </div>

              {/* Relative Type */}
              <div>
                <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest mb-3">
                  Relationship Type
                </p>
                <div className="flex gap-2">
                  {["S/O", "D/O", "W/O"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, relativeType: type });
                        setErrors({ ...errors, relativeType: "" });
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border-2 transition-all ${formData.relativeType === type ? "border-accent bg-accentSoft text-accent" : "border-borderSoft bg-bgSoft text-textMuted"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {errors.relativeType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.relativeType}
                  </p>
                )}
              </div>

              {/* Relative Name */}
              <div className="relative group">
                <input
                  name="relativeName"
                  value={formData.relativeName}
                  onChange={handleChange}
                  type="text"
                  placeholder=" "
                  className={`peer w-full bg-transparent border-b-2 py-2 outline-none transition-colors text-slate-800 font-medium ${errors.relativeName ? "border-red-400" : "border-borderSoft focus:border-accent"}`}
                />
                <label className="absolute left-0 top-2 text-textMuted pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-accent peer-focus:font-bold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">
                  Guardian / Relative Name
                </label>
                {errors.relativeName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.relativeName}
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="md:col-span-2">
                <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest mb-3">
                  Visit Date
                </p>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  min={today}
                  onChange={handleChange}
                  className={`w-full bg-white border-2 rounded-2xl px-6 py-3 outline-none focus:border-accent transition-all text-slate-800 ${errors.date ? "border-red-400" : "border-borderSoft"}`}
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-16 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex sm:w-auto px-12 py-4 bg-primary hover:bg-blue-950 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {loading ? "Processing..." : "Register Patient"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/appointments")}
                className="flex items-center gap-2 px-5 py-4 rounded-xl border border-borderSoft bg-white text-sm font-semibold text-slate-500 hover:text-primary hover:border-primary hover:bg-gray-50 transition-all"
              >
                View Appointments →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
