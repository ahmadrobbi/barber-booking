import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | BookLink",
  description: "Terms of Service for the BookLink WhatsApp booking platform.",
};

const lastUpdated = "May 5, 2026";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f3ea_0%,#ffffff_32%,#fffaf2_100%)] px-6 py-16 text-stone-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <section className="rounded-[2rem] border border-stone-200 bg-white/95 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.06)]">
          <p className="text-sm uppercase tracking-[0.3em] text-stone-500">
            Terms of Service
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            BookLink Terms of Service
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
            These terms explain the basic rules for using the BookLink booking
            platform, WhatsApp automation features, and public landing pages.
          </p>
          <p className="mt-3 text-sm text-stone-500">
            Last updated: {lastUpdated}
          </p>
        </section>

        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Use of the service</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            BookLink is provided to help businesses manage appointments,
            customer communication, reminders, and related operations. You agree
            to use the service lawfully and only for legitimate business
            purposes.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Account responsibility</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            Business owners are responsible for the accuracy of their booking
            information, services, contact details, and any content published
            through their account.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Messaging rules</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            WhatsApp messaging must follow Meta policies, applicable laws, and
            user consent requirements. Businesses are responsible for the
            messages they send and receive through their connected channel.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Availability</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            We may update, suspend, or modify the service at any time to maintain
            security, reliability, or product improvements.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Contact</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            For questions about these terms, contact the business owner through
            the official BookLink support or admin contact channels.
          </p>
        </section>
      </div>
    </main>
  );
}
