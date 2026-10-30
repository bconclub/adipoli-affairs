import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Print Menu - Adipoli Affairs",
  robots: { index: false, follow: false },
};

export default function PrintMenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
