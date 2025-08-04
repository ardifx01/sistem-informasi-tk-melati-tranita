"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookText, // Ikon baru untuk panduan
  Wallet,
  Banknote,
  HandCoins,
  CreditCard,
  LucideIcon,
  ChartNoAxesCombined,
  BarChartHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

// Definisi tipe data (tidak berubah)
interface LabelItem {
  type: "label";
  name: string;
}
interface LinkItem {
  type: "link";
  name: string;
  href: string;
  icon: LucideIcon;
}
interface SubItem {
  name: string;
  href: string;
  icon: LucideIcon;
}
interface CollapsibleItem {
  type: "collapsible";
  name: string;
  icon: LucideIcon;
  subItems: SubItem[];
}
type NavigationItem = LabelItem | LinkItem | CollapsibleItem;

// Struktur navigasi utama
const navigationItems: NavigationItem[] = [
  { type: "label", name: "Utama" },
  {
    type: "link",
    name: "Dashboard Utama",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  { type: "label", name: "Manajemen" },
  {
    type: "link",
    name: "Siswa",
    href: "/dashboard/siswa",
    icon: Users,
  },
  {
    type: "link",
    name: "Kelas",
    href: "/dashboard/kelas",
    icon: GraduationCap,
  },
  {
    type: "collapsible",
    name: "Keuangan",
    icon: Wallet,
    subItems: [
      {
        name: "Ringkasan",
        href: "/dashboard/keuangan",
        icon: BarChartHorizontal,
      },
      {
        name: "Tagihan",
        href: "/dashboard/keuangan/tagihan",
        icon: CreditCard,
      },
      {
        name: "Pemasukan",
        href: "/dashboard/keuangan/pemasukan",
        icon: Banknote,
      },
      {
        name: "Pengeluaran",
        href: "/dashboard/keuangan/pengeluaran",
        icon: HandCoins,
      },
    ],
  },
];

// Komponen Sidebar
export function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header Sidebar */}
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-3">
          <img src="/icons/favicon/favicon-32x32.png" alt="Logo Sekolah" />
          <span className="text-base font-bold text-foreground">
            TK Melati Tranita
          </span>
        </Link>
      </div>

      {/* Konten Navigasi */}
      <div className="flex flex-1 flex-col gap-y-5 overflow-y-auto px-4 py-4">
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            {/* Navigasi Utama */}
            <li>
              <ul role="list" className="space-y-1">
                {navigationItems.map((item, index) => {
                  if (item.type === "label") {
                    return (
                      <li key={index} className="px-3 pt-4 pb-1 first:pt-0">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {item.name}
                        </div>
                      </li>
                    );
                  }

                  if (item.type === "collapsible") {
                    const isParentActive = item.subItems.some((sub) =>
                      pathname.startsWith(sub.href)
                    );
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <Accordion
                          type="single"
                          collapsible
                          defaultValue={isParentActive ? "item-1" : ""}
                        >
                          <AccordionItem value="item-1" className="border-b-0">
                            <AccordionTrigger
                              className={cn(
                                "flex items-center gap-x-3 rounded-md  p-2 text-sm font-semibold leading-6 text-foreground hover:bg-muted hover:no-underline",
                                isParentActive && "bg-primary/10 text-primary"
                              )}
                            >
                              <div className="flex gap-x-3">
                                <Icon
                                  className="h-5 w-5 shrink-0"
                                  aria-hidden="true"
                                />
                                <span className="">{item.name}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pl-6 pt-1">
                              <ul className="space-y-1 border-l border-muted-foreground/20 pl-4">
                                {item.subItems.map((subItem) => {
                                  const isActive = pathname === subItem.href;
                                  const SubIcon = subItem.icon;
                                  return (
                                    <li key={subItem.name}>
                                      <Link
                                        href={subItem.href}
                                        className={cn(
                                          "group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 hover:bg-muted",
                                          isActive
                                            ? "text-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                        )}
                                      >
                                        <SubIcon
                                          className="h-5 w-5 shrink-0"
                                          aria-hidden="true"
                                        />
                                        {subItem.name}
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </li>
                    );
                  }

                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 hover:bg-muted",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>

            {/* Navigasi Bantuan (didorong ke bawah) */}
            <li className="mt-auto">
              <div className="px-3 pt-4 pb-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Bantuan
                </div>
              </div>
              <ul role="list" className="space-y-1">
                <li>
                  <Link
                    href="/dashboard/panduan"
                    className={cn(
                      "group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 hover:bg-muted",
                      pathname === "/dashboard/panduan"
                        ? "bg-primary/10 text-primary"
                        : "text-foreground"
                    )}
                  >
                    <BookText className="h-5 w-5 shrink-0" aria-hidden="true" />
                    Panduan Aplikasi
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
