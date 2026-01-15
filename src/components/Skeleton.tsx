"use client";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-zinc-800/50 rounded ${className}`}
        />
    );
}

export function RoastCardSkeleton() {
    return (
        <div className="p-8 border border-zinc-900 bg-zinc-900/10 flex items-center justify-between">
            <div className="flex items-center gap-8">
                <Skeleton className="w-12 h-12" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
            <div className="flex items-center gap-10">
                <div className="flex flex-col items-end gap-1">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-2 w-20" />
                </div>
                <Skeleton className="h-10 w-px" />
                <Skeleton className="h-4 w-4" />
            </div>
        </div>
    );
}

export function HistoryPageSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4">
            {[...Array(5)].map((_, i) => (
                <RoastCardSkeleton key={i} />
            ))}
        </div>
    );
}
