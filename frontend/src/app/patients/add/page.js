"use client";
import { useState } from "react";
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
      const validFormat = /^\d{5}-\d{7}-\d$/.test(cnic);
      if (!validFormat || isAllSame) {
        e.cnicOrMrNo = "Enter a valid CNIC format: 42101-1234567-1";
      }
    } else {
      const validMR = /^[A-Za-z0-9\-]{3,20}$/.test(cnic) && !isAllSame;
      if (!validMR) {
        e.cnicOrMrNo =
          "Enter a valid MR No (letters and numbers only, 3–20 chars).";
      }
    }

    if (!formData.date || formData.date > today)
      e.date = "Date cannot be in the future.";

    return e;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          ...formData,
          age: parseInt(formData.age),
          date: new Date(formData.date).toISOString(),
        }),
      });

      if (res.ok) {
        alert("Patient added successfully!");
        setFormData(initialForm);
        setErrors({});
      } else {
        const data = await res.json();
        alert("Error: " + (data?.error || "Something went wrong."));
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const field = (label, name, type = "text", extra = {}) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className={`w-full p-3 bg-gray-50 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-800 transition-all ${
          errors[name] ? "border-red-400" : "border-gray-200"
        }`}
        {...extra}
      />
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-xl shadow-gray-200 p-10 w-full max-w-md border border-gray-100 "
      >
        <div className="text-center mb-8">
          <h2 className="text-sm uppercase tracking-wider text-primary/60 font-semibold mb-2">
            Reception Desk
          </h2>
          <h2 className="text-3xl font-light tracking-tight text-gray-800">
            Add New Patient
          </h2>
          <div className="w-20 h-0.5 bg-primary/30 mx-auto mt-3 rounded-full"></div>
        </div>

        {field("Full name", "name", "text", {
          placeholder: "e.g. Ahmed Ali",
          maxLength: 100,
        })}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Relative type
          </label>
          <select
            name="relativeType"
            value={formData.relativeType}
            onChange={handleChange}
            className={`w-full p-3 bg-gray-50 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 appearance-none cursor-pointer ${
              errors.relativeType ? "border-red-400" : "border-gray-200"
            }`}
          >
            <option value="">Select</option>
            <option value="S/O">S/O (Son of)</option>
            <option value="D/O">D/O (Daughter of)</option>
            <option value="W/O">W/O (Wife of)</option>
          </select>
          {errors.relativeType && (
            <p className="text-red-500 text-xs mt-1">{errors.relativeType}</p>
          )}
        </div>

        {field("Relative name", "relativeName", "text", {
          placeholder: "e.g. Muhammad Khan",
          maxLength: 100,
        })}
        {field("Age", "age", "number", {
          placeholder: "1–120",
          min: 1,
          max: 120,
        })}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Type & Number
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              name="idType"
              value={formData.idType}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  idType: e.target.value,
                  cnicOrMrNo: "",
                });
                setErrors({ ...errors, cnicOrMrNo: "" });
              }}
              className="p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 sm:w-28 w-full"
            >
              <option value="CNIC">CNIC</option>
              <option value="MR">MR No</option>
            </select>
            <input
              type="text"
              name="cnicOrMrNo"
              value={formData.cnicOrMrNo}
              onChange={(e) => {
                let val = e.target.value;
                // auto-format CNIC as user types
                if (formData.idType === "CNIC") {
                  val = val.replace(/[^\d-]/g, "");
                  const digits = val.replace(/-/g, "");
                  if (digits.length <= 5) val = digits;
                  else if (digits.length <= 12)
                    val = digits.slice(0, 5) + "-" + digits.slice(5);
                  else
                    val =
                      digits.slice(0, 5) +
                      "-" +
                      digits.slice(5, 12) +
                      "-" +
                      digits.slice(12, 13);
                }
                setFormData({ ...formData, cnicOrMrNo: val });
                setErrors({ ...errors, cnicOrMrNo: "" });
              }}
              placeholder={
                formData.idType === "CNIC" ? "42101-1234567-1" : "e.g. MR-1042"
              }
              maxLength={formData.idType === "CNIC" ? 15 : 20}
              className={`flex-1 p-3 bg-gray-50 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 transition-all ${
                errors.cnicOrMrNo ? "border-red-400" : "border-gray-200"
              }`}
            />
          </div>
          {errors.cnicOrMrNo && (
            <p className="text-red-500 text-xs mt-1">{errors.cnicOrMrNo}</p>
          )}
          {formData.idType === "CNIC" && (
            <p className="text-gray-400 text-xs mt-1">
              Format: 42101-1234567-1 (dashes added automatically)
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            max={today}
            onChange={handleChange}
            className={`w-full p-3 bg-gray-50 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 transition-all ${
              errors.date ? "border-red-400" : "border-gray-200"
            }`}
          />
          {errors.date && (
            <p className="text-red-500 text-xs mt-1">{errors.date}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg hover:bg-primary-light transition-all duration-200 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Add patient"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/doctor/patientToday")}
          className="mt-4 w-full bg-white border-2 border-primary text-primary py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md hover:bg-primary hover:text-white transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          <span>Go to Doctor Dashboard</span>
          <svg
            className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
