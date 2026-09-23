import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { DemoProvider } from "@/lib/demo-context";
import { AppHeader } from "@/components/app-header";
import { DemoControl } from "@/components/demo-control";
import { GuidedTour } from "@/components/guided-tour";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Health OS — Demo",
  description: "Clickable demo of Health OS, an AI-native health and fitness platform for the GCC.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <DemoProvider>
          <AppHeader />
          {children}
          <DemoControl />
          <GuidedTour />
          <Toaster position="top-center" />
        </DemoProvider>
      </body>
    </html>
  );
}
