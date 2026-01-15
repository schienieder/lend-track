export default function Loading() {
  return (
    <div className="relative min-h-screen w-full bg-background font-sans overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center min-h-screen w-full pt-16 px-4 sm:px-6 gap-16 max-w-6xl mx-auto">
        {/* Left side skeleton */}
        <div className="flex flex-col items-start justify-center w-full md:w-1/2 text-left">
          <div className="h-14 bg-muted rounded-lg w-3/4 mb-6 animate-pulse"></div>
          <div className="h-5 bg-muted rounded w-full mb-3 animate-pulse"></div>
          <div className="h-5 bg-muted rounded w-5/6 mb-8 animate-pulse"></div>

          <div className="flex gap-3 mb-12">
            <div className="h-10 w-32 bg-muted rounded-md animate-pulse"></div>
            <div className="h-10 w-32 bg-muted rounded-md animate-pulse"></div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-muted animate-pulse"></div>
              <div className="h-4 w-40 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-muted animate-pulse"></div>
              <div className="h-4 w-36 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-muted animate-pulse"></div>
              <div className="h-4 w-44 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Right side skeleton */}
        <div className="relative w-full md:w-1/2 hidden md:flex justify-center items-center">
          <div className="relative w-full max-w-sm h-80">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-56 rounded-3xl bg-muted animate-pulse"></div>
            </div>
            <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-muted animate-pulse"></div>
            <div className="absolute bottom-8 right-4 w-14 h-14 rounded-xl bg-muted animate-pulse"></div>
            <div className="absolute top-1/3 right-0 w-10 h-10 rounded-lg bg-muted animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}