import { PanelDataImportForm } from "@/components/forms/PanelDataImportForm";
import { prisma } from "@/lib/prisma";

async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export default async function DataImportPage() {
  const projects = await getProjects();

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Panel Data Import</h1>
        <p className="text-muted-foreground mt-2">
          Import electrical equipment data from tabular format into your panel
          design database.
        </p>
      </div>

      <PanelDataImportForm projects={projects} />
    </div>
  );
}
