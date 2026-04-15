"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAvailableIndustries } from "@/lib/industry-config";
import { INDUSTRIES, type IndustryKey } from "@/lib/industries";

type OnboardingStep = "welcome" | "industry" | "business" | "services" | "complete";

type Service = {
  code: string;
  name: string;
  price: number;
  description: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryKey>("barbershop");
  const [businessName, setBusinessName] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const industries = getAvailableIndustries();
  const industryData = INDUSTRIES[selectedIndustry];

  const handleNext = () => {
    if (currentStep === "welcome") setCurrentStep("industry");
    else if (currentStep === "industry") setCurrentStep("business");
    else if (currentStep === "business") setCurrentStep("services");
    else if (currentStep === "services") handleComplete();
  };

  const handleBack = () => {
    if (currentStep === "industry") setCurrentStep("welcome");
    else if (currentStep === "business") setCurrentStep("industry");
    else if (currentStep === "services") setCurrentStep("business");
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: selectedIndustry,
          businessName,
          services,
        }),
      });

      if (response.ok) {
        setCurrentStep("complete");
        setTimeout(() => router.push("/admin"), 2000);
      } else {
        alert("Gagal menyimpan pengaturan. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addService = () => {
    setServices([...services, { code: "", name: "", price: 0, description: "" }]);
  };

  const updateService = (index: number, field: keyof Service, value: string | number) => {
    const updatedServices = [...services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setServices(updatedServices);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  if (currentStep === "complete") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-stone-100">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Setup Selesai!</h1>
          <p className="text-stone-600 mb-6">Bisnis Anda sudah siap menerima booking. Mengalihkan ke dashboard...</p>
          <div className="w-full bg-stone-200 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full animate-pulse" style={{ width: "100%" }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-stone-500 mb-2">
            <span className={currentStep === "welcome" ? "text-amber-600 font-medium" : ""}>Selamat Datang</span>
            <span className={currentStep === "industry" ? "text-amber-600 font-medium" : ""}>Pilih Industri</span>
            <span className={currentStep === "business" ? "text-amber-600 font-medium" : ""}>Info Bisnis</span>
            <span className={currentStep === "services" ? "text-amber-600 font-medium" : ""}>Layanan</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-2">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: currentStep === "welcome" ? "25%" :
                       currentStep === "industry" ? "50%" :
                       currentStep === "business" ? "75%" : "100%"
              }}
            ></div>
          </div>
        </div>

        {/* Welcome Step */}
        {currentStep === "welcome" && (
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-stone-900 mb-4">Selamat Datang di Booking Platform</h1>
              <p className="text-stone-600 leading-relaxed">
                Platform booking universal untuk berbagai jenis bisnis. Kami akan membantu Anda setup dalam beberapa langkah sederhana.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">Pilih Industri</h3>
                <p className="text-sm text-stone-600">Tentukan jenis bisnis Anda</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">Info Bisnis</h3>
                <p className="text-sm text-stone-600">Nama dan branding bisnis</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">Layanan</h3>
                <p className="text-sm text-stone-600">Konfigurasi layanan yang ditawarkan</p>
              </div>
            </div>
          </div>
        )}

        {/* Industry Selection */}
        {currentStep === "industry" && (
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-stone-900 mb-6">Pilih Industri Bisnis Anda</h2>
            <div className="grid gap-4">
              {industries.map((industry) => (
                <label
                  key={industry.key}
                  className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition ${
                    selectedIndustry === industry.key
                      ? "border-amber-500 bg-amber-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="industry"
                    value={industry.key}
                    checked={selectedIndustry === industry.key}
                    onChange={(e) => setSelectedIndustry(e.target.value as IndustryKey)}
                    className="mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-stone-900">{industry.name}</h3>
                    <p className="text-sm text-stone-600 mt-1">
                      {INDUSTRIES[industry.key].description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Business Info */}
        {currentStep === "business" && (
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-stone-900 mb-6">Informasi Bisnis</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Nama Bisnis
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={`Contoh: ${industryData.name} Barokah`}
                  className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:border-amber-500 focus:outline-none"
                  required
                />
                <p className="text-sm text-stone-500 mt-2">
                  Nama bisnis akan ditampilkan di header dashboard dan halaman booking publik.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Services Configuration */}
        {currentStep === "services" && (
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-stone-900 mb-6">Konfigurasi Layanan</h2>
            <p className="text-stone-600 mb-6">
              Tambahkan layanan yang ditawarkan oleh bisnis Anda. Anda bisa mengubah ini nanti dari menu Settings.
            </p>

            <div className="space-y-4 mb-6">
              {services.map((service, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Kode Layanan
                    </label>
                    <input
                      type="text"
                      value={service.code}
                      onChange={(e) => updateService(index, "code", e.target.value)}
                      placeholder="cukur"
                      className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Nama Layanan
                    </label>
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) => updateService(index, "name", e.target.value)}
                      placeholder="Cukur Rambut"
                      className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Harga (Rp)
                    </label>
                    <input
                      type="number"
                      value={service.price}
                      onChange={(e) => updateService(index, "price", Number(e.target.value))}
                      placeholder="50000"
                      className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => removeService(index)}
                    className="px-4 py-3 text-red-600 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addService}
              className="w-full py-3 border-2 border-dashed border-stone-300 rounded-2xl text-stone-600 hover:border-amber-500 hover:text-amber-600 transition"
            >
              + Tambah Layanan
            </button>

            {services.length === 0 && (
              <div className="text-center py-8 text-stone-500">
                <p>Belum ada layanan. Klik tombol di atas untuk menambah layanan pertama.</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {currentStep !== "welcome" && (
            <button
              onClick={handleBack}
              className="px-6 py-3 border border-stone-300 rounded-2xl text-stone-700 hover:border-stone-400 transition"
            >
              Kembali
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={
              (currentStep === "business" && !businessName.trim()) ||
              (currentStep === "services" && services.length === 0) ||
              isSubmitting
            }
            className="ml-auto px-6 py-3 bg-amber-500 text-white rounded-2xl font-semibold hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Menyimpan..." :
             currentStep === "services" ? "Selesai Setup" : "Lanjut"}
          </button>
        </div>
      </div>
    </div>
  );
}