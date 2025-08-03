"use client";

import { useState, useEffect, useMemo } from "react";
import { AddPengeluaranDialog } from "@/components/Keuangan/Pengeluaran/AddPengeluaranDialog";
import { PengeluaranTable } from "@/components/Keuangan/Pengeluaran/PengeluaranTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { Pengeluaran } from "@/lib/types";

const ITEMS_PER_PAGE = 30;

function PengeluaranPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-2 h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function PengeluaranPage() {
  const [allPengeluaran, setAllPengeluaran] = useState<Pengeluaran[]>([]);
  const [loading, setLoading] = useState(true);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  const loadPengeluaran = async () => {
    setLoading(true);
    try {
      const data = await api.getPengeluaran();
      setAllPengeluaran(data);
    } catch (error) {
      console.error("Error loading pengeluaran:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPengeluaran();
  }, []);

  // Logic for pagination
  const totalPages = Math.ceil(allPengeluaran.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return allPengeluaran.slice(startIndex, endIndex);
  }, [currentPage, allPengeluaran]);

  const handlePageChange = (direction: "next" | "prev") => {
    setCurrentPage((prev) => {
      if (direction === "next" && prev < totalPages) return prev + 1;
      if (direction === "prev" && prev > 1) return prev - 1;
      return prev;
    });
  };

  if (loading) {
    return <PengeluaranPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Manajemen Pengeluaran
          </h2>
          <p className="text-muted-foreground">
            Catat semua biaya operasional dan pengeluaran sekolah.
          </p>
        </div>
        <AddPengeluaranDialog onPengeluaranAdded={loadPengeluaran} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <PengeluaranTable
            data={paginatedData}
            onDataChanged={loadPengeluaran}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
