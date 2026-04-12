"use client";
import { useState } from "react";

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
  cnicOrMrNo: "",
  date: today,
};

export default function AddPatient() {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
    const isCNIC = /^\d{5}-\d{7}-\d$/.test(cnic);
    const isMR = /^[A-Za-z0-9\-]{3,20}$/.test(cnic);
    if (!isCNIC && !isMR)
      e.cnicOrMrNo = "Enter a valid CNIC (42101-1234567-1) or MR No.";

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
        className="bg-white rounded-3xl shadow-xl shadow-gray-200 p-10 w-full max-w-md border border-gray-100"
      >
        <h2 className="text-3xl font-light tracking-tight text-primary mb-8 text-center">
          Add new patient
        </h2>

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
        {field("CNIC / MR No", "cnicOrMrNo", "text", {
          placeholder: "42101-1234567-1 or MR No",
          maxLength: 20,
        })}

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
      </form>
    </div>
  );
}
