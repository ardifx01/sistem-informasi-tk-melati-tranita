"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, User, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarContent } from "./Sidebar";
import { api } from "@/lib/api";
import type { Siswa } from "@/lib/types";

// Komponen untuk menampilkan hasil pencarian
function SearchResults({ results }: { results: Siswa[] }) {
  const router = useRouter();

  if (results.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Tidak ada siswa ditemukan.
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto">
      {results.map((siswa) => (
        <Link
          key={siswa.id}
          href={`/dashboard/siswa/${siswa.id}`}
          className="block px-4 py-2 text-sm hover:bg-muted"
          onClick={() => router.push(`/dashboard/siswa/${siswa.id}`)} // Pastikan navigasi terjadi
        >
          <p className="font-semibold">{siswa.nama}</p>
          <p className="text-xs text-muted-foreground">NIS: {siswa.nis}</p>
        </Link>
      ))}
    </div>
  );
}

export function Topbar() {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Siswa[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResultsVisible, setIsResultsVisible] = useState(false);

  // Efek untuk melakukan pencarian dengan debouncing
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      setIsResultsVisible(false);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const results = await api.searchSiswa(searchTerm);
        setSearchResults(results);
        setIsResultsVisible(true);
      } catch (error) {
        console.error("Error searching siswa:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Tunggu 300ms setelah pengguna berhenti mengetik

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Tombol Sidebar Mobile */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Pembatas Vertikal */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 items-center gap-x-4 self-stretch lg:gap-x-6">
        {/* Formulir Pencarian Global */}
        <div className="relative flex-1 h-1/2">
          <label htmlFor="search-field" className="sr-only">
            Cari Siswa
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-2 h-full w-5 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-9 pr-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 sm:text-sm"
            placeholder="Cari siswa (nama atau NIS)..."
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.length > 1 && setIsResultsVisible(true)}
            onBlur={() => setTimeout(() => setIsResultsVisible(false), 200)} // Delay untuk memungkinkan klik pada hasil
          />
          {isResultsVisible && (
            <div className="absolute top-full mt-2 w-full rounded-md border bg-background shadow-lg">
              {isSearching ? (
                <div className="p-4 text-sm text-muted-foreground">
                  Mencari...
                </div>
              ) : (
                <SearchResults results={searchResults} />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Bell className="h-6 w-6" />
            <span className="sr-only">Lihat notifikasi</span>
          </Button>

          <div
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
            aria-hidden="true"
          />

          {/* Dropdown Profil Pengguna */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-1.5">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                  />
                  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex lg:flex-col lg:items-start">
                  <span className="text-sm font-semibold">
                    {user?.name || "User"}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.name || "User"}
                <div className="text-xs font-normal text-muted-foreground">
                  {user?.email}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
