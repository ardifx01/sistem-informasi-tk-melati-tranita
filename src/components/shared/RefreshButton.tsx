"use client";

import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // 1. Impor komponen Tooltip
import { RefreshCw } from "lucide-react";
import { mutate } from "swr";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Props untuk komponen
interface RefreshButtonProps extends ButtonProps {
  mutateKeys: string | string[];
}

export function RefreshButton({
  mutateKeys,
  className,
  children,
  ...props
}: RefreshButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Mengubah kunci menjadi array jika hanya satu string yang diberikan
      const keys = Array.isArray(mutateKeys) ? mutateKeys : [mutateKeys];

      // Memicu revalidasi untuk semua kunci yang diberikan
      await Promise.all(keys.map((key) => mutate(key)));

      router.refresh();
      toast.success("data berhasil diperbarui");
    } catch (error) {
      toast.error("Gagal memuat ulang data.");
      console.error("Failed to revalidate SWR cache:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            className={cn("w-32", className)}
            {...props}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            <span className="">Refresh</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Refresh Halaman </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
