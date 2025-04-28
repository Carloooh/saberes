import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/portalAdministrador/",
        "/portalDocente/",
        "/portalAlumno/",
        "/perfil/",
      ],
    },
    sitemap: "https://saberes.elquisco.cl/sitemap.xml",
  };
}
