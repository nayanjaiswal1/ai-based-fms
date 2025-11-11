export default function InvestmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Investments</h1>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Add Investment
        </button>
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        <p className="text-gray-600">Investment tracking interface will be implemented here.</p>
      </div>
    </div>
  );
}
