"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { UserRound, Menu, X } from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-accent-soft font-sans text-foreground selection:bg-primary-light selection:text-white overflow-x-hidden">
      {/* ── HERO SECTION ── */}
      <section className="relative px-6 md:px-20 pt-16 pb-24">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          {/* Text Side */}
          <div className="flex-1 text-left z-10">
            <div className="inline-block mb-6 px-4 py-2 bg-gray-mid rounded-full border border-gray-mid">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                ✨ Trusted Ophthalmic Care
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-foreground leading-[1] tracking-tight mb-8">
              Crystal Clear <br />
              <span className="text-primary">Vision For Life</span>
            </h1>
            <p className="text-secondary font-medium text-lg mb-10 max-w-lg leading-relaxed">
              Experience specialized eye treatments with advanced technology and
              compassionate expert care.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => router.push("/patients/add")}
                className="bg-primary text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-indigo hover:-translate-y-1 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Image Side (No border, transparent BG optimized) */}
          <div className="flex-1 relative flex justify-center items-center">
            {/* Soft Ambient Glow behind the transparent image */}
            <div className="absolute w-72 h-72 bg-primary-light rounded-full blur-[120px] opacity-20 -z-10 animate-pulse" />

            <img
              src="/images/landImg4.png"
              alt="Medical Professional"
              className="w-full h-auto max-w-[550px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
