import React from "react";

interface PanelBlockProps {
  type: string;
  label: string;
  equipment?: {
    description: string;
    rating: number;
    starterType: string;
  };
}

const COLOR_MAP: Record<string, string> = {
  HBB: "bg-blue-200 text-blue-900 border-blue-400",
  VBB: "bg-purple-200 text-purple-900 border-purple-400",
  CBC: "bg-green-200 text-green-900 border-green-400",
  CTF: "bg-orange-200 text-orange-900 border-orange-400",
  SPARE: "bg-gray-200 text-gray-800 border-gray-400",
  incomer: "bg-red-200 text-red-900 border-red-400",
  feeder: "bg-yellow-200 text-yellow-900 border-yellow-400",
  S_D: "bg-blue-100 text-blue-800 border-blue-300",
  VFD: "bg-green-100 text-green-800 border-green-300",
  DOL: "bg-yellow-100 text-yellow-800 border-yellow-300",
  DEFAULT: "bg-gray-100 text-gray-800 border-gray-300",
};

export function PanelBlock({ type, label, equipment }: PanelBlockProps) {
  let color = COLOR_MAP[type] || COLOR_MAP.DEFAULT;
  if (type === "equipment" && equipment) {
    if (
      equipment.starterType === "S/D" ||
      equipment.starterType === "Star-Delta"
    )
      color = COLOR_MAP.S_D;
    if (equipment.starterType === "VFD") color = COLOR_MAP.VFD;
    if (equipment.starterType === "DOL") color = COLOR_MAP.DOL;
  }

  return (
    <div
      className={`grid-stack-item-content ${color} p-2 rounded border text-xs font-semibold text-center flex flex-col justify-center h-full w-full`}
      style={{
        pointerEvents: "none", // Allow resize handles to receive events
        position: "relative",
        zIndex: 1,
      }}
    >
      <span className="font-bold">{label}</span>
      {equipment && (
        <>
          <span className="text-xs">{equipment.rating}kW</span>
          <span className="text-xs opacity-75">{equipment.starterType}</span>
        </>
      )}
    </div>
  );
}
