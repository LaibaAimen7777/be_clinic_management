"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ViewPrescription() {
  const { id } = useParams();
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`/api/prescriptions/patient/${id}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPrescriptions(data);
          setPatient(data[0].patient);
          setSelected(data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [id]);

  if (loading)
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto mb-3" />
        <p className="text-sm text-gray-400">Loading patient...</p>
      </div>
    );
  if (!patient)
    return (
      <p className="text-center mt-20 text-gray-500">No prescriptions found.</p>
    );

  const dateStr = (d) =>
    new Date(d).toLocaleDateString("en-PK", {
      timeZone: "Asia/Karachi",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const meds = selected?.medicines ?? [];
  const exam = selected ?? {};

  return (
    <>
      {/* SCREEN */}
      <div className="min-h-screen bg-accent-soft p-4 md:p-8 print:hidden text-slate-900">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="px-5 py-2.5 bg-white border border-borderSoft text-slate-600 rounded-xl font-bold text-sm hover:border-primary hover:text-primary transition-all"
            >
              Back
            </button>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Prescriptions
            </h1>
            <button
              onClick={() => window.print()}
              className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
            >
              Print
            </button>
          </div>

          {/* Patient Info */}
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
            </div>
          </div>

          {/* Prescription selector if multiple */}
          {prescriptions.length > 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow p-5">
              <h2 className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                Select Prescription
              </h2>
              <div className="flex flex-wrap gap-2">
                {prescriptions.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                      selected?.id === p.id
                        ? "bg-primary text-white border-primary"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {dateStr(p.createdAt)} {i === 0 ? "(Latest)" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Eye Exam */}
          {(exam.vaRight ||
            exam.vaLeft ||
            exam.iopRight ||
            exam.iopLeft ||
            exam.atRight ||
            exam.atLeft ||
            exam.antSeg ||
            exam.fundus) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow p-5">
              <h2 className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4">
                Eye Examination
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-5   00 text-xs">
                    <th className="text-left py-2">Finding</th>
                    <th className="text-center py-2">Right (OD)</th>
                    <th className="text-center py-2">Left (OS)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["VA", exam.vaRight, exam.vaLeft],
                    ["IOP", exam.iopRight, exam.iopLeft],
                    ["AT", exam.atRight, exam.atLeft],
                  ].map(([label, r, l]) =>
                    r || l ? (
                      <tr key={label} className="border-b border-gray-300">
                        <td className="py-2 font-medium text-gray-600">
                          {label}
                        </td>
                        <td className="py-2 text-center text-gray-800">
                          {r || "—"}
                        </td>
                        <td className="py-2 text-center text-gray-800">
                          {l || "—"}
                        </td>
                      </tr>
                    ) : null,
                  )}
                  {exam.antSeg && (
                    <tr className="border-b border-gray-50">
                      <td className="py-2 font-medium text-gray-600">
                        Ant. Seg
                      </td>
                      <td colSpan={2} className="py-2 text-gray-800">
                        {exam.antSeg}
                      </td>
                    </tr>
                  )}
                  {exam.fundus && (
                    <tr>
                      <td className="py-2 font-medium text-gray-600">Fundus</td>
                      <td colSpan={2} className="py-2 text-gray-800">
                        {exam.fundus}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Systemic */}
          {(exam.dm || exam.htn || exam.ihd || exam.asthma) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow p-5">
              <h2 className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4">
                Systemic History
              </h2>
              <div className="flex gap-3 flex-wrap">
                {[
                  ["dm", "DM"],
                  ["htn", "HTN"],
                  ["ihd", "IHD"],
                  ["asthma", "Asthma"],
                ]
                  .filter(([k]) => exam[k])
                  .map(([, l]) => (
                    <span
                      key={l}
                      className="bg-red-50 text-red-600 border border-red-100 text-xs px-3 py-1 rounded-full"
                    >
                      {l}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Medicines */}
          {meds.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow p-5">
              <h2 className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4">
                Medicines
              </h2>
              <div className="space-y-2">
                {meds.map((m, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center border border-gray-100 rounded-xl p-3 bg-gray-50 text-sm"
                  >
                    <div>
                      <span className="font-medium text-gray-800">
                        {m.name}
                      </span>
                      <span className="ml-2 text-xs text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">
                        {m.type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      <p>
                        {m.dose} · {m.frequency}
                      </p>
                      <p>{m.route}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diagnosis & Treatment */}
          {(exam.diagnosis || exam.treatment) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow p-5 space-y-3">
              {exam.diagnosis && (
                <div>
                  <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                    Diagnosis
                  </h2>
                  <p className="text-sm text-gray-800">{exam.diagnosis}</p>
                </div>
              )}
              {exam.treatment && (
                <div>
                  <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                    Treatment Plan
                  </h2>
                  <p className="text-sm text-gray-800">{exam.treatment}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PRINT */}
      <div className="hidden print:block text-black bg-white w-full">
        <style>{`
          @media print { @page { size: A5; margin: 8mm; } body { margin: 0; } }
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
            Date: <b>{dateStr(selected?.createdAt)}</b>
          </span>
          <span>
            MR/CNIC: <b>{patient.cnicOrMrNo}</b>
          </span>
          <span style={{ marginLeft: "auto" }}>
            Age: <b>{patient.age}</b>
          </span>
        </div>

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

        {(exam.dm || exam.htn || exam.ihd || exam.asthma) && (
          <p style={{ fontSize: "9px", marginBottom: "8px" }}>
            <b>Systemic: </b>
            {[
              ["dm", "DM"],
              ["htn", "HTN"],
              ["ihd", "IHD"],
              ["asthma", "Asthma"],
            ]
              .filter(([k]) => exam[k])
              .map(([, l]) => l)
              .join(", ")}
          </p>
        )}

        {meds.length > 0 && (
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
              {meds.map((m, i) => (
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

        {exam.diagnosis && (
          <div style={{ fontSize: "9px", marginBottom: "6px" }}>
            <b>Diagnosis: </b>
            {exam.diagnosis}
          </div>
        )}
        {exam.treatment && (
          <div style={{ fontSize: "9px", marginBottom: "8px" }}>
            <b>Treatment: </b>
            {exam.treatment}
          </div>
        )}

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
