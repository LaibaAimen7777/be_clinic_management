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
    const res = await fetch("/api/medicines?q=");
    const data = await res.json();
    if (Array.isArray(data)) setMedicines(data);
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-light text-gray-800 mb-6">
          Medicines Database
        </h1>

        {/* Add Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow p-5 mb-6">
          <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-4">
            Add New Medicine
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Medicine name"
              className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 text-sm"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 text-sm"
            >
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              disabled={loading}
              className="bg-primary text-white px-5 py-3 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-60"
            >
              Add
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 text-gray-400 font-medium">
                  Name
                </th>
                <th className="text-left p-4 text-gray-400 font-medium">
                  Type
                </th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="p-4 text-gray-800">{m.name}</td>
                  <td className="p-4">
                    <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">
                      {m.type}
                    </span>
                  </td>
                </tr>
              ))}
              {medicines.length === 0 && (
                <tr>
                  <td colSpan={2} className="p-6 text-center text-gray-400">
                    No medicines yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
