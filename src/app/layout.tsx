import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | TK Melati Tranita",
    default: "Dashboard TK Melati Tranita",
  },
  description: "Sistem Manajemen Keuangan dan Siswa untuk TK Melati Tranita.",
  manifest: "/icons/favicon/site.webmanifest",
  icons: {
    // This is the main icon, often the .ico file
    icon: "/icons/favicon/favicon.ico",
    // This is for the <link rel="shortcut icon"> tag
    shortcut: "/icons/favicon/favicon.ico",
    // Apple touch icon for iOS home screens
    apple: [
      {
        url: "/icons/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    // Other icons for different sizes and types
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "96x96",
        url: "/icons/favicon/favicon-96x96.png",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        url: "/icons/favicon/favicon.svg",
      },
    ],
  },
  // appleWebApp: {
  //   title: "SchDashboard",
  //   // You can also add startupImage and statusBarStyle here
  // },
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
