"use client";

import { useState, useEffect } from "react";

export function ProjectsList() {
  // const [projects, setProjects] = useState([]); // Removed as it's not currently used
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // setProjects([]); // Removed since projects state was removed
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
    </div>
  );
}
