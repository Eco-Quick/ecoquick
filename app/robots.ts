import type { MetadataRoute } from "next";

const BASE_URL = "https://www.ecoquickdelivery.co.uk";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/business", "/help"],
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/dashboard",
          "/driver",
          "/driver/*",
          "/account",
          "/account/*",
          "/notifications",
          "/orders",
          "/order/*",
          "/book/*",
          "/verify",
          "/login",
          "/signup",
          "/logout",
          "/impact",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
