import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://saberes.elquisco.cl";
  const currentDate = new Date();

  // Ruta principal con máxima prioridad
  const mainRoute = {
    url: baseUrl,
    lastModified: currentDate,
    changeFrequency: "daily" as const,
    priority: 1.0,
  };

  // Rutas secundarias
  const secondaryRoutes = [
    "/actividades",
    "/faq",
    "/galeria",
    "/noticias",
    "/sedes",
    "/matriculaEstudiante",
    "/registroFuncionario",
    "/restablecer",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === "/actividades" ? "weekly" as const : "monthly" as const,
    priority: route === "/actividades" ? 0.7 : 0.6,
  }));

  return [mainRoute, ...secondaryRoutes];
}
