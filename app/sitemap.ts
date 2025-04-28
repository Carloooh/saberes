import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://saberes.elquisco.cl";

  const routes = [
    "",
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
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  return routes;
}
