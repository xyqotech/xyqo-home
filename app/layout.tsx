import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
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
