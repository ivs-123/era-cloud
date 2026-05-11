import type { Metadata } from "next";
import "./styles.css";
import { AuthProvider } from "./auth.js";

export const metadata: Metadata = {
  title: "ERA Cloud",
  description: "Unified control plane for compute and inference routing."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
