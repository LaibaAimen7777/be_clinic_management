"use client";
import { useState, useEffect } from "react";

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
      } else {
        const d = await res.json();
        setError(d.error ?? "Failed to add.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
          Medicines Database
        </h1>

        {/* Add Form - Improved Stack for Mobile */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 mb-6">
          <h2 className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-4">
            Add New Medicine
          </h2>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Medicine name"
              className="flex-1 p-4 md:p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-base md:text-sm"
            />
            <div className="flex gap-2">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="flex-1 md:flex-none p-4 md:p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-base md:text-sm appearance-none"
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
                className="bg-blue-600 text-white px-8 md:px-5 py-4 md:py-3 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {loading ? "..." : "Add"}
              </button>
            </div>
          </div>
          {error && (
            <p className="text-red-500 text-xs mt-3 font-medium">{error}</p>
          )}
        </div>

        {/* List Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Desktop Table Header - Hidden on Mobile */}
          <div className="hidden md:grid grid-cols-2 bg-gray-50 border-b border-gray-100 p-4 text-gray-400 font-medium text-xs uppercase tracking-wider">
            <div>Name</div>
            <div>Type</div>
          </div>

          <div className="divide-y divide-gray-50">
            {medicines.map((m) => (
              <div
                key={m.id}
                className="p-4 flex items-center justify-between md:grid md:grid-cols-2 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-gray-800 font-medium text-base md:text-sm">
                    {m.name}
                  </p>
                </div>
                <div className="md:block">
                  <span className="bg-blue-50 text-blue-600 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {m.type}
                  </span>
                </div>
              </div>
            ))}

            {medicines.length === 0 && (
              <div className="p-10 text-center text-gray-400 text-sm">
                No medicines yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
