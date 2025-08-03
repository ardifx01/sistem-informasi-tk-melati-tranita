import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TK Melati Tranita",
  description: "Dashboard Sistem Management TK Melati Tranita",
  icons: {
    icon: "/icons/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster
          closeButton
          richColors
          position="top-center"
          expand={false}
          duration={3000}
        />

        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
