import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CORESPACE',
  description: 'Spatial personal management system — inventory-driven productivity.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
