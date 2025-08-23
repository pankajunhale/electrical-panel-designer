/* eslint-disable */
// @ts-nocheck
// Example usage of ProjectService CRUD operations
import { ProjectService } from "../lib/project-service";
import {
  ProjectCreateInput,
  ProjectUpdateInput,
  ProjectQueryInput,
  ProjectFilters,
  PanelStatus,
} from "../dto/project.dto";
import {
  validateProjectCreate,
  validateProjectUpdate,
} from "../schema/ga/project.schema";

// Example: Create a new project
export async function createProjectExample() {
  const projectData: ProjectCreateInput = {
    name: "New Electrical Panel Design",
    description: "Industrial panel design for manufacturing facility",
    clientId: "client-uuid-here",
    userId: "user-uuid-here",
    teamId: "team-uuid-here",
    createdBy: "admin-user-uuid",
  };

  const result = await ProjectService.createProject(projectData);

  if (result.success) {
    console.log("Project created:", result.data);
    return result.data;
  } else {
    console.error("Failed to create project:", result.message);
    if (result.error) console.error("Error details:", result.error);
    return null;
  }
}

// Example: Get project by ID
export async function getProjectExample(projectId: string) {
  const result = await ProjectService.getProjectById(projectId);

  if (result.success && result.data) {
    console.log("Project details:", {
      id: result.data.id,
      name: result.data.name,
      client: result.data.client?.name,
      owner: result.data.user?.name,
      team: result.data.team?.name,
      panelCount: result.data.panels?.length || 0,
      createdBy: result.data.createdByUser?.name,
      version: result.data.version,
    });
    return result.data;
  } else {
    console.error("Project not found:", result.message);
    return null;
  }
}

// Example: Get all projects with filters and pagination
export async function getProjectsExample() {
  const filters: ProjectFilters = {
    teamId: "team-uuid-here",
    search: "electrical",
    // status: PanelStatus.IN_PROGRESS
  };

  const result = await ProjectService.getProjects(filters, 1, 10);

  if (result.success && result.data) {
    console.log("Projects found:", result.data.projects.length);
    console.log("Pagination:", result.data.pagination);

    result.data.projects.forEach((project) => {
      console.log(`- ${project.name} (${project.panelCount} panels)`);
      console.log(
        `  Status: Draft(${project.panelStats.draft}), In Progress(${project.panelStats.inProgress}), Completed(${project.panelStats.completed})`
      );
    });

    return result.data;
  } else {
    console.error("Failed to fetch projects:", result.message);
    return null;
  }
}

// Example: Update project
export async function updateProjectExample(projectId: string) {
  const updateData: ProjectUpdateInput = {
    name: "Updated Panel Design Project",
    description: "Updated description with new requirements",
    updatedBy: "admin-user-uuid",
  };

  const result = await ProjectService.updateProject(projectId, updateData);

  if (result.success) {
    console.log("Project updated successfully");
    console.log("New version:", result.data?.version);
    return result.data;
  } else {
    console.error("Failed to update project:", result.message);
    return null;
  }
}

// Example: Delete project (soft delete)
export async function deleteProjectExample(projectId: string) {
  const result = await ProjectService.deleteProject(
    projectId,
    "admin-user-uuid"
  );

  if (result.success) {
    console.log("Project deleted successfully");
    return true;
  } else {
    console.error("Failed to delete project:", result.message);
    return false;
  }
}

// Example: Restore deleted project
export async function restoreProjectExample(projectId: string) {
  const result = await ProjectService.restoreProject(
    projectId,
    "admin-user-uuid"
  );

  if (result.success) {
    console.log("Project restored successfully");
    return result.data;
  } else {
    console.error("Failed to restore project:", result.message);
    return null;
  }
}

// Example: Get projects by team
export async function getTeamProjectsExample(teamId: string) {
  const result = await ProjectService.getProjectsByTeam(teamId, 1, 5);

  if (result.success && result.data) {
    console.log(`Found ${result.data.projects.length} projects for team`);
    return result.data.projects;
  } else {
    console.error("Failed to fetch team projects:", result.message);
    return [];
  }
}

