import { ProjectDto, CreateProjectDto, UpdateProjectDto } from "@/dto/project.dto";

// Mock data store - in a real app, this would be connected to a database
const projects: ProjectDto[] = [
  {
    id: "1",
    name: "Office Building Electrical System",
    description: "Complete electrical panel design for a 10-story office building",
    client: "ABC Construction",
    location: "New York, NY",
    status: "Active",
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    budget: 150000,
    priority: "High",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Manufacturing Plant Upgrade",
    description: "Electrical panel modernization for manufacturing facility",
    client: "XYZ Manufacturing",
    location: "Chicago, IL",
    status: "Completed",
    startDate: "2023-08-01",
    endDate: "2023-12-15",
    budget: 250000,
    priority: "Critical",
    createdAt: new Date("2023-08-01"),
    updatedAt: new Date("2023-12-15"),
  },
  {
    id: "3",
    name: "Residential Complex Wiring",
    description: "Electrical systems for a new residential development",
    client: "DEF Developers",
    location: "Los Angeles, CA",
    status: "On Hold",
    startDate: "2024-03-01",
    budget: 75000,
    priority: "Medium",
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
  },
];

export class ProjectService {
  static async getAllProjects(): Promise<ProjectDto[]> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...projects].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static async getProjectById(id: string): Promise<ProjectDto | null> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return projects.find((project) => project.id === id) || null;
  }

  static async createProject(data: CreateProjectDto): Promise<ProjectDto> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    const newProject: ProjectDto = {
      ...data,
      id: (projects.length + 1).toString(),
      budget: data.budget ? parseFloat(data.budget.toString()) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    projects.push(newProject);
    return newProject;
  }

  static async updateProject(data: UpdateProjectDto): Promise<ProjectDto | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    const index = projects.findIndex((project) => project.id === data.id);
    if (index === -1) {
      return null;
    }

    const updatedProject: ProjectDto = {
      ...projects[index],
      ...data,
      budget: data.budget ? parseFloat(data.budget.toString()) : projects[index].budget,
      updatedAt: new Date(),
    };

    projects[index] = updatedProject;
    return updatedProject;
  }

  static async deleteProject(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    const index = projects.findIndex((project) => project.id === id);
    if (index === -1) {
      return false;
    }

    projects.splice(index, 1);
    return true;
  }

  static async getProjectsByStatus(status: ProjectDto["status"]): Promise<ProjectDto[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return projects.filter((project) => project.status === status);
  }

  static async searchProjects(query: string): Promise<ProjectDto[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const lowercaseQuery = query.toLowerCase();
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(lowercaseQuery) ||
        project.client.toLowerCase().includes(lowercaseQuery) ||
        project.location.toLowerCase().includes(lowercaseQuery) ||
        project.description?.toLowerCase().includes(lowercaseQuery)
    );
  }
}