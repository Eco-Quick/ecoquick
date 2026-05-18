import type { MetadataRoute } from "next";

const BASE_URL = "https://www.ecoquickdelivery.co.uk";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: BASE_URL, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/business`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/help`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/login`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/signup`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
