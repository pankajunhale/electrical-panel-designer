import React, { useState } from "react";

interface ProjectCreationFormProps {
  onNext: (data: { name: string; description: string }) => void;
}

export function ProjectCreationForm({ onNext }: ProjectCreationFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onNext({ name, description });
      }}
      className="space-y-4 max-w-md mx-auto"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Project Name</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full border rounded px-2 py-1"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Next
      </button>
    </form>
  );
}
