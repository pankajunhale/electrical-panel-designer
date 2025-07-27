import React from "react";

interface Panel {
  id: string;
  name: string;
  location: string;
}

interface PanelsTableProps {
  panels: Panel[];
  onSelect: (panel: Panel) => void;
}

export function PanelsTable({ panels, onSelect }: PanelsTableProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold mb-2">Panels</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Location</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {panels.map((panel) => (
            <tr key={panel.id}>
              <td className="border px-2 py-1">{panel.id}</td>
              <td className="border px-2 py-1">{panel.name}</td>
              <td className="border px-2 py-1">{panel.location}</td>
              <td className="border px-2 py-1">
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                  onClick={() => onSelect(panel)}
                >
                  Design
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
