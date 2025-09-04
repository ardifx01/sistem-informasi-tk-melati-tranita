// File: components/Dashboard/Keuangan/KategoriPengeluaranChart.tsx
"use client";

import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface ChartData {
  kategori: string;
  total: number;
}

interface KategoriPengeluaranChartProps {
  data: ChartData[];
}

// fungsi generate warna HSL fleksibel dari string kategori
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 65%, 55%)`;
}

export function KategoriPengeluaranChart({
  data,
}: KategoriPengeluaranChartProps) {
  // transform data agar sesuai dengan struktur chart shadcn
  const chartData = data.map((item) => ({
    kategori: item.kategori,
    total: item.total,
    fill: stringToColor(item.kategori),
  }));

  // config chart untuk legend
  const chartConfig = chartData.reduce(
    (acc, item, index) => {
      acc[item.kategori] = {
        label: item.kategori,
        color: item.fill,
      };
      return acc;
    },
    {
      total: { label: "Pengeluaran" },
    } as ChartConfig
  );

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Distribusi Pengeluaran</CardTitle>
        <CardDescription>Berdasarkan kategori</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="kategori"
              // label={({ name, value }) =>
              //   `${name}: ${new Intl.NumberFormat("id-ID", {
              //     style: "currency",
              //     currency: "IDR",
              //     minimumFractionDigits: 0,
              //   }).format(value as number)}`
              // }
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="kategori" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/3 *:justify-start"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
