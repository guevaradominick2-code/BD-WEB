import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "MARÍA | A Birthday Experience", template: "%s · MARÍA" },
  description: "Una experiencia privada creada para celebrar la historia, los recuerdos y el cumpleaños de María.",
  applicationName: "MARÍA | A Birthday Experience",
  robots: { index: false, follow: false },
  openGraph: {
    title: "MARÍA | A Birthday Experience",
    description: "Hay días especiales… y luego está el tuyo, María.",
    type: "website",
    locale: "es_CR",
  },
};

export const viewport: Viewport = {
  themeColor: "#5A2636",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