// Example: Get projects by user
export async function getUserProjectsExample(userId: string) {
  const result = await ProjectService.getProjectsByUser(userId, 1, 10);

  if (result.success && result.data) {
    console.log(`User has ${result.data.projects.length} projects`);
    return result.data.projects;
  } else {
    console.error("Failed to fetch user projects:", result.message);
    return [];
  }
}

// Example: Search projects
export async function searchProjectsExample(
  searchTerm: string,
  teamId?: string
) {
  const result = await ProjectService.searchProjects(searchTerm, teamId, 1, 10);

  if (result.success && result.data) {
    console.log(
      `Found ${result.data.projects.length} projects matching "${searchTerm}"`
    );

    result.data.projects.forEach((project) => {
      console.log(`- ${project.name}`);
      if (project.description) {
        console.log(
          `  Description: ${project.description.substring(0, 100)}...`
        );
      }
    });

    return result.data.projects;
  } else {
    console.error("Search failed:", result.message);
    return [];
  }
}

// Example: Get project statistics
export async function getProjectStatsExample(teamId?: string) {
  const result = await ProjectService.getProjectStats(teamId);

  if (result.success && result.data) {
    console.log("Project Statistics:");
    console.log(`- Total Projects: ${result.data.totalProjects}`);
    console.log(`- Total Panels: ${result.data.totalPanels}`);
    console.log(
      `- Average Panels per Project: ${result.data.averagePanelsPerProject.toFixed(
        2
      )}`
    );
    console.log(
      `- Recent Projects (30 days): ${result.data.recentProjectsCount}`
    );

    console.log("Panel Status Distribution:");
    Object.entries(result.data.panelsByStatus).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}`);
    });

    return result.data;
  } else {
    console.error("Failed to fetch project statistics:", result.message);
    return null;
  }
}

// Example: Complete workflow
export async function completeProjectWorkflowExample() {
  console.log("=== Project CRUD Workflow Example ===\n");

  // 1. Create project
  console.log("1. Creating new project...");
  const newProject = await createProjectExample();
  if (!newProject) return;

  // 2. Get project details
  console.log("\n2. Fetching project details...");
  await getProjectExample(newProject.id);

  // 3. Update project
  console.log("\n3. Updating project...");
  await updateProjectExample(newProject.id);

  // 4. Get updated project
  console.log("\n4. Fetching updated project...");
  const updatedProject = await getProjectExample(newProject.id);

  // 5. Get project statistics
  console.log("\n5. Getting project statistics...");
  await getProjectStatsExample();

  // 6. Search projects
  console.log("\n6. Searching projects...");
  await searchProjectsExample("electrical");

  // 7. Delete project
  console.log("\n7. Deleting project...");
  await deleteProjectExample(newProject.id);

  // 8. Try to get deleted project
  console.log("\n8. Trying to fetch deleted project...");
  await getProjectExample(newProject.id);

  // 9. Restore project
  console.log("\n9. Restoring project...");
  await restoreProjectExample(newProject.id);

  // 10. Verify restoration
  console.log("\n10. Verifying project restoration...");
  await getProjectExample(newProject.id);

  console.log("\n=== Workflow Complete ===");
}

// Example: Error handling patterns
export async function errorHandlingExample() {
  // Example of handling validation errors
  try {
    const invalidData = {
      name: "", // Empty name should fail validation
      createdBy: "invalid-uuid", // Invalid UUID should fail
    } as ProjectCreateInput;

    const result = await ProjectService.createProject(invalidData);

    if (!result.success) {
      console.error("Validation failed:", result.message);
      if (result.error) {
        console.error("Error details:", result.error);
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }

  // Example of handling not found errors
  const result = await ProjectService.getProjectById("non-existent-id");
  if (!result.success) {
    console.log("Expected error for non-existent project:", result.message);
  }
}

// Export all examples for easy testing
export const ProjectExamples = {
  create: createProjectExample,
  getById: getProjectExample,
  getAll: getProjectsExample,
  update: updateProjectExample,
  delete: deleteProjectExample,
  restore: restoreProjectExample,
  getByTeam: getTeamProjectsExample,
  getByUser: getUserProjectsExample,
  search: searchProjectsExample,
  getStats: getProjectStatsExample,
  completeWorkflow: completeProjectWorkflowExample,
  errorHandling: errorHandlingExample,
};
