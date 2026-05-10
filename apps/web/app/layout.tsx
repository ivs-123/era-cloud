import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "ERA Cloud",
  description: "Unified control plane for compute and inference routing."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

