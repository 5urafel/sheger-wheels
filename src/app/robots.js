export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sheggarwheels.et";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/cars", "/cars/*", "/signin", "/signup"],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/bookings",
          "/bookings/*",
          "/checkout",
          "/checkout/*",
          "/owner",
          "/owner/*",
          "/admin",
          "/admin/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
