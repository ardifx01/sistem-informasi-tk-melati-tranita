"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Pastikan Anda memiliki fungsi `register` di dalam `lib/api.ts`
      await api.register({ name, email, password });
      toast.success(
        "Pendaftaran berhasil! Silakan login dengan akun baru Anda."
      );
      router.push("/auth/login"); // Arahkan ke halaman login setelah berhasil
    } catch (error) {
      let errorMessage = "Pendaftaran gagal. Silakan coba lagi.";

      if (error && typeof error === "object" && "response" in error) {
        const responseError = error.response as { data?: { error?: string } };
        if (responseError.data && responseError.data.error) {
          errorMessage = responseError.data.error;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error("Register error:", error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center min-h-screen p-4",
        className
      )}
      {...props}
    >
      <Card className="w-full max-w-4xl overflow-hidden shadow-2xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="bg-muted relative hidden items-center justify-center md:flex">
            <img
              src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"
              alt="School Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3]"
            />
            <div className="relative z-10 text-center text-white p-8 bg-black/50 rounded-lg">
              <h2 className="text-3xl font-bold">Sistem Informasi Sekolah</h2>
              <p className="mt-2">TK Melati Tranita</p>
            </div>
          </div>
          <form
            onSubmit={handleRegister}
            className="flex flex-col justify-center p-6 md:p-12"
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src="/icons/favicon.ico"
                  alt="Logo TK"
                  className="mx-auto h-14 w-14 mb-4"
                />
                <h1 className="text-2xl font-bold">Buat Akun Baru</h1>
                <p className="text-muted-foreground text-balance text-xs">
                  Lengkapi formulir di bawah untuk mendaftar.
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama Anda"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@contoh.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Mendaftarkan..." : "Daftar"}
              </Button>
              <div className="text-center text-sm">
                Sudah punya akun?{" "}
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Login di sini
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
