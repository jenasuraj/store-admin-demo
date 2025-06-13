import { Skeleton } from "@/components/ui/skeleton";

const SkeletonRow = () => (
  <tr className="border-b">
    <td className="px-4 py-3">
      <Skeleton className="h-4 w-10" />
    </td>
    <td className="px-4 py-3">
      <Skeleton className="h-4 w-16" />
    </td>
    <td className="px-4 py-3">
      <Skeleton className="h-4 w-32" />
    </td>
    <td className="px-4 py-3">
      <Skeleton className="h-4 w-20" />
    </td>
    <td className="px-4 py-3">
      <Skeleton className="h-4 w-24" />
    </td>
  </tr>
);

const TableSkeleton = () => {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-lg font-semibold">
        <Skeleton className="h-8 w-60" />
      </h2>
      <p className="text-sm text-gray-500 mt-2">
        <Skeleton className="h-3 w-60" />
      </p>

      <div className="mt-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">
                <Skeleton className="h-4 w-10" />
              </th>
              <th className="px-4 py-2 text-left">
                <Skeleton className="h-4 w-10" />
              </th>
              <th className="px-4 py-2 text-left">
                <Skeleton className="h-4 w-10" />
              </th>
              <th className="px-4 py-2 text-left">
                <Skeleton className="h-4 w-10" />
              </th>
              <th className="px-4 py-2 text-left">
                <Skeleton className="h-4 w-10" />
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, index) => (
              <SkeletonRow key={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableSkeleton;
