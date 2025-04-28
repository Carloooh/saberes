import { Geist, Geist_Mono } from "next/font/google";
import { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import "./globals.css";
import ToasterClient from "@/app/components/ToasterClient";
import JsonLd from "@/app/components/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saberes | Programa Educativo El Quisco",
  description:
    "Plataforma oficial del programa educativo Saberes en El Quisco, Región de Valparaíso. Ofrecemos cursos, talleres, actividades y recursos para estudiantes y docentes. Matrícula abierta para nuevos alumnos. Formación de calidad para todas las edades.",
  keywords:
    "Saberes, El Quisco, educación, municipal, cursos, programa educativo, aprendizaje, matrícula, matricula, matrículas, matriculas, curso, educación, educacion, clases, talleres, formación, formacion, capacitación, capacitacion, enseñanza, aprendizaje, estudiantes, alumnos, docentes, profesores, Chile, Valparaíso, región de Valparaíso, litoral central, educación comunitaria, educación continua, desarrollo profesional, habilidades, competencias",
  authors: [{ name: "Programa Saberes" }],
  creator: "Programa Saberes El Quisco",
  publisher: "Saberes",
  openGraph: {
    title: "Saberes | Programa Educativo El Quisco",
    description:
      "Plataforma educativa del programa Saberes en El Quisco. Ofrecemos cursos, actividades y recursos para estudiantes y docentes.",
    url: "https://saberes.elquisco.cl",
    siteName: "Saberes",
    images: [
      {
        url: "/logo_saberes.webp",
        width: 800,
        height: 600,
        alt: "Logo Saberes",
      },
    ],
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saberes | Programa Educativo El Quisco",
    description:
      "Plataforma educativa del programa Saberes en El Quisco. Ofrecemos cursos, actividades y recursos para estudiantes y docentes.",
    images: ["/logo_saberes.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://saberes.elquisco.cl",
  },
  verification: {
    google: "EvGbhWt9D-uXqRpA0gVRoR4tP22g7uVniActqHBC_VI",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Saberes",
    alternateName: "Programa Saberes El Quisco",
    url: "https://saberes.elquisco.cl",
    logo: "https://saberes.elquisco.cl/logo_saberes.webp",
    description:
      "Plataforma educativa del programa Saberes en El Quisco. Ofrecemos cursos, actividades y recursos para estudiantes y docentes.",
    parentOrganization: {
      "@type": "GovernmentOrganization",
      name: "Municipalidad de El Quisco",
    },
  };

  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=arrow_forward"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/IconoSaberes.webp" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <JsonLd data={organizationSchema} />
        <Header />
        <div className="flex-grow">{children}</div>
        <Footer />
        <ToasterClient />
      </body>
    </html>
  );
}
