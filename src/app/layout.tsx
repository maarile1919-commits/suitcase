import type { Metadata } from "next";
import { Jua } from "next/font/google";
import "./globals.css";

const jua = Jua({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "게으른 여행자 (The Lazy Packer)",
  description: "신나는 여행만 생각하세요. 귀찮은 짐싸기는 AI가 완벽하게 끝낼게요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${jua.className} bg-gray-50 min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
