import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThesisRoom | The research behind the conviction",
  description: "An evidence-first investment research workspace. Connect sources, investigate changes, and keep your thesis accountable.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
