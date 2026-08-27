import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";
import { LanguageProvider } from "@/context/LanguageContext";
import { AccessibilityProvider } from "@/context/AccessibilityContext";

export const metadata: Metadata = {
  title: "CivicAI – Unified Civic Trust & Smart Mobility Platform",
  description: "Verify government officials, discover public services, and find intelligent, cost-aware transit routes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#fafafa] text-[#212121] min-h-screen flex flex-col antialiased">
        <LanguageProvider>
          <AccessibilityProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <AccessibilityToolbar />
            <Footer />
          </AccessibilityProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
