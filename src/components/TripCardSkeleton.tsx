const TripCardSkeleton = () => (
  <div className="bg-card rounded-xl border border-border p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-muted" />
      <div className="flex-1">
        <div className="h-4 w-28 bg-muted rounded mb-1.5" />
        <div className="h-3 w-20 bg-muted rounded" />
      </div>
      <div className="h-6 w-20 bg-muted rounded-full" />
    </div>
    <div className="flex gap-1.5 mb-4">
      <div className="h-5 w-16 bg-muted rounded-full" />
      <div className="h-5 w-14 bg-muted rounded-full" />
      <div className="h-5 w-18 bg-muted rounded-full" />
    </div>
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="h-5 bg-muted rounded" />
      <div className="h-5 bg-muted rounded" />
      <div className="h-5 bg-muted rounded" />
      <div className="h-5 bg-muted rounded" />
    </div>
    <div className="h-10 bg-muted rounded-lg" />
  </div>
);

export default TripCardSkeleton;
