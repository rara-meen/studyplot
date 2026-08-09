import React from "react";
import Card from "./Card";
import Skeleton from "./Skeleton";

const DocumentCardSkeleton = () => {
  return (
    <Card>
      <div className="flex items-start gap-4">
        <Skeleton className="h-11 w-11 flex-shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="mt-5 flex gap-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </Card>
  );
};

export default DocumentCardSkeleton;
