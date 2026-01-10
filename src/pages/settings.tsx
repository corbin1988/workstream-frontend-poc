export default function Settings() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Settings
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-700 dark:text-gray-300">
            This page doesn't use the main layout (no sidebar or drawers).
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
            Pages can opt out of the layout by setting `useLayout = false` as a static property.
          </p>
        </div>
      </div>
    </div>
  );
}

// Opt out of the main layout
Settings.useLayout = false;
