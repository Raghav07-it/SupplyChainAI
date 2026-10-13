function PlaceholderPage({ title, description }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-blue-400">
          SupplyChainAI
        </p>

        <h1 className="mt-3 text-3xl font-semibold text-white">
          {title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          {description}
        </p>

        <div className="mt-6 inline-flex rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-500">
          Module under development
        </div>
      </div>
    </div>
  );
}

export default PlaceholderPage;