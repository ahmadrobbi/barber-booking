"use client";

import { useState, useEffect } from "react";
import { getAvailableIndustries, INDUSTRIES, type IndustryKey } from "@/lib/industries";
import { fetchIndustryConfig, saveIndustryConfigAction } from "@/app/actions/industry-settings";
import type { IndustryConfig } from "@/lib/industry-config";

export default function IndustrySettings() {
  const [config, setConfig] = useState<IndustryConfig | null>(null);
  const [customization, setCustomization] = useState<Partial<Record<IndustryKey, { templates?: Record<string, string>; services?: Array<{ code: string; name: string; price: number; description: string; }>; }>>>({});
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryKey>("barbershop");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const industries = getAvailableIndustries();

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const cfg = await fetchIndustryConfig();
        setConfig(cfg);
        setSelectedIndustry(cfg.default);
        setCustomization(cfg.customization || {});
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load config");
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const industryBaseData = INDUSTRIES[selectedIndustry];
  const industryCustom = customization[selectedIndustry] ?? {};
  const editableServices = industryCustom.services ?? industryBaseData.services;
  const editableTemplates = {
    ...industryBaseData.templates,
    ...(industryCustom.templates ?? {}),
  };

  const handleToggleIndustry = (industry: IndustryKey) => {
    if (!config) return;

    const isEnabled = config.enabled.includes(industry);
    setConfig({
      ...config,
      enabled: isEnabled
        ? config.enabled.filter((i) => i !== industry)
        : [...config.enabled, industry],
    });
  };

  const handleSetDefault = (industry: IndustryKey) => {
    if (!config) return;
    setConfig({ ...config, default: industry });
  };

  const handleIndustryChange = (industry: IndustryKey) => {
    setSelectedIndustry(industry);
  };

  const handleServiceChange = (
    index: number,
    field: "name" | "price" | "description",
    value: string
  ) => {
    const nextServices = editableServices.map((service, idx) =>
      idx === index
        ? {
            ...service,
            [field]: field === "price" ? Number(value) : value,
          }
        : service
    );

    setCustomization({
      ...customization,
      [selectedIndustry]: {
        ...industryCustom,
        services: nextServices,
      },
    });
  };

  const handleTemplateChange = (key: string, value: string) => {
    setCustomization({
      ...customization,
      [selectedIndustry]: {
        ...industryCustom,
        templates: {
          ...(industryCustom.templates ?? {}),
          [key]: value,
        },
      },
    });
  };

  const handleSave = async () => {
    if (!config) return;

    try {
      setError(null);
      setSuccess(false);
      
      // Filter out undefined customization entries
      const filteredCustomization = Object.fromEntries(
        Object.entries(customization).filter(([_, value]) => value !== undefined)
      ) as Record<IndustryKey, { templates?: Record<string, string>; services?: Array<{ code: string; name: string; price: number; description: string; }>; }>;
      
      await saveIndustryConfigAction({
        ...config,
        customization: Object.keys(filteredCustomization).length > 0 ? filteredCustomization : undefined,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save config");
    }
  };

  if (loading) {
    return <div className="p-4">Loading industry settings...</div>;
  }

  if (!config) {
    return <div className="p-4 text-red-600">Failed to load configuration</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Industry Settings</h1>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-green-700">
          Settings saved successfully!
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Enabled Industries</h2>
          <p className="text-sm text-gray-600">Select which industries are available for booking.</p>
          <div className="space-y-3">
            {industries.map((industry) => (
              <label key={industry.key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.enabled.includes(industry.key)}
                  onChange={() => handleToggleIndustry(industry.key)}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600"
                />
                <span className="font-medium">{industry.name}</span>
                {config.default === industry.key && (
                  <span className="ml-2 rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                    Default
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Default Industry</h2>
          <p className="text-sm text-gray-600">Select the default industry for new bookings.</p>
          <select
            value={config.default}
            onChange={(e) => handleSetDefault(e.target.value as IndustryKey)}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2"
          >
            {config.enabled.map((industry) => {
              const industryData = industries.find((i) => i.key === industry);
              return (
                <option key={industry} value={industry}>
                  {industryData?.name || industry}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Customize Industry</h2>
            <p className="text-sm text-gray-600">
              Edit services and chatbot templates for a specific industry.
            </p>
          </div>
          <div className="w-full md:w-1/3">
            <label className="mb-2 block text-sm font-medium text-gray-700">Selected Industry</label>
            <select
              value={selectedIndustry}
              onChange={(e) => handleIndustryChange(e.target.value as IndustryKey)}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2"
            >
              {industries.map((industry) => (
                <option key={industry.key} value={industry.key}>
                  {industry.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-base font-semibold">Services</h3>
            <div className="mt-4 space-y-4">
              {editableServices.map((service, index) => (
                <div key={service.code} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Service code</p>
                      <p className="text-sm font-medium text-gray-900">{service.code}</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Nama layanan
                        <input
                          type="text"
                          value={service.name}
                          onChange={(event) => handleServiceChange(index, "name", event.target.value)}
                          className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
                        />
                      </label>
                      <label className="block text-sm font-medium text-gray-700">
                        Harga
                        <input
                          type="number"
                          value={service.price}
                          onChange={(event) => handleServiceChange(index, "price", event.target.value)}
                          className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
                        />
                      </label>
                    </div>
                  </div>
                  <label className="block text-sm font-medium text-gray-700">
                    Deskripsi
                    <textarea
                      value={service.description}
                      onChange={(event) => handleServiceChange(index, "description", event.target.value)}
                      className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
                      rows={3}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold">Chatbot Templates</h3>
            <div className="mt-4 space-y-4">
              {Object.entries(editableTemplates).map(([templateKey, templateValue]) => (
                <label key={templateKey} className="block text-sm font-medium text-gray-700">
                  {templateKey}
                  <textarea
                    value={templateValue}
                    onChange={(event) => handleTemplateChange(templateKey, event.target.value)}
                    className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
                    rows={templateKey === "servicePrompt" || templateKey === "datePrompt" ? 3 : 5}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Save Industry Customization
        </button>
      </div>
    </div>
  );
}
