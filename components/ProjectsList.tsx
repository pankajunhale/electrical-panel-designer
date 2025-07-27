"use client";

import { ProjectDto } from "@/dto/project.dto";
import { useState, useEffect } from "react";

export function ProjectsList() {
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setProjects([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading projects...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Projects</h2>

      {/* Create Project Form */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Create New Project</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.currentTarget.reset();
          }}
        >
          <div className="flex gap-2">
            <input
              name="name"
              placeholder="Project name"
              required
              className="flex-1 px-3 py-2 border rounded"
            />
            <input
              name="description"
              placeholder="Description"
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>

      {/* Projects List */}
      <div className="space-y-2">
        {projects.length === 0 ? (
          <p className="text-gray-500">No projects found.</p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="p-4 border rounded hover:bg-gray-50"
            >
              <h3 className="font-semibold">{project.name}</h3>
              {project.description && (
                <p className="text-gray-600 mt-1">{project.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Created: {new Date(project.createdAt!).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
