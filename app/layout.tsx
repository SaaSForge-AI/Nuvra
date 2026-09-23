import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nuvra - Create. Sell. Teach. Scale.",
  description:
    "Nuvra is the all-in-one platform to create funnels, sell products, teach courses, and scale your business.",
  openGraph: {
    title: "Nuvra - Create. Sell. Teach. Scale.",
    description: "All-in-one platform for creators and entrepreneurs",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-white antialiased">{children}</body>
    </html>
  );
}
