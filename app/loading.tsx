export default function Loading() {
  // You can add any UI inside Loading, including a skeleton.
  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-slate-800 font-sans overflow-hidden">
      {/* Top Navigation Skeleton */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center min-h-screen w-full pt-16 px-4 sm:px-6 gap-12 max-w-7xl mx-auto">
        {/* Left side: Heading, description, and CTAs skeleton */}
        <div className="flex flex-col items-start justify-center w-full md:w-1/2 text-left">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6 animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3 animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-3 animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-4/6 mb-8 animate-pulse"></div>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="h-12 w-44 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          </div>

          {/* Feature highlights skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Right side: Illustrations skeleton */}
        <div className="relative w-full md:w-1/2 flex justify-center items-center">
          <div className="relative w-full max-w-lg h-96">
            {/* Main illustration container skeleton */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                <div className="text-6xl opacity-20"></div>
              </div>
            </div>

            {/* Floating elements skeleton */}
            <div className="absolute top-10 left-10 w-20 h-20 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
              <div className="text-2xl opacity-20"></div>
            </div>

            <div className="absolute bottom-10 right-10 w-24 h-24 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
              <div className="text-3xl opacity-20"></div>
            </div>

            <div className="absolute top-1/2 right-0 w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
              <div className="text-xl opacity-20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}