"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Toast from "./Toast";
import FloatingCartButton from "./FloatingCartButton";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isTVPage = pathname === "/tv";

  if (isTVPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", paddingTop: "80px" }}>
        {children}
      </main>
      <Footer />
      <Toast />
      <FloatingCartButton />
    </>
  );
}

