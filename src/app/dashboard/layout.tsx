import { AppLayout } from "@/components/Dashboard/Layout/AppLayout";
import type { PropsWithChildren } from "react";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return <AppLayout>{children}</AppLayout>;
}
