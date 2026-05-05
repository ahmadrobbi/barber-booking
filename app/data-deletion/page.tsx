import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Deletion | BookLink",
  description: "How to request deletion of BookLink-related data.",
};

const lastUpdated = "May 5, 2026";

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f3ea_0%,#ffffff_32%,#fffaf2_100%)] px-6 py-16 text-stone-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <section className="rounded-[2rem] border border-stone-200 bg-white/95 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.06)]">
          <p className="text-sm uppercase tracking-[0.3em] text-stone-500">
            Data Deletion
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            BookLink Data Deletion Request
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
            This page explains how to request deletion of data associated with a
            BookLink-connected business account.
          </p>
          <p className="mt-3 text-sm text-stone-500">
            Last updated: {lastUpdated}
          </p>
        </section>

        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">What can be deleted</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            Business owners can request removal of stored account data, channel
            settings, booking records, and chat session data that are associated
            with their BookLink account, subject to legal and operational
            requirements.
          </p>

          <h2 className="mt-8 text-xl font-semibold">How to request deletion</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            Send a deletion request to the business owner or the official
            BookLink support contact. Include the account name, business name, or
            WhatsApp number so the request can be matched correctly.
          </p>

          <h2 className="mt-8 text-xl font-semibold">What happens next</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            After verification, eligible data will be removed within a reasonable
            timeframe. Some records may be retained if required for legal,
            security, billing, or audit purposes.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Contact</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            If you need help with a deletion request, contact the business owner
            through the admin dashboard or the official support contact provided
            by the business.
          </p>
        </section>
      </div>
    </main>
  );
}
