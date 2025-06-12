import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";

import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";

import Header from "./header";
import Footer from "./footer";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Weekly Dish",
  description: "1週間の献立を自動生成するアプリケーション",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 mx-auto w-full p-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
