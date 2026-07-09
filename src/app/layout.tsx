import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/components/layout/cart-provider";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "NOX — Premium E-Commerce",
  description: "Discover curated luxury products for the modern lifestyle.",
  openGraph: {
    title: "NOX — Premium E-Commerce",
    description: "Discover curated luxury products for the modern lifestyle.",
    siteName: "NOX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-body antialiased">
        <CartProvider>
          <ToastProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
