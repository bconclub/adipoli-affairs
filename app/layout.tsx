import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";
import { CartProvider } from "@/contexts/CartContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Adipoli Affairs - Authentic Kerala Cuisine",
  description: "Experience the true taste of Kerala in Christchurch. Authentic spices, fresh ingredients, and premium dining.",
  icons: {
    icon: "/Adipoli icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.variable}>
        <CartProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </CartProvider>
      </body>
    </html>
  );
}
