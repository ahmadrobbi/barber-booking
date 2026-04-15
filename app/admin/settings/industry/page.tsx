"use client";

import { useState, useEffect } from "react";
import { getAvailableIndustries, getIndustryConfig, saveIndustryConfig } from "@/lib/industry-config";
import type { IndustryKey, IndustryConfig } from "@/lib/industry-config";

export default function IndustrySettings() {
  const [config, setConfig] = useState<IndustryConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const industries = getAvailableIndustries();

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const cfg = await getIndustryConfig();
        setConfig(cfg);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load config");
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

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

  const handleSave = async () => {
    if (!config) return;

    try {
      setError(null);
      setSuccess(false);
      await saveIndustryConfig(config);
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

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Enabled Industries</h2>
        <p className="text-sm text-gray-600">
          Select which industries are available for booking
        </p>

        <div className="space-y-3">
          {industries.map((industry) => (
            <label key={industry.key} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.enabled.includes(industry.key)}
                onChange={() => handleToggleIndustry(industry.key)}
                className="h-4 w-4 rounded"
              />
              <span className="font-medium">{industry.name}</span>
              {config.default === industry.key && (
                <span className="ml-2 rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                  Default
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Default Industry</h2>
        <p className="text-sm text-gray-600">
          Select the default industry for new bookings
        </p>

        <select
          value={config.default}
          onChange={(e) => handleSetDefault(e.target.value as IndustryKey)}
          className="block w-full rounded-lg border border-gray-300 px-4 py-2"
        >
          {config.enabled.map((industry) => {
            const industryData = industries.find((i) => i.key === industry);
            return (
              <option key={industry} value={industry}>
                {industryData?.name}
              </option>
            );
          })}
        </select>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
