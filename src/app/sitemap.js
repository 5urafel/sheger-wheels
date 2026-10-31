import { INITIAL_CARS } from "@/lib/storage";

export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sheggarwheels.et";

  const publicRoutes = [
    "",
    "/cars",
    "/signin",
    "/signup",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));

  const carUrls = INITIAL_CARS.filter((c) => c.status === "approved").map((car) => ({
    url: `${baseUrl}/cars/${car.id}`,
    lastModified: car.createdAt || new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...publicRoutes, ...carUrls];
}
