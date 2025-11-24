import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Database } from "lucide-react";

// --- Types ---
interface StorageFolder {
  folder: string;
  size: number; // in bytes
}

interface StorageChartProps {
  data: StorageFolder[];
  totalAllocated: number; // in bytes
}

// --- Helpers ---
const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Vibrant colors for different folders
const COLORS = [
  "#0ea5e9",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
];

export function StorageUsageChart({ data, totalAllocated }: StorageChartProps) {
  const processedData = useMemo(() => {
    const used = data.reduce((acc, item) => acc + item.size, 0);
    const free = totalAllocated - used;

    // Create chart data including "Free Space"
    return [
      ...data.map((item) => ({
        name: item.folder,
        value: item.size,
        isFree: item.size === 0,
      })),
      { name: "Free Space", value: free > 0 ? free : 0, isFree: true },
    ];
  }, [data, totalAllocated]);

  const totalUsed = data.reduce((acc, item) => acc + item.size, 0);
  const usagePercentage = Math.round((totalUsed / totalAllocated) * 100);

  return (
    <Card className="flex flex-col  shadow-md">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Database className="h-4 w-4 text-blue-500" />
          Storage Distribution
        </CardTitle>
        <CardDescription>
          {formatBytes(totalUsed)} used of {formatBytes(totalAllocated)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="h-[250px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {processedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.isFree ? "#e2e8f0" : COLORS[index % COLORS.length]
                    } // Gray for free space
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatBytes(value)}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "#1e293b" }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-900">
              {usagePercentage}%
            </span>
            <span className="text-sm text-muted-foreground tracking-wider">
              Used
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-3 pt-0">
        <div className="grid grid-cols-1 gap-2 w-full text-xs">
          {data.map((item, index) => (
            <div
              key={item.folder}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-muted-foreground">{item.folder}</span>
              </div>
              <span className="font-medium">{formatBytes(item.size)}</span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
