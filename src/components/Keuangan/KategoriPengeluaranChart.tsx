// File: components/Dashboard/Keuangan//KategoriPengeluaranChart.tsx

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface ChartData {
  kategori: string;
  total: number;
}

interface KategoriPengeluaranChartProps {
  data: ChartData[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#ff4d4d",
];

export function KategoriPengeluaranChart({
  data,
}: KategoriPengeluaranChartProps) {
  const chartData = data.map((item) => ({
    name: item.kategori.replace("_", " "),
    value: item.total,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Distribusi Pengeluaran</CardTitle>
        <CardDescription>
          Persentase pengeluaran berdasarkan kategori.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(value)
              }
            />
            <Legend />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
