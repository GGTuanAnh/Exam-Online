// Reusable skeleton loading components
const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent`;

export function SkeletonLine({ className = '' }: { className?: string }) {
    return <div className={`bg-gray-200 rounded-md ${shimmer} ${className}`} />;
}

export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
    return (
        <tr className="border-b border-gray-100">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <SkeletonLine className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}

export function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <SkeletonLine className="h-5 w-1/3" />
            <SkeletonLine className="h-4 w-full" />
            <SkeletonLine className="h-4 w-2/3" />
            <div className="flex justify-between pt-2">
                <SkeletonLine className="h-8 w-24" />
                <SkeletonLine className="h-8 w-24" />
            </div>
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                        {Array.from({ length: cols }).map((_, i) => (
                            <th key={i} className="px-4 py-3 text-left">
                                <SkeletonLine className="h-3 w-20" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <SkeletonTableRow key={i} cols={cols} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function SkeletonExamCard() {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3 animate-pulse">
            <div className="flex justify-between">
                <SkeletonLine className="h-5 w-2/3" />
                <SkeletonLine className="h-8 w-8 rounded-full" />
            </div>
            <SkeletonLine className="h-4 w-1/2" />
            <div className="space-y-2 pt-2">
                <SkeletonLine className="h-3 w-full" />
                <SkeletonLine className="h-3 w-3/4" />
            </div>
            <SkeletonLine className="h-9 w-full rounded-lg mt-4" />
        </div>
    );
}
