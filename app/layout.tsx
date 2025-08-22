import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import "./styles/themes.css";

export const metadata: Metadata = {
  title: 'Xyqo.ai',
  description: 'Automation made simple.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
