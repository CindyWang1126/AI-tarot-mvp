import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const origin = "https://ai-tarot.timeflow.tw";
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${origin.replace(/\/$/, "")}/sitemap.xml`,
  };
}
