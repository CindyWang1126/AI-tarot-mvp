import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-tarot.timeflow.tw";
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${origin.replace(/\/$/, "")}/sitemap.xml`,
  };
}
