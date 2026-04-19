"use client";

import { useState } from "react";

interface TransactionFiltersProps {
  onFiltersChange: (filters: {
    status: string;
    type: string;
    dateFrom: string;
    dateTo: string;
    search: string;
  }) => void;
}

export default function TransactionFilters({ onFiltersChange }: TransactionFiltersProps) {
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  const handleFilterChange = () => {
    onFiltersChange({
      status,
      type,
      dateFrom,
      dateTo,
      search,
    });
  };

  const clearFilters = () => {
    setStatus("all");
    setType("all");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    onFiltersChange({
      status: "all",
      type: "all",
      dateFrom: "",
      dateTo: "",
      search: "",
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Cari Transaksi
          </label>
          <input
            type="text"
            placeholder="Cari berdasarkan deskripsi atau ID referensi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyUp={handleFilterChange}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            onBlur={handleFilterChange}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="completed">Sukses</option>
            <option value="pending">Pending</option>
            <option value="failed">Gagal</option>
            <option value="cancelled">Dibatalkan</option>
            <option value="refund">Refund</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Tipe
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            onBlur={handleFilterChange}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Semua Tipe</option>
            <option value="payment">Pembayaran</option>
            <option value="subscription">Langganan</option>
            <option value="refund">Pengembalian</option>
            <option value="commission">Komisi</option>
          </select>
        </div>

        {/* Date From */}
        <div className="min-w-[140px]">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Dari Tanggal
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            onBlur={handleFilterChange}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Date To */}
        <div className="min-w-[140px]">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Sampai Tanggal
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            onBlur={handleFilterChange}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-stone-600 hover:text-stone-800 border border-stone-300 rounded-lg hover:bg-stone-50 transition"
          >
            Reset Filter
          </button>
        </div>
      </div>
    </div>
  );
}