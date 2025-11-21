export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-4 text-emerald-600">
          ✅ Dashboard Works!
        </h1>
        
        <div className="mb-6">
          <p className="text-lg text-slate-700">
            If you see this page after logging in, authentication is working!
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <h2 className="font-semibold text-emerald-900">Next: Connect Zerodha</h2>
            <p className="text-sm text-emerald-700 mt-1">
              Click below to connect your Zerodha account
            </p>
          </div>

          <a
            href="/api/zerodha/auth"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Connect Zerodha Account
          </a>

          <div className="mt-6">
            <a
              href="/login"
              className="inline-block px-6 py-3 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
