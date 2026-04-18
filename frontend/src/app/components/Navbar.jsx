"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRound, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { name: "Appointments", href: "/appointments" },
    { name: "Medicine", href: "/medicines/add" },
    { name: "Add Patient", href: "/patients/add" },
    { name: "Doctor Dashboard", href: "/doctor/patientToday" },
  ];

  return (
    <nav className="sticky top-0 z-50 px-6 md:px-20 py-5 bg-background glass-panel border-b border-gray-mid shadow-sm print:hidden">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white font-black shadow-indigo group-hover:rotate-12 transition-transform">
            B
          </div>
          <span className="text-lg md:text-2xl font-black tracking-tighter text-foreground">
            Bakhtbari Eye Clinic
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-3">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`px-2 py-2 rounded-full text-[13px] font-medium transition-all duration-200
  ${
    pathname === link.href
      ? "border border-sky-800 text-black shadow-sm bg-blue-50"
      : "text-secondary hover:bg-primary/10 hover:text-primary"
  }`}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right side doctor info */}
        <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-gray-mid">
          <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
            <UserRound size={18} className="text-primary" strokeWidth={2.5} />
          </div>

          <div className="flex flex-col">
            <span className="text-[13px] font-black text-foreground leading-none">
              Dr. Irshad Ahmed Sheikh
            </span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-tighter mt-1">
              Ophthalmologist
            </span>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className="lg:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="lg:hidden mt-6 flex flex-col gap-4 border-t pt-4">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`px-2 py-2 rounded-full text-[13px] font-medium transition-all duration-200
  ${
    pathname === link.href
      ? "border border-sky-800 text-black shadow-sm bg-blue-50"
      : "text-secondary hover:bg-primary/10 hover:text-primary"
  }`}
            >
              {link.name}
            </a>
          ))}

          {/* Doctor Info Mobile */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
              <UserRound size={18} className="text-primary" />
            </div>

            <div className="flex flex-col">
              <span className="text-[13px] font-black">
                Dr. Irshad Ahmed Sheikh
              </span>
              <span className="text-[10px] font-bold text-primary uppercase">
                Ophthalmologist
              </span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
