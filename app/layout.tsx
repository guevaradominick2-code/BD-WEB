import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Our Little Universe", template: "%s · Our Little Universe" },
  description: "Un pequeño universo creado para celebrar a mi persona favorita.",
  applicationName: "Our Little Universe",
  robots: { index: false, follow: false },
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
