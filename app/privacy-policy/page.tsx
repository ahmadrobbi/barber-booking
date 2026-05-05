import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | BookLink",
  description: "Privacy Policy for the BookLink WhatsApp booking platform.",
};

const lastUpdated = "May 5, 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f3ea_0%,#ffffff_32%,#fffaf2_100%)] px-6 py-16 text-stone-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <section className="rounded-[2rem] border border-stone-200 bg-white/95 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.06)]">
          <p className="text-sm uppercase tracking-[0.3em] text-stone-500">
            Privacy Policy
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            BookLink Privacy Policy
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
            This page explains how BookLink handles information when you use the
            WhatsApp booking platform, landing pages, and admin dashboard.
          </p>
          <p className="mt-3 text-sm text-stone-500">
            Last updated: {lastUpdated}
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Information we collect</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              BookLink may process phone numbers, customer names, booking details,
              chat messages, business settings, and technical logs needed to run
              the service.
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">How we use information</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              We use this information to route WhatsApp messages, manage
              bookings, send reminders, support admin operations, and improve the
              platform experience.
            </p>
          </article>
        </section>

        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Data sharing</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            We do not sell personal data. Information may be shared with service
            providers that help operate the platform, such as hosting, database,
            messaging, and analytics infrastructure, only as needed to provide the
            service.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Data retention</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            Booking records, chat sessions, and logs may be retained as long as
            necessary to provide the service, comply with legal obligations, and
            support business operations.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Security</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            We use reasonable technical and organizational measures to protect
            stored information, but no system is perfectly secure.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Contact</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            For privacy questions or data requests, contact the business owner
            through the admin dashboard or the official business contact details
            published by BookLink users.
          </p>
        </section>

        <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-900">
          This page is intended to satisfy platform requirements for app review
          and publishing. You can replace this content later with your finalized
          legal policy.
        </section>
      </div>
    </main>
  );
}
