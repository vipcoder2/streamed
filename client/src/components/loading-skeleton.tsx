export function LoadingSkeleton() {
  return (
    <div className="glassmorphism flex-shrink-0 w-80 p-4 rounded-lg">
      <div className="skeleton h-4 w-32 rounded mb-3"></div>
      <div className="flex items-center space-x-3">
        <div className="skeleton h-8 w-8 rounded"></div>
        <div className="flex-1">
          <div className="skeleton h-4 w-40 rounded mb-1"></div>
          <div className="skeleton h-3 w-20 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <section className="mb-8">
      <div className="skeleton h-6 w-48 rounded-lg mb-4"></div>
      <div className="flex space-x-4 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <LoadingSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
