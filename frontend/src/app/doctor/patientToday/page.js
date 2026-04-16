"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DoctorPatients() {
  const [activeTab, setActiveTab] = useState("Waiting");
  const [search, setSearch] = useState("");

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Step 1: filter by tab
  const tabFiltered = patients.filter((p) => p.status === activeTab);

  // Step 2: filter by search (name or CNIC/MR)
  const filteredPatients = tabFiltered.filter((p) => {
    const query = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.cnicOrMrNo.toLowerCase().includes(query)
    );
  });

  //useeffect to fetch all patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/patients");
        const data = await res.json();

        if (Array.isArray(data)) {
          setPatients(data);
        } else {
          console.error("Unexpected response:", data);
          setPatients([]);
        }
      } catch (err) {
        console.error("Error fetching patients:", err);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <h1 className="text-4xl font-light tracking-tight text-primary mb-8 text-center">
        Doctor Dashboard
      </h1>

      {/* SEARCH BAR */}
      <div className="flex justify-center mb-5">
        <input
          type="text"
          placeholder="Search by name or CNIC/MR No..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-gray-800 w-full max-w-md p-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-400 transition-all"
        />
      </div>

      {/* TABS */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab("Waiting")}
          className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
            activeTab === "Waiting"
              ? "bg-primary text-white shadow-md"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Waiting
        </button>

        <button
          onClick={() => setActiveTab("Checked")}
          className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
            activeTab === "Checked"
              ? "bg-secondary text-white shadow-md"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Checked
        </button>
      </div>

      {/* PATIENT LIST */}
      <div className="grid gap-4 max-w-5xl mx-auto mt-8">
        {loading ? (
          <p className="text-center text-gray-500 italic py-12">
            Loading patients...
          </p>
        ) : filteredPatients.length === 0 ? (
          <p className="text-center text-gray-500 italic py-12">
            No patients found
          </p>
        ) : (
          filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className={`bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] flex justify-between items-center border-l-4 ${
                patient.status === "Waiting"
                  ? "border-l-primary"
                  : "border-l-secondary"
              }`}
            >
              {/* LEFT INFO */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {patient.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Age: {patient.age} | {patient.relativeType}{" "}
                  {patient.relativeName}
                </p>
                <p className="text-sm text-gray-600">
                  CNIC/MR No: {patient.cnicOrMrNo}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Date: {new Date(patient.date).toLocaleDateString()}
                </p>
              </div>

              {/* STATUS */}
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
                  patient.status === "Waiting"
                    ? "bg-amber-100 text-amber-700 border-amber-200"
                    : "bg-emerald-100 text-emerald-700 border-emerald-200"
                }`}
              >
                {patient.status}
              </span>
              <button
                onClick={() =>
                  router.push(`/doctor/prescription/${patient.id}`)
                }
                className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-light transition-all"
              >
                + Prescription
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
