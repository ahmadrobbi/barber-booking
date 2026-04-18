"use client";

import { useState } from "react";
import { registerUser } from "@/app/actions/auth";
import { getAvailableIndustries, INDUSTRIES, type IndustryKey } from "@/lib/industries";
import type { AuthFormState } from "@/lib/auth-form-state";

type Step = "account" | "industry" | "business" | "confirm";

export function RegistrationWizard() {
  const [currentStep, setCurrentStep] = useState<Step>("account");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<AuthFormState>();

  // Form data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [no_hp, setNoHp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryKey>("barbershop");
  const [businessName, setBusinessName] = useState("");

  const industries = getAvailableIndustries();
  const industryData = INDUSTRIES[selectedIndustry];

  const validateAccount = () => {
    if (!name || name.length < 2) {
      setFormState({ message: "Nama minimal 2 karakter." });
      return false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormState({ message: "Format email belum valid." });
      return false;
    }
    if (!no_hp || no_hp.length < 8) {
      setFormState({ message: "No HP wajib diisi dan minimal 8 digit." });
      return false;
    }
    if (!password || password.length < 6) {
      setFormState({ message: "Password minimal 6 karakter." });
      return false;
    }
    if (password !== confirmPassword) {
      setFormState({ message: "Password tidak cocok." });
      return false;
    }
    return true;
  };

  const validateBusiness = () => {
    if (!businessName || businessName.length < 2) {
      setFormState({ message: "Nama bisnis minimal 2 karakter." });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === "account") {
      if (validateAccount()) {
        setFormState(undefined);
        setCurrentStep("industry");
      }
    } else if (currentStep === "industry") {
      setCurrentStep("business");
    } else if (currentStep === "business") {
      if (validateBusiness()) {
        setFormState(undefined);
        setCurrentStep("confirm");
      }
    }
  };

  const handleBack = () => {
    setFormState(undefined);
    if (currentStep === "industry") setCurrentStep("account");
    else if (currentStep === "business") setCurrentStep("industry");
    else if (currentStep === "confirm") setCurrentStep("business");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateBusiness()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("no_hp", no_hp);
      formData.append("password", password);
      formData.append("industry", selectedIndustry);
      formData.append("business_name", businessName);

      const result = await registerUser(undefined, formData);

      if (result?.message) {
        setFormState(result);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case "account":
        return 25;
      case "industry":
        return 50;
      case "business":
        return 75;
      case "confirm":
        return 100;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-slate-500 mb-2 font-medium">
          <span className={currentStep === "account" ? "text-blue-600" : ""}>Akun</span>
          <span className={currentStep === "industry" ? "text-blue-600" : ""}>Industri</span>
          <span className={currentStep === "business" ? "text-blue-600" : ""}>Bisnis</span>
          <span className={currentStep === "confirm" ? "text-blue-600" : ""}>Konfirmasi</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getStepProgress()}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Step */}
        {currentStep === "account" && (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Nama Lengkap
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="no_hp" className="block text-sm font-medium text-slate-700 mb-2">
                Nomor WhatsApp
              </label>
              <input
                id="no_hp"
                type="tel"
                value={no_hp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="081234567890"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* Industry Step */}
        {currentStep === "industry" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Pilih Jenis Industri</h2>
            <p className="text-sm text-slate-600">Sesuaikan platform dengan kebutuhan bisnis Anda</p>

            <div className="grid grid-cols-1 gap-3">
              {industries.map((ind) => (
                <button
                  key={ind.key}
                  type="button"
                  onClick={() => setSelectedIndustry(ind.key as IndustryKey)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedIndustry === ind.key
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="font-semibold text-slate-900">{ind.name}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {INDUSTRIES[ind.key].description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Business Step */}
        {currentStep === "business" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Info Bisnis Anda</h2>
            <p className="text-sm text-slate-600">Isi informasi bisnis yang akan ditampilkan di dashboard</p>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm">
                <span className="font-medium text-slate-700">Industri: </span>
                <span className="text-slate-600">{industryData.name}</span>
              </div>
            </div>

            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-slate-700 mb-2">
                Nama Bisnis / Brand / Merchant
              </label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Contoh: Barokah Barbershop"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <p className="text-xs text-slate-500 mt-2">
                Nama ini akan ditampilkan sebagai judul di dashboard dan halaman booking Anda
              </p>
            </div>
          </div>
        )}

        {/* Confirm Step */}
        {currentStep === "confirm" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Konfirmasi Data Anda</h2>

            <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-slate-600">Nama:</span>
                <span className="font-medium text-slate-900">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Email:</span>
                <span className="font-medium text-slate-900">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">WhatsApp:</span>
                <span className="font-medium text-slate-900">{no_hp}</span>
              </div>
              <div className="h-px bg-slate-200 my-2"></div>
              <div className="flex justify-between">
                <span className="text-slate-600">Industri:</span>
                <span className="font-medium text-slate-900">{industryData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Nama Bisnis:</span>
                <span className="font-medium text-slate-900">{businessName}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Anda dapat mengubah informasi ini di halaman profile nanti. Klik "Daftar" untuk melanjutkan.
            </p>
          </div>
        )}

        {/* Error Message */}
        {formState?.message && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{formState.message}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          {currentStep !== "account" && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Kembali
            </button>
          )}

          {currentStep !== "confirm" ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Lanjut
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? "Mendaftar..." : "Daftar"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
