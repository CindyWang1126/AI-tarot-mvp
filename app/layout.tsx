import type { Metadata } from "next";
import "@/app/globals.css";

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://ai-tarot.timeflow.tw",
);

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "AI Tarot｜三張牌的互動反思體驗｜Timeflow",
  description:
    "留下一個問題，從三張牌裡看見另一種理解。由 AI 結合牌義、位置與問題脈絡，陪您整理當下的想法。",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: "/",
    siteName: "AI Tarot",
    title: "AI Tarot｜三張牌的互動反思體驗",
    description: "留下一個問題，從三張牌裡看見另一種理解。",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tarot｜三張牌的互動反思體驗",
    description: "留下一個問題，從三張牌裡看見另一種理解。",
    images: ["/opengraph-image"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AI Tarot Interactive Experience",
  applicationCategory: "EntertainmentApplication",
  operatingSystem: "Web",
  description: metadata.description,
  creator: {
    "@type": "Organization",
    name: "Timeflow 時序有限公司",
    url: "https://timeflow.tw",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>
        {children}
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </body>
    </html>
  );
}
