import { AdminQueryFeedbackAlert } from "@/components/admin-query-feedback-alert";
import {
  deleteChatbotKnowledgeEntryAction,
  saveChatbotKnowledgeEntry,
  seedDefaultChatbotKnowledgeAction,
} from "@/app/actions/chatbot-knowledge";
import { requireAdmin } from "@/lib/auth";
import { getCurrentUserBusinessName } from "@/lib/industry-config";
import { getKnowledgeEntriesForUser } from "@/lib/chatbot-knowledge";

export const dynamic = "force-dynamic";

function formatTags(tags: string[]) {
  return tags.join(", ");
}

export default async function KnowledgeSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireAdmin();
  const params = await searchParams;
  const businessName = await getCurrentUserBusinessName();
  const entries = await getKnowledgeEntriesForUser(user.id);

  return (
    <div className="space-y-6">
      <AdminQueryFeedbackAlert
        successMessage={params.success ?? null}
        errorMessage={params.error ?? null}
      />

      <section className="rounded-[2rem] bg-stone-950 px-6 py-8 text-white md:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">AI Knowledge</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
          Knowledge Base untuk AI Gemma
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
          Halaman ini khusus untuk mengisi pengetahuan yang dipakai chatbot AI. Template chatbot lama tetap
          berjalan apa adanya, sementara isi knowledge di sini dipakai Gemma untuk menjawab FAQ yang lebih
          fleksibel dan sesuai konteks bisnis {businessName}.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Status</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">{entries.length} entri</p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Semakin lengkap knowledge-nya, semakin kecil kemungkinan AI menjawab ngelantur atau terlalu
            generik.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Workflow</p>
          <p className="mt-2 text-lg font-semibold text-stone-900">Retrieval-first</p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            FAQ akan diambil dari knowledge paling relevan dulu, lalu Gemma hanya merapikan jawaban bila
            diperlukan.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Quick Start</p>
          <form action={seedDefaultChatbotKnowledgeAction} className="mt-3">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-300"
            >
              Isi contoh knowledge
            </button>
          </form>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Cocok untuk uji coba awal kalau kamu belum sempat isi FAQ satu per satu.
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-xl md:p-8">
        <div className="flex flex-col gap-3 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Add Entry</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-900">Tambah Knowledge Baru</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-600">
              Gunakan satu entri untuk satu pertanyaan utama. Semakin tajam pertanyaannya, semakin mudah
              retrieval menemukan jawaban yang pas.
            </p>
          </div>
        </div>

        <form action={saveChatbotKnowledgeEntry} className="mt-6 space-y-5">
          <input type="hidden" name="source" value="manual" />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Judul</span>
              <input
                name="title"
                type="text"
                placeholder="Contoh: Jam Operasional"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Kategori</span>
              <input
                name="category"
                type="text"
                placeholder="operational / services / branches / booking"
                defaultValue="general"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-stone-700">Pertanyaan</span>
              <textarea
                name="question"
                rows={3}
                placeholder="Pertanyaan yang sering ditanyakan customer"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
                required
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-stone-700">Jawaban</span>
              <textarea
                name="answer"
                rows={5}
                placeholder="Jawaban singkat, jelas, dan bisa langsung dipakai AI"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Tags</span>
              <input
                name="tags"
                type="text"
                placeholder="jam buka, operasional, hari ini"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Prioritas</span>
              <input
                name="priority"
                type="number"
                defaultValue={0}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked
                className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
              />
              Knowledge aktif
            </label>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Simpan Knowledge
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Library</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-900">Knowledge Tersimpan</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-stone-600">
            Update knowledge kapan saja untuk menyesuaikan jawaban AI dengan SOP, promo, atau kebijakan terbaru.
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-white p-8 text-sm leading-7 text-stone-600">
            Belum ada knowledge yang disimpan. Klik <strong>Isi contoh knowledge</strong> untuk membuat
            starter pack, atau tambah entri manual di form atas.
          </div>
        ) : (
          <div className="grid gap-4">
            {entries.map((entry) => (
              <article
                key={entry.id}
                className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-stone-900">{entry.title}</h3>
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
                        {entry.category}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          entry.is_active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-200 text-stone-700"
                        }`}
                      >
                        {entry.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    <p className="text-sm leading-7 text-stone-700">
                      <span className="font-semibold text-stone-900">Q:</span> {entry.question}
                    </p>
                    <p className="text-sm leading-7 text-stone-700 whitespace-pre-line">
                      <span className="font-semibold text-stone-900">A:</span> {entry.answer}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-stone-500">
                      <span>Prioritas: {entry.priority}</span>
                      <span>Source: {entry.source}</span>
                      <span>Tags: {formatTags(entry.tags) || "-"}</span>
                    </div>
                  </div>

                  <form action={deleteChatbotKnowledgeEntryAction}>
                    <input type="hidden" name="entry_id" value={entry.id} />
                    <button
                      type="submit"
                      className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                    >
                      Hapus
                    </button>
                  </form>
                </div>

                <div className="mt-5 border-t border-stone-200 pt-5">
                  <details>
                    <summary className="cursor-pointer text-sm font-semibold text-stone-900">
                      Edit entry ini
                    </summary>
                    <form action={saveChatbotKnowledgeEntry} className="mt-4 space-y-5">
                      <input type="hidden" name="id" value={entry.id} />
                      <input type="hidden" name="source" value={entry.source} />
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-stone-700">Judul</span>
                          <input
                            name="title"
                            type="text"
                            defaultValue={entry.title}
                            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
                            required
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-stone-700">Kategori</span>
                          <input
                            name="category"
                            type="text"
                            defaultValue={entry.category}
                            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
                          />
                        </label>

                        <label className="block md:col-span-2">
                          <span className="mb-2 block text-sm font-medium text-stone-700">Pertanyaan</span>
                          <textarea
                            name="question"
                            rows={3}
                            defaultValue={entry.question}
                            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
                            required
                          />
                        </label>

                        <label className="block md:col-span-2">
                          <span className="mb-2 block text-sm font-medium text-stone-700">Jawaban</span>
                          <textarea
                            name="answer"
                            rows={5}
                            defaultValue={entry.answer}
                            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
                            required
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-stone-700">Tags</span>
                          <input
                            name="tags"
                            type="text"
                            defaultValue={formatTags(entry.tags)}
                            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-stone-700">Prioritas</span>
                          <input
                            name="priority"
                            type="number"
                            defaultValue={entry.priority}
                            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:bg-white"
                          />
                        </label>
                      </div>

                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800">
                          <input
                            type="checkbox"
                            name="is_active"
                            defaultChecked={entry.is_active}
                            className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
                          />
                          Knowledge aktif
                        </label>

                        <button
                          type="submit"
                          className="inline-flex items-center justify-center rounded-2xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                        >
                          Update Entry
                        </button>
                      </div>
                    </form>
                  </details>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

