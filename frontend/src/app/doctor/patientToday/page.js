"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function getPKTToday() {
  const now = new Date();
  const pkt = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Karachi" }),
  );
  const y = pkt.getFullYear();
  const m = String(pkt.getMonth() + 1).padStart(2, "0");
  const d = String(pkt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const todayStr = getPKTToday();

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-PK", {
    timeZone: "Asia/Karachi",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function DoctorPatients() {
  const [activeTab, setActiveTab] = useState("Waiting");
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [prescriptionMap, setPrescriptionMap] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch("/api/patients");
        const data = await res.json();
        if (!Array.isArray(data)) return;

        const todayPatients = data.filter((p) => {
          const pd = new Date(p.date).toLocaleDateString("en-CA", {
            timeZone: "Asia/Karachi",
          });
          return pd === todayStr && p.status !== "No-Show";
        });

        setPatients(todayPatients);

        // Fetch prescription history for all today's patients in parallel
        const entries = await Promise.all(
          todayPatients.map(async (p) => {
            try {
              const r = await fetch(`/api/prescriptions/patient/${p.id}`);
              const rxs = await r.json();
              return [p.id, Array.isArray(rxs) ? rxs : []];
            } catch {
              return [p.id, []];
            }
          }),
        );
        setPrescriptionMap(Object.fromEntries(entries));
      } catch {
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const tabFiltered = patients.filter((p) => p.status === activeTab);
  const filtered = tabFiltered.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) || p.cnicOrMrNo.toLowerCase().includes(q)
    );
  });

  const waiting = patients.filter((p) => p.status === "Waiting").length;
  const checked = patients.filter((p) => p.status === "Checked").length;

  const avatarColor = (name) => {
    const colors = [
      ["var(--color-background-info)", "var(--color-text-info)"],
      ["var(--color-background-success)", "var(--color-text-success)"],
      ["var(--color-background-warning)", "var(--color-text-warning)"],
      ["#EDE9FE", "#5B21B6"],
      ["#FCE7F3", "#9D174D"],
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div className="min-h-screen bg-accent-soft p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">
              Doctor Dashboard
            </h1>

            <p className="text-sm text-[var(--secondary)] mt-1">
              Today's patients —{" "}
              {new Date().toLocaleDateString("en-PK", {
                timeZone: "Asia/Karachi",
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push("/patients/add")}
              className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all"
            >
              + New Patient
            </button>
            <button
              onClick={() => router.push("/appointments")}
              className="px-5 py-2.5 bg-white border border-borderSoft text-slate-600 rounded-xl font-bold text-sm hover:border-primary hover:text-primary transition-all"
            >
              Appointments
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            [
              "Waiting",
              waiting,
              "text-amber-800 bg-amber-100 border-amber-700",
            ],
            [
              "Checked",
              checked,
              "text-emerald-800 bg-emerald-100 border-emerald-700",
            ],
            [
              "Total today",
              patients.length,
              "text-indigo-800 bg-indigo-100 border-indigo-700",
            ],
          ].map(([label, val, cls]) => (
            <div
              key={label}
              // Added ${cls.split(" ").slice(1).join(" ")} to apply the bg and border colors to the div
              className={`bg-white rounded-2xl border p-4 ${cls.split(" ").slice(1).join(" ")}`}
            >
              <p className="text-[10px] font-black uppercase tracking-wider opacity-70 mb-1">
                {label}
              </p>
              <p className={`text-3xl font-black ${cls.split(" ")[0]}`}>
                {val}
              </p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name or CNIC..."
            className="flex-1 p-3 bg-white border border-blue-800 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />

          <div className="flex bg-gray-light border border-blue-800 rounded-2xl p-2">
            {["Waiting", "Checked"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--secondary)] hover:text-[var(--primary)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Patient list */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading patients...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">
              No {activeTab.toLowerCase()} patients today
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((patient) => {
              const rxHistory = prescriptionMap[patient.id] ?? [];
              const isReturning = rxHistory.length > 0;
              const [bg, fg] = avatarColor(patient.name);

              return (
                <div
                  key={patient.id}
                  className="group bg-white rounded-[2.5rem] border border-slate-50 hover:border-indigo-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 overflow-hidden"
                >
                  <div className="p-7">
                    {/* ── TOP SECTION ── */}
                    <div className="flex items-start gap-5">
                      <div
                        style={{ background: bg, color: fg }}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-110 transition-transform duration-500 flex-shrink-0"
                      >
                        {patient.name[0]}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-black text-slate-900 text-xl tracking-tight truncate">
                            {patient.name}
                          </p>
                          <span
                            className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                              patient.status === "Waiting"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {patient.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                          <p className="text-xs font-bold text-slate-500">
                            {patient.age} Yrs
                          </p>
                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                          <p className="text-xs font-bold text-slate-500">
                            {patient.relativeType}: {patient.relativeName}
                          </p>
                        </div>

                        <div className="inline-block mt-2 px-2 py-0.5 bg-slate-50 rounded-md">
                          <p className="text-[15px] font-bold text-indigo-800 font-mono tracking-tighter uppercase">
                            ID: {patient.cnicOrMrNo}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ── RETURN VISIT BADGES ── */}
                    {isReturning && (
                      <div className="mt-6 flex flex-col gap-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Recent Timeline
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {rxHistory.slice(0, 3).map((rx) => (
                            <button
                              key={rx.id}
                              onClick={() =>
                                router.push(
                                  `/doctor/view-prescription/${patient.id}`,
                                )
                              }
                              className="text-[10px] px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-500 font-bold hover:border-indigo-600 hover:text-indigo-600 hover:shadow-md transition-all"
                            >
                              {formatDate(rx.createdAt)}
                            </button>
                          ))}
                          {rxHistory.length > 3 && (
                            <span className="text-[10px] font-black text-slate-300">
                              +{rxHistory.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── FOOTER ACTIONS ── */}
                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                      <div className="flex gap-8">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">
                            Queue Date
                          </p>
                          <p className="text-xs font-black text-slate-700">
                            {formatDate(patient.date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">
                            Status
                          </p>
                          <p
                            className={`text-xs font-black ${isReturning ? "text-indigo-600" : "text-slate-400"}`}
                          >
                            {isReturning
                              ? `${rxHistory.length} Visits`
                              : "New Patient"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {patient.status === "Waiting" ? (
                          <button
                            onClick={() =>
                              router.push(`/doctor/prescription/${patient.id}`)
                            }
                            className="px-6 py-3 text-[11px] font-black text-white bg-primary rounded-2xl shadow-lg shadow-indigo-100 hover:bg-slate-900 hover:-translate-y-0.5 transition-all"
                          >
                            START CONSULT
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              router.push(
                                `/doctor/view-prescription/${patient.id}`,
                              )
                            }
                            className="px-6 py-3 text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-2xl hover:bg-emerald-100 transition-all"
                          >
                            VIEW HISTORY
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
