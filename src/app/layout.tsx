import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChatGauntlet — Customer Support Training Simulator",
  description: "Train before the real thing. Handle multiple AI-powered customer chats simultaneously.",
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
