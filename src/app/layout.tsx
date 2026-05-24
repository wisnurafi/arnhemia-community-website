import type { Metadata } from "next";
import { Inter, Cinzel, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ARNHEMIA — Elite Gaming Community",
    template: "%s · ARNHEMIA",
  },
  description:
    "ARNHEMIA — invite-only premium gaming community. Loaders, tickets, and a brotherhood for the dedicated.",
  metadataBase: new URL("https://arnhemia.example.com"),
  openGraph: {
    title: "ARNHEMIA",
    description: "Invite-only premium gaming community.",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          inter.variable,
          cinzel.variable,
          jetbrains.variable,
          "font-sans min-h-screen overflow-x-hidden",
        )}
      >
        <div className="pointer-events-none fixed inset-0 -z-10 grid-bg opacity-50" />
        <div className="pointer-events-none fixed inset-x-0 -top-40 -z-10 h-[420px] bg-radial-fade" />
        {children}
      </body>
    </html>
  );
}
