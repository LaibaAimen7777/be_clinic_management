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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);

    const res = await fetch("/api/patients", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("Patient added successfully!");
      setFormData({
        name: "",
        age: "",
        relativeType: "",
        relativeName: "",
        cnicOrMrNo: "",
        date: new Date().toISOString().split("T")[0],
      });
    } else {
      alert("Error adding patient");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-xl shadow-gray-200 p-10 w-full max-w-md border border-gray-100"
      >
        <h2 className="text-3xl font-medium tracking-tight text-primary mb-8 text-center">
          Add New Patient
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-800 transition-all"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Relative Type
          </label>
          <select
            name="relativeType"
            value={formData.relativeType}
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-800 appearance-none cursor-pointer"
            required
          >
            <option value="">Select</option>
            <option value="S/O">S/O (Son of)</option>
            <option value="D/O">D/O (Daughter of)</option>
            <option value="W/O">W/O (Wife of)</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Relative Name
          </label>
          <input
            type="text"
            name="relativeName"
            placeholder="Relative Name"
            value={formData.relativeName}
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-800 transition-all"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age
          </label>
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-800 transition-all"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CNIC or MR No
          </label>
          <input
            type="text"
            name="cnicOrMrNo"
            placeholder="CNIC or MR No"
            value={formData.cnicOrMrNo}
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-800 transition-all"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-800 transition-all"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg hover:bg-primary-light transition-all duration-200"
        >
          Add Patient
        </button>
      </form>
    </div>
  );
}
