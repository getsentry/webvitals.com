import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Web Vitals - Core Web Vitals Analysis Tool",
    short_name: "Web Vitals",
    description:
      "Analyze and optimize your website's Core Web Vitals performance metrics including LCP,  CLS, FCP, INP, and TTFB.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#667eea",
    icons: [
      {
        src: "/icon?<generated>",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon?<generated>",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
