import type { Metadata } from "next";
import "@/app/globals.css";

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://ai-tarot.timeflow.tw",
);

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "AI Tarot Interactive Experience｜Timeflow",
  description:
    "一個結合 AI 與結構化塔羅知識的互動式反思體驗，以三張牌整理問題脈絡、行動方向與值得思考的下一步。",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: "/",
    siteName: "AI Tarot",
    title: "AI Tarot Interactive Experience｜Timeflow",
    description: "AI × Structured Tarot Knowledge 的互動式反思體驗。",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tarot Interactive Experience｜Timeflow",
    description: "問一個問題，抽三張牌，看見另一個思考角度。",
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
