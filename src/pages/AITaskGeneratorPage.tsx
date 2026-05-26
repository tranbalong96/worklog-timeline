export function AITaskGeneratorPage() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">AI Task Generator</h2>
        <p className="mt-1 text-sm text-slate-600">
          Drafting Jira-style tasks from notes will be added in a later phase.
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <label className="text-sm font-medium text-slate-700" htmlFor="developer-notes">
          Developer notes
        </label>
        <textarea
          id="developer-notes"
          className="mt-2 min-h-40 w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none"
          disabled
          placeholder="AI generation is not available yet."
        />
      </div>
    </section>
  );
}
