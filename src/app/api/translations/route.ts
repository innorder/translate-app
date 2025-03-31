import { NextRequest, NextResponse } from "next/server";

// This is a simple example of how you might implement a translations API
// In a real application, you would connect to a database or other storage

// Mock data for demonstration
const mockTranslations: Record<
  string,
  Record<string, Record<string, string>>
> = {
  default: {
    en: {
      welcome: "Welcome to Translation Management",
      hello: "Hello, {{name}}!",
      goodbye: "Goodbye",
      save: "Save",
      cancel: "Cancel",
      add: "Add",
      delete: "Delete",
      edit: "Edit",
    },
    fr: {
      welcome: "Bienvenue à la Gestion de Traduction",
      hello: "Bonjour, {{name}}!",
      goodbye: "Au revoir",
      save: "Enregistrer",
      cancel: "Annuler",
      add: "Ajouter",
      delete: "Supprimer",
      edit: "Modifier",
    },
    es: {
      welcome: "Bienvenido a la Gestión de Traducción",
      hello: "Hola, {{name}}!",
      goodbye: "Adiós",
      save: "Guardar",
      cancel: "Cancelar",
      add: "Añadir",
      delete: "Eliminar",
      edit: "Editar",
    },
  },
  admin: {
    en: {
      dashboard: "Dashboard",
      settings: "Settings",
      users: "Users",
      projects: "Projects",
    },
    fr: {
      dashboard: "Tableau de bord",
      settings: "Paramètres",
      users: "Utilisateurs",
      projects: "Projets",
    },
    es: {
      dashboard: "Panel de control",
      settings: "Configuración",
      users: "Usuarios",
      projects: "Proyectos",
    },
  },
};

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Project-ID",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const namespace = searchParams.get("namespace") || "default";
  const locale = searchParams.get("locale") || "en";

  // Get authorization header
  const authHeader = request.headers.get("authorization");
  const projectId = request.headers.get("project-id");

  // In a real application, validate the API key and project ID
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  try {
    // Get translations for the requested namespace and locale
    const translations = mockTranslations[namespace]?.[locale] || {};

    // Return the translations
    return NextResponse.json(translations, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching translations:", error);
    return NextResponse.json(
      { error: "Failed to fetch translations" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      },
    );
  }
}
