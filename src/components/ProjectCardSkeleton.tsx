import { Skeleton } from "@/components/ui/skeleton";

export function ProjectCardSkeleton() {
  return (
    <article className="group">
      {/* Thumbnail Skeleton */}
      <div className="card-editorial aspect-[4/3] mb-4 overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Info Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </article>
  );
}

interface ProjectGridSkeletonProps {
  count?: number;
}

export function ProjectGridSkeleton({ count = 4 }: ProjectGridSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ProjectCardSkeleton key={index} />
      ))}
    </>
  );
}
