import { Skeleton } from "@/components/ui/skeleton";

const EventCardSkeleton = () => {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border w-full">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-lg" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="flex -space-x-1.5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-6 h-6 rounded-full border-2 border-card" />
            ))}
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;
