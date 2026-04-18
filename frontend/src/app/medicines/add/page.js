"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const TYPES = ["Drops", "Tablet", "Capsule", "Cream", "Syrup"];

export default function AdminMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("Drops");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMedicines = async () => {
    try {
      const res = await fetch("/api/medicines?q=");
      const data = await res.json();
      if (Array.isArray(data)) setMedicines(data);
    } catch (err) {
      setError("Failed to load medicines.");
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) {
      setError("Medicine name is required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type }),
      });
      if (res.ok) {
        setName("");
        fetchMedicines();
        toast.success("Medicine added successfully");
      } else {
        const d = await res.json();
        setError(d.error ?? "Failed to add.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent-soft p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Medicines
          </h1>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
            Manage Pharmacy Inventory
          </p>
        </div>

        {/* Add Form Card */}
        <div className="bg-white rounded-[2rem] border border-blue-800 shadow-xl shadow-slate-200/50 p-6 md:p-8 mb-10 transition-all hover:border-indigo-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-6 bg-primary rounded-full" />
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-black">
              New Entry
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-[2]">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Medicine name (e.g. Panadol)"
                className="w-full p-2 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all text-slate-800 font-medium placeholder:text-slate-300 shadow-inner"
              />
            </div>

            <div className="flex flex-1 gap-3">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="flex-1 p-2 bg-slate-50 rounded-2xl border-1 border-gray-300 focus:border-primary focus:bg-white focus:outline-none transition-all text-slate-800 font-medium font-black appearance-none cursor-pointer shadow-inner"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAdd}
                disabled={loading}
                className="bg-primary text-white px-8 py-1 rounded-2xl text-xs font-black font-medium uppercase tracking-widest hover:bg-slate-900 shadow-lg shadow-indigo-100 disabled:opacity-50 transition-all active:scale-95"
              >
                {loading ? "..." : "Add"}
              </button>
            </div>
          </div>
          {error && (
            <p className="text-rose-500 text-[10px] mt-4 font-black uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-lg inline-block">
              {error}
            </p>
          )}
        </div>

        {/* List Section */}
        <div className="bg-white rounded-[2.5rem] border border-blue-800 shadow-2xl shadow-slate-200/40 overflow-hidden">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-2 bg-slate-50/50 px-8 py-5 border-b border-slate-100">
            <div className="text-[13px] font-black text-slate-400 uppercase tracking-widest text-left">
              Medicine Name
            </div>
            <div className="text-[13px] font-black text-slate-400 uppercase tracking-widest text-right">
              Formulation
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {medicines.map((m) => (
              <div
                key={m.id}
                className="group px-8 py-5 flex items-center justify-between md:grid md:grid-cols-2 hover:bg-indigo-50/30 transition-all duration-300"
              >
                <div>
                  <p className="text-slate-800 font-black text-base font-medium group-hover:text-primary transition-colors">
                    {m.name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-white border border-slate-100 text-slate-500 text-[9px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest shadow-sm group-hover:border-indigo-200 group-hover:text-primary transition-all">
                    {m.type}
                  </span>
                </div>
              </div>
            ))}

            {medicines.length === 0 && (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
                  <span className="text-2xl text-slate-300">?</span>
                </div>
                <p className="text-sm font-black text-slate-300 uppercase tracking-widest">
                  Inventory Empty
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
