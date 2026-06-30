import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UML クラス図エディタ",
  description: "ブラウザ完結の UML クラス図作図ツール",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="h-full w-full overflow-hidden">{children}</body>
    </html>
  );
}
