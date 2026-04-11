"use client";
import { useState } from "react";

export default function AddPatient() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    relativeType: "",
    relativeName: "",
    cnicOrMrNo: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData); // later send to backend
    alert("Patient added (UI only for now)");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-amber-400 p-8 rounded-2xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Add New Patient</h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
          required
        />

        <select
          name="relative_type"
          value={formData.relativeType}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
          required
        >
          <option value="S/O">S/O</option>
          <option value="D/O">D/O</option>
          <option value="W/O">W/O</option>
        </select>

        <input
          type="text"
          name="relativeName"
          placeholder="Relative Name"
          value={formData.relativeName}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
          required
        />

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
          required
        />

        <input
          type="text"
          name="cnicOrMrNo"
          placeholder="CNIC or MR No"
          value={formData.cnicOrMrNo}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
          required
        />

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Add Patient
        </button>
      </form>
    </div>
  );
}
