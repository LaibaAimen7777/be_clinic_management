import Image from "next/image";

export default function Home() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-extrabold">Bakhbari Eye Clinic</h1>
      <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
        Add Patient
      </button>
    </div>
  );
}
