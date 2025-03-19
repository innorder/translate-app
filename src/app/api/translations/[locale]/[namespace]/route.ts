import { NextRequest, NextResponse } from "next/server";

// This is an enhanced version of the translations API that supports
// dynamic routes for locale and namespace

// Mock data for demonstration - in a real app, this would come from your database
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

export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string; namespace: string } },
) {
  // Get parameters from the URL
  const { locale, namespace } = params;

  // Get authorization header
  const authHeader = request.headers.get("authorization");
  const projectId = request.headers.get("project-id");

  // In a real application, validate the API key and project ID
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get translations for the requested namespace and locale
  const translations = mockTranslations[namespace]?.[locale] || {};

  // Return the translations
  return NextResponse.json(translations);
}
